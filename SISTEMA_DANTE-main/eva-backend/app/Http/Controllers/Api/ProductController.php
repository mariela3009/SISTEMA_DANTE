<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\RecipeItem;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /** GET /api/products */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'recipeItems.ingredient']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('name')->get()->map(function ($p) {
            return $this->formatProduct($p);
        });

        return response()->json($products);
    }

    /** GET /api/products/{id} */
    public function show(Product $product)
    {
        $product->load(['category', 'recipeItems.ingredient']);
        return response()->json($this->formatProduct($product));
    }

    /** POST /api/products */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image_url'   => 'nullable|string',
        ]);

        $product = Product::create([
            ...$data,
            'is_active' => false, // inactivo hasta tener receta
        ]);

        return response()->json($this->formatProduct($product->load('category')), 201);
    }

    /** PUT /api/products/{id} */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'price'       => 'sometimes|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'image_url'   => 'nullable|string',
            'is_active'   => 'sometimes|boolean',
        ]);

        $product->update($data);

        return response()->json($this->formatProduct($product->load(['category', 'recipeItems.ingredient'])));
    }

    /** DELETE /api/products/{id} (soft delete via is_active) */
    public function destroy(Product $product)
    {
        $product->update(['is_active' => false]);
        return response()->json(['message' => 'Producto desactivado.']);
    }

    /** POST /api/products/{id}/recipe - Define o reemplaza la receta completa */
    public function saveRecipe(Request $request, Product $product)
    {
        $request->validate([
            'items'               => 'required|array|min:1',
            'items.*.ingredient_id' => 'required|exists:ingredients,id',
            'items.*.quantity'    => 'required|numeric|min:0.001',
        ]);

        DB::transaction(function () use ($request, $product) {
            // Eliminar receta previa y reemplazar
            RecipeItem::where('product_id', $product->id)->delete();

            foreach ($request->items as $item) {
                RecipeItem::create([
                    'product_id'    => $product->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity'      => $item['quantity'],
                ]);
            }

            // Activar producto ahora que tiene receta
            $product->update(['is_active' => true]);
        });

        $product->load(['category', 'recipeItems.ingredient']);
        return response()->json($this->formatProduct($product));
    }

    /** Formatea el producto para la respuesta */
    private function formatProduct(Product $product): array
    {
        return [
            'id'          => $product->id,
            'name'        => $product->name,
            'price'       => $product->price,
            'image_url'   => $product->image_url,
            'is_active'   => $product->is_active,
            'category'    => $product->category ? ['id' => $product->category->id, 'name' => $product->category->name] : null,
            'recipe_items' => $product->recipeItems->map(fn($r) => [
                'id'            => $r->id,
                'ingredient_id' => $r->ingredient_id,
                'ingredient'    => ['id' => $r->ingredient->id, 'name' => $r->ingredient->name, 'unit' => $r->ingredient->unit, 'stock_actual' => $r->ingredient->stock_actual],
                'quantity'      => $r->quantity,
            ])->values(),
            'has_stock'   => $product->is_active ? $product->load('recipeItems.ingredient')->hasStock() : false,
        ];
    }
}
