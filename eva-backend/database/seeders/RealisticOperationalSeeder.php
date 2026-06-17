<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\RecipeItem;
use App\Models\InventoryMovement;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Client;
use App\Models\Category;
use Carbon\Carbon;

class RealisticOperationalSeeder extends Seeder
{
    public function run()
    {
        // 1. Setup Users
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Admin Test',
                'email' => 'admin@test.com',
                'password' => bcrypt('password'),
                'role' => 'admin'
            ]);
        }
        $cocina = User::where('role', 'cocina')->first();
        if (!$cocina) {
            $cocina = User::create([
                'name' => 'Cocina Test',
                'email' => 'cocina@test.com',
                'password' => bcrypt('password'),
                'role' => 'cocina'
            ]);
        }
        $cliente = Client::first();
        if (!$cliente) {
            $cliente = Client::create([
                'name' => 'Cliente General',
                'email' => 'general@test.com'
            ]);
        }
        $category = Category::first() ?? Category::create(['name' => 'Bebidas']);

        // 2. Truncate operational tables
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('sale_items')->truncate();
        DB::table('sales')->truncate();
        DB::table('inventory_movements')->truncate();
        DB::table('recipe_items')->truncate();
        DB::table('promotion_product')->truncate();
        DB::table('products')->truncate();
        DB::table('ingredients')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 3. Create Ingredients (with 0 stock to start, so Kardex has clean history)
        $ingredientsData = [
            ['name' => 'Café en Grano Blend', 'unit' => 'kg', 'stock_minimo' => 5],
            ['name' => 'Leche Entera', 'unit' => 'l', 'stock_minimo' => 10],
            ['name' => 'Jarabe de Vainilla', 'unit' => 'l', 'stock_minimo' => 2],
            ['name' => 'Azúcar Blanca', 'unit' => 'kg', 'stock_minimo' => 5],
            ['name' => 'Vaso 12oz', 'unit' => 'unidad', 'stock_minimo' => 100],
            ['name' => 'Tapa 12oz', 'unit' => 'unidad', 'stock_minimo' => 100],
            ['name' => 'Cacao en Polvo', 'unit' => 'kg', 'stock_minimo' => 3],
            ['name' => 'Croissant Congelado', 'unit' => 'unidad', 'stock_minimo' => 20],
            // CRITICOS
            ['name' => 'Fresas Frescas', 'unit' => 'kg', 'stock_minimo' => 2],
            ['name' => 'Leche de Almendras', 'unit' => 'l', 'stock_minimo' => 5]
        ];

        $ingredients = [];
        foreach ($ingredientsData as $data) {
            $ingredients[$data['name']] = Ingredient::create([
                'name' => $data['name'],
                'unit' => $data['unit'],
                'stock_actual' => 0,
                'costo_promedio' => 0,
                'stock_minimo' => $data['stock_minimo'],
                'fecha_vencimiento' => null,
                'is_active' => true
            ]);
        }

        // Set expirations for critical
        $ingredients['Fresas Frescas']->update(['fecha_vencimiento' => '2026-06-17']);
        $ingredients['Leche de Almendras']->update(['fecha_vencimiento' => '2026-06-18']);
        $ingredients['Leche Entera']->update(['fecha_vencimiento' => '2026-06-25']);
        $ingredients['Croissant Congelado']->update(['fecha_vencimiento' => '2026-06-20']);

        // 4. Record initial entries (purchases) on June 1 and 2
        $this->recordEntry($ingredients['Café en Grano Blend'], 10, 60.00, '2026-06-01 08:00:00', $admin); 
        $this->recordEntry($ingredients['Leche Entera'], 30, 4.50, '2026-06-01 08:15:00', $admin); 
        $this->recordEntry($ingredients['Jarabe de Vainilla'], 5, 25.00, '2026-06-01 08:30:00', $admin); 
        $this->recordEntry($ingredients['Azúcar Blanca'], 15, 3.80, '2026-06-01 08:45:00', $admin); 
        $this->recordEntry($ingredients['Vaso 12oz'], 500, 0.20, '2026-06-02 09:00:00', $admin); 
        $this->recordEntry($ingredients['Tapa 12oz'], 500, 0.10, '2026-06-02 09:15:00', $admin); 
        $this->recordEntry($ingredients['Cacao en Polvo'], 5, 35.00, '2026-06-02 09:30:00', $admin); 
        $this->recordEntry($ingredients['Croissant Congelado'], 50, 2.50, '2026-06-02 09:45:00', $admin); 
        $this->recordEntry($ingredients['Fresas Frescas'], 1.5, 12.00, '2026-06-02 10:00:00', $admin); // Below minimum 2kg
        $this->recordEntry($ingredients['Leche de Almendras'], 3, 10.00, '2026-06-02 10:15:00', $admin); // Below minimum 5L

        // 5. Create Products and Recipes
        $p1 = Product::create(['name' => 'Espresso Doble', 'price' => 6.00, 'category_id' => $category->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $p1->id, 'ingredient_id' => $ingredients['Café en Grano Blend']->id, 'quantity' => 0.018]);
        RecipeItem::create(['product_id' => $p1->id, 'ingredient_id' => $ingredients['Vaso 12oz']->id, 'quantity' => 1]);
        RecipeItem::create(['product_id' => $p1->id, 'ingredient_id' => $ingredients['Tapa 12oz']->id, 'quantity' => 1]);

        $p2 = Product::create(['name' => 'Capuchino Clásico', 'price' => 9.00, 'category_id' => $category->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $p2->id, 'ingredient_id' => $ingredients['Café en Grano Blend']->id, 'quantity' => 0.018]);
        RecipeItem::create(['product_id' => $p2->id, 'ingredient_id' => $ingredients['Leche Entera']->id, 'quantity' => 0.2]);
        RecipeItem::create(['product_id' => $p2->id, 'ingredient_id' => $ingredients['Vaso 12oz']->id, 'quantity' => 1]);
        RecipeItem::create(['product_id' => $p2->id, 'ingredient_id' => $ingredients['Tapa 12oz']->id, 'quantity' => 1]);

        $p3 = Product::create(['name' => 'Latte Vainilla', 'price' => 11.00, 'category_id' => $category->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $p3->id, 'ingredient_id' => $ingredients['Café en Grano Blend']->id, 'quantity' => 0.018]);
        RecipeItem::create(['product_id' => $p3->id, 'ingredient_id' => $ingredients['Leche Entera']->id, 'quantity' => 0.2]);
        RecipeItem::create(['product_id' => $p3->id, 'ingredient_id' => $ingredients['Jarabe de Vainilla']->id, 'quantity' => 0.03]);
        RecipeItem::create(['product_id' => $p3->id, 'ingredient_id' => $ingredients['Vaso 12oz']->id, 'quantity' => 1]);
        RecipeItem::create(['product_id' => $p3->id, 'ingredient_id' => $ingredients['Tapa 12oz']->id, 'quantity' => 1]);

        $p4 = Product::create(['name' => 'Smoothie de Fresa', 'price' => 14.00, 'category_id' => $category->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $p4->id, 'ingredient_id' => $ingredients['Fresas Frescas']->id, 'quantity' => 0.15]);
        RecipeItem::create(['product_id' => $p4->id, 'ingredient_id' => $ingredients['Leche de Almendras']->id, 'quantity' => 0.15]);
        RecipeItem::create(['product_id' => $p4->id, 'ingredient_id' => $ingredients['Azúcar Blanca']->id, 'quantity' => 0.05]);
        RecipeItem::create(['product_id' => $p4->id, 'ingredient_id' => $ingredients['Vaso 12oz']->id, 'quantity' => 1]);
        RecipeItem::create(['product_id' => $p4->id, 'ingredient_id' => $ingredients['Tapa 12oz']->id, 'quantity' => 1]);

        $p5 = Product::create(['name' => 'Croissant Caliente', 'price' => 7.00, 'category_id' => $category->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $p5->id, 'ingredient_id' => $ingredients['Croissant Congelado']->id, 'quantity' => 1]);


        // 6. Simulate Sales between June 3 and June 14
        $salesData = [
            ['date' => '2026-06-03 09:30:00', 'products' => [$p1, $p2, $p5]],
            ['date' => '2026-06-04 10:15:00', 'products' => [$p2, $p3, $p3]],
            ['date' => '2026-06-05 14:00:00', 'products' => [$p4, $p1]],
            ['date' => '2026-06-06 16:45:00', 'products' => [$p4, $p4, $p5]],
            ['date' => '2026-06-07 08:30:00', 'products' => [$p2, $p2, $p2, $p5, $p5]],
            ['date' => '2026-06-08 11:20:00', 'products' => [$p3, $p1]],
            ['date' => '2026-06-09 13:10:00', 'products' => [$p4, $p5]],
            ['date' => '2026-06-10 15:40:00', 'products' => [$p2, $p3]],
            ['date' => '2026-06-11 17:00:00', 'products' => [$p1, $p1, $p4]],
            ['date' => '2026-06-12 09:15:00', 'products' => [$p5, $p2]],
            ['date' => '2026-06-13 12:30:00', 'products' => [$p3, $p4]],
            ['date' => '2026-06-14 16:20:00', 'products' => [$p2, $p2, $p5]],
        ];

        foreach ($salesData as $idx => $sData) {
            $this->recordSale($sData['date'], $sData['products'], $admin, $cliente, "Venta Sim #".($idx+1));
        }

        // 7. Simulate Mermas on June 15
        $this->recordMerma($ingredients['Leche Entera'], 1, '2026-06-15 08:00:00', $cocina, $admin, 'Leche cortada por fallo en refrigeradora');
        $this->recordMerma($ingredients['Croissant Congelado'], 2, '2026-06-15 09:30:00', $cocina, $admin, 'Croissants quemados en el horno durante horneado');
        $this->recordMerma($ingredients['Fresas Frescas'], 0.2, '2026-06-15 11:15:00', $cocina, $admin, 'Fresas pasadas por calor excesivo en despensa');
    }

    private function recordEntry($ingredient, $quantity, $unitCost, $date, $admin)
    {
        $oldStock = $ingredient->stock_actual;
        $oldCost = $ingredient->costo_promedio;
        
        $newStock = $oldStock + $quantity;
        $newAvgCost = (($oldStock * $oldCost) + ($quantity * $unitCost)) / $newStock;

        $ingredient->update([
            'stock_actual' => $newStock,
            'costo_promedio' => round($newAvgCost, 6)
        ]);

        InventoryMovement::create([
            'ingredient_id' => $ingredient->id,
            'user_id' => $admin->id,
            'type' => 'entrada',
            'quantity' => $quantity,
            'saldo_cantidad' => $newStock,
            'cost_per_unit' => round($newAvgCost, 6),
            'reason' => 'Compra a Proveedor (Seed)',
            'document_ref' => 'FACT-001',
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => Carbon::parse($date),
            'created_at' => Carbon::parse($date),
            'updated_at' => Carbon::parse($date),
        ]);
    }

    private function recordSale($date, $products, $admin, $cliente, $docRef)
    {
        $total = 0;
        foreach ($products as $p) {
            $total += $p->price;
        }

        $sale = Sale::create([
            'user_id' => $admin->id,
            'client_id' => $cliente->id,
            'subtotal' => $total * 0.82,
            'tax' => $total * 0.18,
            'total' => $total,
            'payment_method' => 'Efectivo',
            'invoice_type' => 'Boleta',
            'status' => 'completed',
            'created_at' => Carbon::parse($date),
            'updated_at' => Carbon::parse($date),
        ]);

        $productCounts = [];
        foreach ($products as $p) {
            if (!isset($productCounts[$p->id])) {
                $productCounts[$p->id] = 0;
            }
            $productCounts[$p->id]++;
        }

        foreach ($productCounts as $productId => $qty) {
            $product = Product::find($productId);
            SaleItem::create([
                'sale_id' => $sale->id,
                'product_id' => $product->id,
                'quantity' => $qty,
                'unit_price' => $product->price,
                'subtotal' => $product->price * $qty,
                'created_at' => Carbon::parse($date),
                'updated_at' => Carbon::parse($date),
            ]);

            foreach ($product->recipeItems as $ri) {
                $deductQty = $ri->quantity * $qty;
                $ing = $ri->ingredient;
                
                $newStock = $ing->stock_actual - $deductQty;
                $ing->update(['stock_actual' => $newStock]);

                InventoryMovement::create([
                    'ingredient_id' => $ing->id,
                    'user_id' => $admin->id,
                    'type' => 'salida_venta',
                    'quantity' => $deductQty,
                    'saldo_cantidad' => $newStock,
                    'cost_per_unit' => $ing->costo_promedio,
                    'reason' => 'Venta POS - ' . $product->name,
                    'document_ref' => $sale->id,
                    'status' => 'approved',
                    'approved_by' => $admin->id,
                    'approved_at' => Carbon::parse($date),
                    'created_at' => Carbon::parse($date),
                    'updated_at' => Carbon::parse($date),
                ]);
            }
        }
    }

    private function recordMerma($ingredient, $quantity, $date, $cocina, $admin, $reason)
    {
        $newStock = $ingredient->stock_actual - $quantity;
        $ingredient->update(['stock_actual' => $newStock]);

        InventoryMovement::create([
            'ingredient_id' => $ingredient->id,
            'user_id' => $cocina->id,
            'type' => 'salida_merma',
            'quantity' => $quantity,
            'saldo_cantidad' => $newStock,
            'cost_per_unit' => $ingredient->costo_promedio,
            'reason' => $reason,
            'document_ref' => 'MERMA-'.uniqid(),
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => Carbon::parse($date),
            'created_at' => Carbon::parse($date),
            'updated_at' => Carbon::parse($date),
        ]);
    }
}
