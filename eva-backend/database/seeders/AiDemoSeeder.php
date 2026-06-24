<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\InventoryMovement;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AiDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('=== Iniciando inyección de datos para Inteligencia Artificial ===');

        // 1. ARREGLAR FECHAS DE VENCIMIENTO DE INSUMOS
        $this->command->info('1. Ajustando fechas de vencimiento de insumos...');
        $ingredients = Ingredient::where('is_active', true)->get();
        
        $count = 0;
        foreach ($ingredients as $ingredient) {
            $count++;
            // Solo dejamos 1 insumo vencido (el primero)
            if ($count === 1) {
                $ingredient->fecha_vencimiento = Carbon::now()->subDays(2);
            } 
            // Ponemos 4 insumos próximos a vencer (en los próximos 2 a 5 días)
            elseif ($count >= 2 && $count <= 5) {
                $ingredient->fecha_vencimiento = Carbon::now()->addDays(rand(2, 5));
            } 
            // El resto vence en un mes o más (lejos de vencer)
            else {
                $ingredient->fecha_vencimiento = Carbon::now()->addDays(rand(30, 90));
            }

            // Asegurar que haya stock para que no salga todo como "Sin Stock"
            if ($ingredient->stock_actual <= $ingredient->stock_minimo) {
                $ingredient->stock_actual = $ingredient->stock_minimo + rand(50, 500);
            }

            $ingredient->save();
        }
        $this->command->info('   -> Fechas ajustadas. (1 Vencido, 4 Por Vencer, el resto OK).');

        // 2. GENERAR VENTAS HISTÓRICAS (Para Predicción de Demanda y Combos)
        $this->command->info('2. Generando historial de ventas para IA (Últimos 60 días)...');
        
        $products = Product::where('is_active', true)->get();
        if ($products->count() < 3) {
            $this->command->error('No hay suficientes productos para generar historial. Se cancela la siembra de ventas.');
            return;
        }

        // Seleccionamos productos para crear "Combos" artificiales que la IA detectará
        $coffee = $products->firstWhere('name', 'LIKE', '%Capuchino%') ?? $products[0];
        $pastry = $products->firstWhere('name', 'LIKE', '%Croissant%') ?? $products[1];
        
        $frappe = $products->firstWhere('name', 'LIKE', '%Frappuccino%') ?? $products[2];
        $cookie = $products->firstWhere('name', 'LIKE', '%Galleta%') ?? $products[3] ?? $products[2];

        $startDate = Carbon::now()->subDays(60);
        $endDate = Carbon::now();
        
        $salesCreated = 0;

        DB::beginTransaction();
        try {
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                // Cantidad de ventas por día (simula picos de venta los fines de semana)
                $isWeekend = $date->isWeekend();
                $salesCount = $isWeekend ? rand(15, 25) : rand(5, 15);

                for ($i = 0; $i < $salesCount; $i++) {
                    // Crear Venta Base
                    $sale = Sale::create([
                        'user_id' => 1, // Cajero
                        'client_id' => null,
                        'subtotal' => 0,
                        'tax' => 0,
                        'total' => 0,
                        'payment_method' => rand(0, 1) ? 'efectivo' : 'culqi',
                        'status' => 'completed',
                        'created_at' => $date->copy()->addHours(rand(8, 20))->addMinutes(rand(0, 59)), // Horario de cafetería
                        'updated_at' => $date->copy(),
                    ]);

                    $subtotal = 0;

                    // Decidir qué comprar
                    $purchaseType = rand(1, 100);

                    $itemsToBuy = [];

                    if ($purchaseType <= 35) {
                        // 35% de probabilidad: Compran el Combo 1 (Café + Postre)
                        $itemsToBuy[] = $coffee;
                        $itemsToBuy[] = $pastry;
                    } elseif ($purchaseType > 35 && $purchaseType <= 60) {
                        // 25% de probabilidad: Compran el Combo 2 (Frappe + Galleta)
                        $itemsToBuy[] = $frappe;
                        $itemsToBuy[] = $cookie;
                    } else {
                        // 40% de probabilidad: Compran 1 o 2 productos aleatorios
                        $randomCount = rand(1, 2);
                        for ($j = 0; $j < $randomCount; $j++) {
                            $itemsToBuy[] = $products->random();
                        }
                    }

                    // Evitar duplicados exactos en el array
                    $itemsToBuy = collect($itemsToBuy)->unique('id');

                    foreach ($itemsToBuy as $prod) {
                        $qty = rand(1, 2);
                        $price = $prod->price;
                        $itemSubtotal = $price * $qty;
                        $subtotal += $itemSubtotal;

                        SaleItem::create([
                            'sale_id' => $sale->id,
                            'product_id' => $prod->id,
                            'quantity' => $qty,
                            'unit_price' => $price,
                            'subtotal' => $itemSubtotal,
                            'status' => 'delivered',
                            'is_cancelled' => false,
                            'created_at' => $sale->created_at,
                            'updated_at' => $sale->created_at,
                        ]);

                        // Opcional: Podríamos crear InventoryMovement aquí, pero como solo queremos alimentar
                        // las IA de Demanda y Combos (que leen SaleItem), con esto basta para la Demo.
                        // Para la IA de Reabastecimiento, generamos algunos movimientos de consumo.
                        InventoryMovement::create([
                            'ingredient_id' => $ingredients->random()->id,
                            'user_id' => 1,
                            'type' => 'salida_venta',
                            'quantity' => rand(10, 50),
                            'saldo_cantidad' => rand(100, 500),
                            'reason' => 'Consumo por venta simulada',
                            'created_at' => $sale->created_at,
                            'updated_at' => $sale->created_at,
                        ]);
                    }

                    $tax = $subtotal * 0.18;
                    $total = $subtotal + $tax;

                    $sale->update([
                        'subtotal' => $subtotal,
                        'tax' => $tax,
                        'total' => $total,
                    ]);

                    $salesCreated++;
                }
            }
            DB::commit();
            $this->command->info("   -> Se generaron $salesCreated ventas históricas exitosamente.");
            $this->command->info('=== Inyección finalizada. La IA ahora tiene datos reales para calcular. ===');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Error generando ventas: " . $e->getMessage());
        }
    }
}
