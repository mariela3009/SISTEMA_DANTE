<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    /** GET /api/ingredients */
    public function index(Request $request)
    {
        $query = Ingredient::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('unit')) {
            $query->where('unit', $request->unit);
        }
        if ($request->filled('status')) {
            $status = $request->status;
            $query->when($status === 'stock_bajo', fn($q) => $q->whereColumn('stock_actual', '<=', 'stock_minimo')->where('stock_actual', '>', 0))
                  ->when($status === 'sin_stock',  fn($q) => $q->where('stock_actual', '<=', 0))
                  ->when($status === 'por_vencer', fn($q) => $q->whereNotNull('fecha_vencimiento')->whereDate('fecha_vencimiento', '<=', now()->addDays(7))->whereDate('fecha_vencimiento', '>=', now()));
        }
        if ($request->filled('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $ingredients = $query->orderBy('name')->paginate(15);

        $ingredients->getCollection()->transform(fn($i) => $this->formatIngredient($i));

        return response()->json($ingredients);
    }

    /** POST /api/ingredients */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:255',
            'unit'              => 'required|in:gr,kg,ml,l,unidad',
            'stock_actual'      => 'sometimes|numeric|min:0',
            'stock_minimo'      => 'sometimes|numeric|min:0',
            'fecha_vencimiento' => 'nullable|date',
        ]);

        $ingredient = Ingredient::create($data);

        return response()->json($this->formatIngredient($ingredient), 201);
    }

    /** GET /api/ingredients/{id} */
    public function show(Ingredient $ingredient)
    {
        return response()->json($this->formatIngredient($ingredient));
    }

    /** PUT /api/ingredients/{id} */
    public function update(Request $request, Ingredient $ingredient)
    {
        $data = $request->validate([
            'name'              => 'sometimes|string|max:255',
            'unit'              => 'sometimes|in:gr,kg,ml,l,unidad',
            'stock_minimo'      => 'sometimes|numeric|min:0',
            'fecha_vencimiento' => 'nullable|date',
            'is_active'         => 'sometimes|boolean',
        ]);

        if (isset($data['is_active']) && !$data['is_active']) {
            $isAssociated = \App\Models\RecipeItem::where('ingredient_id', $ingredient->id)
                ->whereHas('product', fn($q) => $q->where('is_active', true))
                ->exists();
            if ($isAssociated) {
                return response()->json([
                    'message' => 'No se puede desactivar el insumo porque está asociado a una receta de un producto activo.'
                ], 422);
            }
        }

        $ingredient->update($data);

        return response()->json($this->formatIngredient($ingredient));
    }

    /** DELETE /api/ingredients/{id} */
    public function destroy(Ingredient $ingredient)
    {
        $isAssociated = \App\Models\RecipeItem::where('ingredient_id', $ingredient->id)
            ->whereHas('product', fn($q) => $q->where('is_active', true))
            ->exists();
        if ($isAssociated) {
            return response()->json([
                'message' => 'No se puede desactivar el insumo porque está asociado a una receta de un producto activo.'
            ], 422);
        }
        $ingredient->update(['is_active' => false]);
        return response()->json(['message' => 'Insumo desactivado correctamente.']);
    }

    private function formatIngredient(Ingredient $i): array
    {
        return [
            'id'                => $i->id,
            'name'              => $i->name,
            'unit'              => $i->unit,
            'stock_actual'      => $i->stock_actual,
            'costo_promedio'    => $i->costo_promedio,
            'stock_minimo'      => $i->stock_minimo,
            'fecha_vencimiento' => $i->fecha_vencimiento?->format('d/m/Y'),
            'status'            => $i->status,
            'is_active'         => $i->is_active,
        ];
    }
}
