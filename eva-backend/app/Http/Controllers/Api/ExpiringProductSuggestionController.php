<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Category;
use App\Models\Product;
use App\Models\RecipeItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpiringProductSuggestionController extends Controller
{
    /**
     * GET /api/ai/expiring-suggestions
     * Detecta ingredientes próximos a vencer con alto stock y sugiere nuevos productos.
     */
    public function index(Request $request)
    {
        set_time_limit(300); // Prevenir timeout de PHP (30s) al esperar a Gemini

        $days = (int) $request->get('days', 14); // umbral en días (default: 2 semanas)

        // 1. Ingredientes próximos a vencer o con exceso de stock/sin rotación
        $expiring = Ingredient::where('is_active', true)
            ->where('stock_actual', '>', 0)
            ->where(function ($query) use ($days) {
                // Condición A: A punto de vencer (pero NO vencidos)
                $query->where(function ($q) use ($days) {
                    $q->whereNotNull('fecha_vencimiento')
                      ->whereDate('fecha_vencimiento', '>=', now())
                      ->whereDate('fecha_vencimiento', '<=', now()->addDays($days));
                })
                // Condición B: Mucho tiempo en stock sin rotación (Exceso de stock, y sin updates recientes)
                ->orWhere(function ($q) {
                    $q->where('stock_actual', '>', DB::raw('stock_minimo * 2'))
                      ->whereDate('updated_at', '<=', now()->subDays(7)); // Más de 7 días sin movimiento
                });
            })
            ->orderByRaw('ISNULL(fecha_vencimiento), fecha_vencimiento ASC')
            ->get();

        // 2. Obtener sugerencias de Gemini en batch para no ralentizar la API
        $allIngredients = Ingredient::where('is_active', true)->get(['id', 'name', 'unit']);
        $geminiSuggestions = $this->fetchGeminiSuggestionsBatch($expiring, $allIngredients);

        // 3. Para cada ingrediente, calcular urgencia y adjuntar sugerencia de producto
        $suggestions = $expiring->map(function ($ingredient) use ($geminiSuggestions) {
            $daysLeft    = now()->diffInDays($ingredient->fecha_vencimiento, false);
            $urgency     = $this->getUrgency($daysLeft);
            $suggestions = $geminiSuggestions[$ingredient->id] ?? $this->getFallbackSuggestions($ingredient);

            // ¿Ya existe un producto que usa este ingrediente?
            $existingProducts = RecipeItem::where('ingredient_id', $ingredient->id)
                ->with('product:id,name,is_active')
                ->get()
                ->map(fn($r) => [
                    'id'        => $r->product->id,
                    'name'      => $r->product->name,
                    'is_active' => $r->product->is_active,
                ]);

            return [
                'ingredient'       => [
                    'id'               => $ingredient->id,
                    'name'             => $ingredient->name,
                    'unit'             => $ingredient->unit,
                    'stock_actual'     => $ingredient->stock_actual,
                    'stock_minimo'     => $ingredient->stock_minimo,
                    'fecha_vencimiento'=> $ingredient->fecha_vencimiento->format('Y-m-d'),
                    'dias_restantes'   => (int) $daysLeft,
                ],
                'urgency'          => $urgency,
                'existing_products'=> $existingProducts,
                'suggestions'      => $suggestions,
            ];
        });

        // 3. Estadísticas generales
        $stats = [
            'total_expiring'       => $expiring->count(),
            'critical'             => $expiring->filter(fn($i) => now()->diffInDays($i->fecha_vencimiento, false) <= 3)->count(),
            'warning'              => $expiring->filter(fn($i) => now()->diffInDays($i->fecha_vencimiento, false) > 3 && now()->diffInDays($i->fecha_vencimiento, false) <= 7)->count(),
            'attention'            => $expiring->filter(fn($i) => now()->diffInDays($i->fecha_vencimiento, false) > 7)->count(),
        ];

        return response()->json([
            'stats'       => $stats,
            'suggestions' => $suggestions,
            'days_window' => $days,
        ]);
    }

    /**
     * POST /api/ai/expiring-suggestions/create-product
     * Crea el producto sugerido directamente desde el módulo.
     */
    public function createProduct(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'price'        => 'required|numeric|min:0',
            'category_id'  => 'required|exists:categories,id',
            'recipe_items' => 'required|array|min:1',
            'recipe_items.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipe_items.*.quantity'      => 'required|numeric|min:0.001',
        ]);

        $product = DB::transaction(function () use ($data) {
            $product = Product::create([
                'name'        => $data['name'],
                'price'       => $data['price'],
                'category_id' => $data['category_id'],
                'is_active'   => true,
            ]);

            foreach ($data['recipe_items'] as $item) {
                RecipeItem::create([
                    'product_id'    => $product->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity'      => $item['quantity'],
                ]);
            }

            return $product;
        });

        $product->load(['category', 'recipeItems.ingredient']);

        return response()->json([
            'message' => "Producto \"{$product->name}\" creado y activado exitosamente.",
            'product' => [
                'id'       => $product->id,
                'name'     => $product->name,
                'price'    => $product->price,
                'category' => $product->category->name,
                'recipe'   => $product->recipeItems->map(fn($r) => [
                    'ingredient' => $r->ingredient->name,
                    'quantity'   => $r->quantity,
                    'unit'       => $r->ingredient->unit,
                ]),
            ],
        ], 201);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private function getUrgency(int $days): array
    {
        if ($days <= 3) return ['level' => 'critical', 'label' => 'Crítico',   'color' => 'red',    'icon' => 'emergency'];
        if ($days <= 7) return ['level' => 'warning',  'label' => 'Urgente',   'color' => 'orange', 'icon' => 'warning'];
        return              ['level' => 'attention', 'label' => 'Atención',  'color' => 'yellow', 'icon' => 'schedule'];
    }

    private function fetchGeminiSuggestionsBatch($ingredients, $allIngredients): array
    {
        if ($ingredients->isEmpty()) {
            return [];
        }

        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            Log::warning('Gemini API key no configurada. Usando sugerencias por defecto.');
            return [];
        }

        $ingredientsList = $ingredients->map(function ($i) {
            return "ID: {$i->id}, Nombre: {$i->name}, Unidad: {$i->unit}";
        })->join("; ");

        $allIngredientsList = $allIngredients->map(function ($i) {
            return "ID: {$i->id}, Nombre: {$i->name}, Unidad: {$i->unit}";
        })->join(" | ");

        $prompt = <<<EOT
Eres un creador experto de recetas para cafetería. 
1. Tienes estos INGREDIENTES PRINCIPALES próximos a vencer o con mucho tiempo en stock (sin rotación): [$ingredientsList].
2. Tienes este CATÁLOGO COMPLETO de insumos disponibles: [$allIngredientsList].

Para CADA ingrediente principal de la lista 1, debes sugerir estrictamente 2 ideas de productos que lo utilicen como insumo protagonista para consumirlo rápidamente.
REGLAS ESTRICTAS:
- NO confundas los insumos principales. Si el ingrediente principal es Plátano, no uses Mango como si fuera el principal.
- Debes crear una RECETA COMPLETA (`full_recipe`) para cada producto sugerido.
- La receta debe incluir obligatoriamente el ingrediente principal, además de otros ingredientes seleccionados EXCLUSIVAMENTE del catálogo completo (lista 2). 
- Si no encuentras en el catálogo los insumos necesarios para crear una receta completa y real, NO SUGIERAS ESE PRODUCTO. Inventa otro producto que sí pueda prepararse solo con lo que hay en el catálogo.
- NO inventes ingredientes que no estén en el catálogo. Usa exactamente el `ingredient_id` del catálogo.
- Proporciona una cantidad numérica (`quantity`) para cada insumo de la receta (en su unidad de medida).
- Devuelve ÚNICAMENTE un JSON válido, sin bloques de código, sin comillas invertidas, con esta estructura exacta:
[
  {
    "ingredient_id": ID_DEL_INSUMO_PRINCIPAL,
    "suggestions": [
      {
        "product_name": "Nombre",
        "suggested_price": 5.50,
        "category_name": "Bebidas Frias",
        "description": "Descripción corta de por qué es una buena idea",
        "full_recipe": [
          {
            "ingredient_id": ID_DEL_CATALOGO,
            "ingredient_name": "Nombre exacto del catalogo",
            "quantity": 1.5,
            "unit": "kg"
          }
        ]
      }
    ]
  }
]
EOT;

        try {
            $response = Http::timeout(60)
                ->withOptions([
                    'curl' => [
                        CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4, // Forzar IPv4 para evitar stalls en Windows
                    ]
                ])
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                // Limpiar posibles bloques de código markdown
                $text = preg_replace('/```json/i', '', $text);
                $text = preg_replace('/```/', '', $text);
                $text = trim($text);

                // Parse the JSON array
                $parsed = json_decode($text, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::error("Error parseando JSON de Gemini: " . json_last_error_msg() . " -> " . $text);
                }

                if (is_array($parsed)) {
                    $result = [];
                    foreach ($parsed as $item) {
                        if (isset($item['ingredient_id']) && isset($item['suggestions'])) {
                            // Adjuntar datos extra requeridos por el frontend
                            $ingredientId = $item['ingredient_id'];
                            $ingModel = $ingredients->firstWhere('id', $ingredientId);
                            
                            $formattedSuggestions = array_map(function ($s) use ($ingModel) {
                                return [
                                    'product_name'    => $s['product_name'] ?? 'Especial',
                                    'suggested_price' => $s['suggested_price'] ?? 5.50,
                                    'category_name'   => $s['category_name'] ?? 'Especialidades',
                                    'description'     => $s['description'] ?? '',
                                    'full_recipe'     => $s['full_recipe'] ?? [[
                                        'ingredient_id' => $ingModel ? $ingModel->id : 0,
                                        'ingredient_name' => $ingModel ? $ingModel->name : '',
                                        'quantity' => 1,
                                        'unit' => $ingModel ? $ingModel->unit : ''
                                    ]]
                                ];
                            }, $item['suggestions']);
                            
                            $result[$ingredientId] = $formattedSuggestions;
                        }
                    }
                    return $result;
                }
            } else {
                Log::error('Error de Gemini API: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Excepción al conectar con Gemini: ' . $e->getMessage());
        }

        return [];
    }

    private function getFallbackSuggestions(Ingredient $ingredient): array
    {
        $name = $ingredient->name;
        return [[
            'product_name'    => "Especial de {$name}",
            'suggested_price' => 5.50,
            'category_name'   => 'Especialidades',
            'description'     => "Preparación del día destacando {$name} con alto stock, para consumirlo antes de su vencimiento. (Sugerencia generada por defecto)",
            'full_recipe'     => [[
                'ingredient_id' => $ingredient->id,
                'ingredient_name' => $ingredient->name,
                'quantity' => 1,
                'unit' => $ingredient->unit
            ]]
        ]];
    }

    private function suggestQuantity(string $unit): string
    {
        return match($unit) {
            'gr'     => '30-50 gr por porción',
            'kg'     => '0.05-0.1 kg por porción',
            'ml'     => '150-200 ml por porción',
            'l'      => '0.15-0.2 L por porción',
            'unidad' => '1 unidad por porción',
            default  => 'a criterio del chef',
        };
    }
}
