<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\RecipeItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // ─── USUARIOS ─────────────────────────────────────────────
        User::create(['name' => 'Admin Dante', 'email' => 'admin@cafeteriadante.com', 'password' => Hash::make('admin123'), 'role' => 'admin', 'is_active' => true]);
        User::create(['name' => 'Cajero Principal', 'email' => 'cajero@cafeteriadante.com', 'password' => Hash::make('cajero123'), 'role' => 'cajero', 'is_active' => true]);
        User::create(['name' => 'Cocina Team', 'email' => 'cocina@cafeteriadante.com', 'password' => Hash::make('cocina123'), 'role' => 'cocina', 'is_active' => true]);

        // ─── CATEGORÍAS ───────────────────────────────────────────
        $cafes     = Category::create(['name' => 'Café Caliente',  'icon' => 'local_cafe']);
        $frias     = Category::create(['name' => 'Bebidas Frías',  'icon' => 'water_drop']);
        $pasteleria = Category::create(['name' => 'Pastelería',    'icon' => 'cake']);
        $especial  = Category::create(['name' => 'Especialidades', 'icon' => 'stars']);

        // ─── INSUMOS ──────────────────────────────────────────────
        $cafe    = Ingredient::create(['name' => 'Café de especialidad', 'unit' => 'gr',     'stock_actual' => 2500,  'stock_minimo' => 500]);
        $leche   = Ingredient::create(['name' => 'Leche entera',         'unit' => 'ml',     'stock_actual' => 12000, 'stock_minimo' => 2000]);
        $avena   = Ingredient::create(['name' => 'Leche de avena',       'unit' => 'ml',     'stock_actual' => 3000,  'stock_minimo' => 1000]);
        $azucar  = Ingredient::create(['name' => 'Azúcar rubia',         'unit' => 'gr',     'stock_actual' => 5000,  'stock_minimo' => 500]);
        $hielo   = Ingredient::create(['name' => 'Hielo en cubos',       'unit' => 'gr',     'stock_actual' => 3000,  'stock_minimo' => 500]);
        $pan     = Ingredient::create(['name' => 'Pan masa madre',       'unit' => 'unidad', 'stock_actual' => 20,    'stock_minimo' => 5]);
        $palta   = Ingredient::create(['name' => 'Palta Hass',           'unit' => 'unidad', 'stock_actual' => 15,    'stock_minimo' => 5]);
        $crema   = Ingredient::create(['name' => 'Crema chantilly',      'unit' => 'ml',     'stock_actual' => 1000,  'stock_minimo' => 200]);
        $croissant = Ingredient::create(['name' => 'Croissant',          'unit' => 'unidad', 'stock_actual' => 30,    'stock_minimo' => 10]);
        $almendra  = Ingredient::create(['name' => 'Almendras laminadas','unit' => 'gr',     'stock_actual' => 500,   'stock_minimo' => 100]);

        // ─── PRODUCTOS + RECETAS ──────────────────────────────────
        $cappuccino = Product::create(['name' => 'Cappuccino Clásico', 'price' => 4.50, 'category_id' => $cafes->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $cappuccino->id, 'ingredient_id' => $cafe->id,  'quantity' => 18]);
        RecipeItem::create(['product_id' => $cappuccino->id, 'ingredient_id' => $leche->id, 'quantity' => 150]);

        $espresso = Product::create(['name' => 'Espresso Doble', 'price' => 3.50, 'category_id' => $cafes->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $espresso->id, 'ingredient_id' => $cafe->id, 'quantity' => 20]);

        $flatWhite = Product::create(['name' => 'Flat White', 'price' => 4.50, 'category_id' => $cafes->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $flatWhite->id, 'ingredient_id' => $cafe->id,  'quantity' => 18]);
        RecipeItem::create(['product_id' => $flatWhite->id, 'ingredient_id' => $leche->id, 'quantity' => 120]);

        $latte = Product::create(['name' => 'Latte Helado', 'price' => 5.20, 'category_id' => $frias->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $latte->id, 'ingredient_id' => $cafe->id,  'quantity' => 18]);
        RecipeItem::create(['product_id' => $latte->id, 'ingredient_id' => $avena->id, 'quantity' => 200]);
        RecipeItem::create(['product_id' => $latte->id, 'ingredient_id' => $hielo->id, 'quantity' => 150]);

        $coldBrew = Product::create(['name' => 'Cold Brew Origin', 'price' => 5.50, 'category_id' => $frias->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $coldBrew->id, 'ingredient_id' => $cafe->id,  'quantity' => 25]);
        RecipeItem::create(['product_id' => $coldBrew->id, 'ingredient_id' => $hielo->id, 'quantity' => 200]);

        $avocado = Product::create(['name' => 'Tostada de Aguacate', 'price' => 8.00, 'category_id' => $especial->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $avocado->id, 'ingredient_id' => $pan->id,   'quantity' => 1]);
        RecipeItem::create(['product_id' => $avocado->id, 'ingredient_id' => $palta->id, 'quantity' => 1]);

        $croissantAlm = Product::create(['name' => 'Croissant Almendras', 'price' => 7.00, 'category_id' => $pasteleria->id, 'is_active' => true]);
        RecipeItem::create(['product_id' => $croissantAlm->id, 'ingredient_id' => $croissant->id, 'quantity' => 1]);
        RecipeItem::create(['product_id' => $croissantAlm->id, 'ingredient_id' => $almendra->id,  'quantity' => 15]);
        RecipeItem::create(['product_id' => $croissantAlm->id, 'ingredient_id' => $crema->id,     'quantity' => 30]);
    }
}
