<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    /** GET /api/inventory/movements - Kardex histórico */
    public function movements(Request $request)
    {
        $query = InventoryMovement::with(['ingredient', 'user', 'approvedBy'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('ingredient_id')) {
            $query->where('ingredient_id', $request->ingredient_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    /** POST /api/inventory/entrada - Reabastecimiento */
    public function entrada(Request $request)
    {
        $request->validate([
            'items'                   => 'required|array|min:1',
            'items.*.ingredient_id'   => 'required|exists:ingredients,id',
            'items.*.quantity'        => 'required|numeric|min:0.001',
            'items.*.cost_per_unit'   => 'nullable|numeric|min:0',
            'items.*.document_ref'    => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                $ingredient = Ingredient::lockForUpdate()->findOrFail($item['ingredient_id']);
                
                // Cálculo de Promedio Ponderado
                $stock_anterior = (float) $ingredient->stock_actual;
                $costo_anterior = (float) $ingredient->costo_promedio;
                $cantidad_nueva = (float) $item['quantity'];
                $costo_nuevo    = isset($item['cost_per_unit']) ? (float) $item['cost_per_unit'] : 0;

                $nuevo_stock = $stock_anterior + $cantidad_nueva;
                $nuevo_costo_promedio = $costo_anterior;

                if ($nuevo_stock > 0 && $costo_nuevo > 0) {
                    $nuevo_costo_promedio = (($stock_anterior * $costo_anterior) + ($cantidad_nueva * $costo_nuevo)) / $nuevo_stock;
                }

                $ingredient->update([
                    'stock_actual'   => $nuevo_stock,
                    'costo_promedio' => $nuevo_costo_promedio
                ]);

                InventoryMovement::create([
                    'ingredient_id'  => $item['ingredient_id'],
                    'user_id'        => $request->user()->id,
                    'type'           => 'entrada',
                    'quantity'       => $cantidad_nueva,
                    'cost_per_unit'  => $costo_nuevo > 0 ? $costo_nuevo : $costo_anterior,
                    'saldo_cantidad' => $nuevo_stock,
                    'document_ref'   => $item['document_ref'] ?? null,
                    'status'         => 'approved',
                    'approved_by'    => $request->user()->id,
                    'approved_at'    => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Entrada de inventario registrada con éxito.'], 201);
    }

    /** POST /api/inventory/merma - Solicitud de merma (queda pendiente) */
    public function merma(Request $request)
    {
        $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity'      => 'required|numeric|min:0.001',
            'reason'        => 'required|string|min:5',
        ]);

        $ingredient = Ingredient::findOrFail($request->ingredient_id);

        if ($ingredient->stock_actual < $request->quantity) {
            return response()->json([
                'message' => 'La cantidad a mermar supera el stock actual del insumo.'
            ], 422);
        }

        $movement = InventoryMovement::create([
            'ingredient_id' => $request->ingredient_id,
            'user_id'       => $request->user()->id,
            'type'          => 'salida_merma',
            'quantity'      => $request->quantity,
            'reason'        => $request->reason,
            'status'        => 'pending', // pendiente de aprobación del admin
            'saldo_cantidad'=> $ingredient->stock_actual,
            'cost_per_unit' => $ingredient->costo_promedio,
        ]);

        return response()->json(['message' => 'Solicitud de merma enviada. Pendiente de aprobación.', 'id' => $movement->id], 201);
    }

    /** POST /api/inventory/merma-producto - Solicitud de merma de un producto terminado (descuenta su receta) */
    public function mermaProducto(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
            'reason'     => 'required|string|min:5',
        ]);

        $product = \App\Models\Product::with('recipeItems.ingredient')->findOrFail($request->product_id);
        
        // Verificar que hay stock de todos los insumos para esa cantidad
        foreach ($product->recipeItems as $recipeItem) {
            $required = $recipeItem->quantity * $request->quantity;
            if ($recipeItem->ingredient->stock_actual < $required) {
                return response()->json([
                    'message' => "Stock insuficiente de \"{$recipeItem->ingredient->name}\" para mermar {$request->quantity} unidades de \"{$product->name}\"."
                ], 422);
            }
        }

        $movements = [];
        DB::transaction(function () use ($request, $product, &$movements) {
            foreach ($product->recipeItems as $recipeItem) {
                $required = $recipeItem->quantity * $request->quantity;
                $ingredient = $recipeItem->ingredient;
                $movements[] = InventoryMovement::create([
                    'ingredient_id' => $recipeItem->ingredient_id,
                    'user_id'       => $request->user()->id,
                    'type'          => 'salida_merma',
                    'quantity'      => $required,
                    'reason'        => $request->reason . " (Merma de {$request->quantity}x {$product->name})",
                    'status'        => 'pending',
                    'saldo_cantidad'=> $ingredient->stock_actual,
                    'cost_per_unit' => $ingredient->costo_promedio,
                ]);
            }
        });

        return response()->json([
            'message' => 'Solicitud de merma de producto enviada. Pendiente de aprobación.', 
            'movements' => collect($movements)->pluck('id')
        ], 201);
    }

    /** POST /api/inventory/merma/{id}/approve - Admin aprueba merma */
    public function approveMerma(Request $request, InventoryMovement $movement)
    {
        if ($movement->type !== 'salida_merma' || $movement->status !== 'pending') {
            return response()->json(['message' => 'Este movimiento no puede ser aprobado.'], 422);
        }

        DB::transaction(function () use ($request, $movement) {
            $ingredient = Ingredient::lockForUpdate()->findOrFail($movement->ingredient_id);

            if ($ingredient->stock_actual < $movement->quantity) {
                throw new \Exception('Stock insuficiente para aprobar la merma.');
            }

            $ingredient->decrement('stock_actual', $movement->quantity);
            $nuevo_stock = $ingredient->stock_actual;

            $movement->update([
                'status'         => 'approved',
                'approved_by'    => $request->user()->id,
                'approved_at'    => now(),
                'cost_per_unit'  => $ingredient->costo_promedio,
                'saldo_cantidad' => $nuevo_stock,
            ]);
        });

        return response()->json(['message' => 'Merma aprobada. Stock descontado correctamente.']);
    }

    /** POST /api/inventory/merma/{id}/reject - Admin rechaza merma */
    public function rejectMerma(Request $request, InventoryMovement $movement)
    {
        if ($movement->type !== 'salida_merma' || $movement->status !== 'pending') {
            return response()->json(['message' => 'Este movimiento no puede ser rechazado.'], 422);
        }

        $movement->update([
            'status'      => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'reason'      => $movement->reason . ' [RECHAZADO]',
        ]);

        return response()->json(['message' => 'Merma rechazada. El stock no fue modificado.']);
    }
}
