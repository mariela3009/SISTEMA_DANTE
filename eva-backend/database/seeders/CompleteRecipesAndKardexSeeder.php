<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\RecipeItem;
use App\Models\InventoryMovement;
use App\Models\User;

class CompleteRecipesAndKardexSeeder extends Seeder
{
    public function run()
    {
        $admin = User::first();
        if (!$admin) {
            $admin = User::factory()->create();
        }

        // 1. Añadir entradas iniciales al Kardex con costo para todos los insumos
        $ingredients = Ingredient::all();
        foreach ($ingredients as $ing) {
            // Check if it already has an entrada
            $hasEntrada = InventoryMovement::where('ingredient_id', $ing->id)->where('type', 'entrada')->exists();
            if (!$hasEntrada) {
                $cost = rand(10, 50) + (rand(0, 99) / 100); // 10.00 to 50.99
                $qty = rand(50, 200);

                // Update ingredient stock
                $ing->stock_actual += $qty;
                $ing->costo_promedio = $cost;
                $ing->save();

                InventoryMovement::create([
                    'ingredient_id' => $ing->id,
                    'user_id' => $admin->id,
                    'type' => 'entrada',
                    'quantity' => $qty,
                    'saldo_cantidad' => $ing->stock_actual,
                    'cost_per_unit' => $cost,
                    'reason' => 'Compra a Proveedor (Inicial)',
                    'document_ref' => 'FACT-000' . rand(100, 999),
                    'status' => 'approved',
                ]);
            }
        }

        // 2. Asignar recetas a los productos que no tienen
        $productsWithoutRecipes = Product::doesntHave('recipeItems')->get();
        if ($ingredients->count() > 0) {
            foreach ($productsWithoutRecipes as $product) {
                // Pick 2-4 random ingredients
                $randomIngs = $ingredients->random(rand(2, 4));
                foreach ($randomIngs as $ring) {
                    // Random quantity between 0.05 and 0.5
                    $qty = rand(5, 50) / 100;
                    RecipeItem::create([
                        'product_id' => $product->id,
                        'ingredient_id' => $ring->id,
                        'quantity' => $qty
                    ]);
                }
            }
        }
    }
}
