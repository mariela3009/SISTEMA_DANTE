<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComboController extends Controller
{
    /** GET /api/combos */
    public function index()
    {
        $combos = Combo::with(['products'])->orderBy('created_at', 'desc')->get();
        return response()->json($combos->map(fn($c) => $this->formatCombo($c)));
    }

    /** POST /api/combos */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'image_url'     => 'nullable|string',
            'special_price' => 'required|numeric|min:0',
            'is_active'     => 'boolean',
            'start_date'    => 'nullable|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
            'items'         => 'required|array|min:2',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $combo = DB::transaction(function () use ($data) {
            $combo = Combo::create([
                'name'          => $data['name'],
                'description'   => $data['description'] ?? null,
                'image_url'     => $data['image_url'] ?? null,
                'special_price' => $data['special_price'],
                'is_active'     => $data['is_active'] ?? true,
                'start_date'    => $data['start_date'] ?? null,
                'end_date'      => $data['end_date'] ?? null,
            ]);

            $syncData = [];
            foreach ($data['items'] as $item) {
                $syncData[$item['product_id']] = ['quantity' => $item['quantity']];
            }
            $combo->products()->sync($syncData);
            return $combo;
        });

        $combo->load('products');
        return response()->json($this->formatCombo($combo), 201);
    }

    /** PUT /api/combos/{combo} */
    public function update(Request $request, Combo $combo)
    {
        $data = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'image_url'     => 'nullable|string',
            'special_price' => 'sometimes|numeric|min:0',
            'is_active'     => 'boolean',
            'start_date'    => 'nullable|date',
            'end_date'      => 'nullable|date',
            'items'         => 'sometimes|array|min:2',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
        ]);

        DB::transaction(function () use ($data, $combo) {
            $combo->update(array_filter([
                'name'          => $data['name'] ?? null,
                'description'   => $data['description'] ?? null,
                'image_url'     => $data['image_url'] ?? null,
                'special_price' => $data['special_price'] ?? null,
                'is_active'     => $data['is_active'] ?? null,
                'start_date'    => $data['start_date'] ?? null,
                'end_date'      => $data['end_date'] ?? null,
            ], fn($v) => !is_null($v)));

            if (isset($data['items'])) {
                $syncData = [];
                foreach ($data['items'] as $item) {
                    $syncData[$item['product_id']] = ['quantity' => $item['quantity']];
                }
                $combo->products()->sync($syncData);
            }
        });

        $combo->load('products');
        return response()->json($this->formatCombo($combo));
    }

    /** DELETE /api/combos/{combo} */
    public function destroy(Combo $combo)
    {
        $combo->delete();
        return response()->json(['message' => 'Combo eliminado.']);
    }

    /** GET /api/combos/ai-suggestions */
    public function aiSuggestions()
    {
        // 1. Minería de datos: Buscar pares de productos comprados juntos en la misma orden
        $pairs = DB::table('sale_items as a')
            ->join('sale_items as b', function ($join) {
                $join->on('a.sale_id', '=', 'b.sale_id')
                     ->whereRaw('a.product_id < b.product_id');
            })
            ->select('a.product_id as product_1', 'b.product_id as product_2', DB::raw('COUNT(*) as frequency'))
            ->groupBy('product_1', 'product_2')
            ->having('frequency', '>=', 1)
            ->orderByDesc('frequency')
            ->limit(10)
            ->get();

        // Si no hay ventas suficientes, crear algunas simuladas para el prototipo/demo si está vacío
        if ($pairs->isEmpty()) {
            $products = \App\Models\Product::where('is_active', true)->inRandomOrder()->take(4)->get();
            if ($products->count() >= 2) {
                $pairs = collect([
                    (object)['product_1' => $products[0]->id, 'product_2' => $products[1]->id, 'frequency' => rand(15, 45)],
                    (object)['product_1' => $products[2]->id ?? $products[0]->id, 'product_2' => $products[3]->id ?? $products[1]->id, 'frequency' => rand(5, 14)]
                ]);
            }
        }

        $suggestions = [];
        $existingCombos = Combo::with('products')->get();

        foreach ($pairs as $pair) {
            // Check si este par exacto ya es un combo de 2 productos
            $alreadyExists = $existingCombos->contains(function ($combo) use ($pair) {
                $pIds = $combo->products->pluck('id')->sort()->values()->toArray();
                return count($pIds) === 2 && $pIds[0] == $pair->product_1 && $pIds[1] == $pair->product_2;
            });

            if ($alreadyExists) continue;

            $p1 = \App\Models\Product::find($pair->product_1);
            $p2 = \App\Models\Product::find($pair->product_2);

            if (!$p1 || !$p2) continue;

            $originalPrice = $p1->price + $p2->price;
            // Descuento sugerido del 15%
            $suggestedPrice = round($originalPrice * 0.85, 1); // Redondear a un decimal
            if ($suggestedPrice == 0) $suggestedPrice = 0.01;

            $suggestions[] = [
                'id' => 'ai_sugg_' . $p1->id . '_' . $p2->id,
                'suggested_name' => 'Combo: ' . explode(' ', $p1->name)[0] . ' + ' . explode(' ', $p2->name)[0],
                'frequency' => $pair->frequency,
                'original_price' => $originalPrice,
                'suggested_price' => $suggestedPrice,
                'items' => [
                    ['product_id' => $p1->id, 'name' => $p1->name, 'price' => $p1->price, 'quantity' => 1],
                    ['product_id' => $p2->id, 'name' => $p2->name, 'price' => $p2->price, 'quantity' => 1],
                ]
            ];

            if (count($suggestions) >= 3) break; // Top 3
        }

        return response()->json($suggestions);
    }

    private function formatCombo(Combo $combo): array
    {
        $combo->loadMissing('products');
        return [
            'id'                  => $combo->id,
            'name'                => $combo->name,
            'description'         => $combo->description,
            'image_url'           => $combo->image_url,
            'special_price'       => $combo->special_price,
            'is_active'           => $combo->is_active,
            'is_currently_active' => $combo->is_currently_active,
            'start_date'          => $combo->start_date?->toISOString(),
            'end_date'            => $combo->end_date?->toISOString(),
            'original_price'      => $combo->original_price,
            'savings_percentage'  => $combo->savings_percentage,
            'items'               => $combo->products->map(fn($p) => [
                'product_id' => $p->id,
                'name'       => $p->name,
                'price'      => $p->price,
                'quantity'   => $p->pivot->quantity,
                'category'   => $p->category?->name,
            ])->values(),
        ];
    }
}
