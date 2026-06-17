<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryMovement;
use App\Models\ProductMerma;
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
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Exportación a CSV
        if ($request->get('export') === 'csv') {
            $movements = $query->get();
            $csvFileName = 'kardex_export_' . now()->format('Ymd_His') . '.csv';
            
            $headers = array(
                "Content-type"        => "text/csv; charset=UTF-8",
                "Content-Disposition" => "attachment; filename=$csvFileName",
                "Pragma"              => "no-cache",
                "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
                "Expires"             => "0"
            );

            $callback = function() use($movements) {
                $file = fopen('php://output', 'w');
                // Añadir BOM para Excel UTF-8
                fputs($file, "\xEF\xBB\xBF");
                
                fputcsv($file, [
                    'ID', 'Fecha', 'Insumo', 'Unidad', 'Concepto', 'Documento/Ref', 'Usuario',
                    'Cant. Entrada', 'Costo Unit. Entrada', 'Costo Total Entrada',
                    'Cant. Salida', 'Costo Unit. Salida', 'Costo Total Salida',
                    'Cant. Saldo', 'Costo Prom. Saldo', 'Valorización Saldo'
                ]);

                foreach ($movements as $mov) {
                    $isEntrada = $mov->type === 'entrada';
                    $isSalida = in_array($mov->type, ['salida_venta', 'salida_merma']);
                    
                    fputcsv($file, [
                        $mov->id,
                        $mov->created_at->format('Y-m-d H:i:s'),
                        $mov->ingredient->name ?? 'N/A',
                        $mov->ingredient->unit ?? '',
                        $mov->type,
                        $mov->reason ?? $mov->document_ref ?? '-',
                        $mov->user->name ?? '-',
                        
                        $isEntrada ? $mov->quantity : '',
                        $isEntrada ? number_format((float)$mov->cost_per_unit, 2, '.', '') : '',
                        $isEntrada ? number_format((float)$mov->total_cost, 2, '.', '') : '',
                        
                        $isSalida ? $mov->quantity : '',
                        $isSalida ? number_format((float)$mov->cost_per_unit, 2, '.', '') : '',
                        $isSalida ? number_format((float)$mov->total_cost, 2, '.', '') : '',
                        
                        $mov->saldo_cantidad,
                        number_format((float)$mov->saldo_costo_unitario, 4, '.', ''),
                        number_format((float)$mov->saldo_costo_total, 2, '.', '')
                    ]);
                }
                fclose($file);
            };
            return response()->streamDownload($callback, $csvFileName, $headers);
        }

        // Calcular Pérdidas por Mermas para el conjunto filtrado
        $totalMermasQuery = clone $query;
        $total_mermas_cost = $totalMermasQuery->where('type', 'salida_merma')->where('status', 'approved')->sum('total_cost');

        $paginated = $query->paginate(20);
        
        return response()->json([
            'current_page' => $paginated->currentPage(),
            'data' => $paginated->items(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
            'summary' => [
                'total_mermas_cost' => (float) $total_mermas_cost
            ]
        ]);
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
                
                $stock_anterior = (float) $ingredient->stock_actual;
                $costo_anterior = (float) $ingredient->costo_promedio;
                $cantidad_nueva = (float) $item['quantity'];
                $costo_nuevo    = isset($item['cost_per_unit']) && (float) $item['cost_per_unit'] > 0 ? (float) $item['cost_per_unit'] : $costo_anterior;

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
                    'cost_per_unit'  => $costo_nuevo,
                    'total_cost'     => $cantidad_nueva * $costo_nuevo,
                    'saldo_cantidad' => $nuevo_stock,
                    'saldo_costo_unitario' => $nuevo_costo_promedio,
                    'saldo_costo_total' => $nuevo_stock * $nuevo_costo_promedio,
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

    /** GET /api/inventory/product-mermas - Listar mermas de productos */
    public function productMermas(Request $request)
    {
        $query = ProductMerma::with(['product', 'user', 'approvedBy'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $paginated = $query->paginate(20);
        return response()->json($paginated);
    }

    /** POST /api/inventory/merma-producto - Solicitud de merma de un producto terminado */
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

        $merma = ProductMerma::create([
            'product_id' => $request->product_id,
            'user_id'    => $request->user()->id,
            'quantity'   => $request->quantity,
            'reason'     => $request->reason,
            'status'     => 'pending',
        ]);

        return response()->json([
            'message' => 'Solicitud de merma de producto enviada. Pendiente de aprobación.', 
            'merma' => $merma
        ], 201);
    }

    /** POST /api/inventory/product-merma/{id}/approve - Admin aprueba merma de producto */
    public function approveProductMerma(Request $request, ProductMerma $merma)
    {
        if ($merma->status !== 'pending') {
            return response()->json(['message' => 'Este movimiento no puede ser aprobado.'], 422);
        }

        $product = $merma->product()->with('recipeItems.ingredient')->firstOrFail();

        DB::transaction(function () use ($request, $merma, $product) {
            // Descontar cada ingrediente y generar movimientos
            foreach ($product->recipeItems as $recipeItem) {
                $required = $recipeItem->quantity * $merma->quantity;
                $ingredient = Ingredient::lockForUpdate()->findOrFail($recipeItem->ingredient_id);

                if ($ingredient->stock_actual < $required) {
                    throw new \Exception("Stock insuficiente de {$ingredient->name}.");
                }

                $ingredient->stock_actual -= $required;
                $ingredient->save();

                InventoryMovement::create([
                    'ingredient_id' => $ingredient->id,
                    'user_id'       => $merma->user_id,
                    'type'          => 'salida_merma',
                    'quantity'      => $required,
                    'reason'        => $merma->reason . " (Merma Producto ID: {$merma->id})",
                    'status'        => 'approved',
                    'saldo_cantidad'=> $ingredient->stock_actual,
                    'cost_per_unit' => $ingredient->costo_promedio,
                    'approved_by'   => $request->user()->id,
                    'approved_at'   => now(),
                ]);
            }

            $merma->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Merma de producto aprobada exitosamente.']);
    }

    /** POST /api/inventory/product-merma/{id}/reject - Admin rechaza merma de producto */
    public function rejectProductMerma(Request $request, ProductMerma $merma)
    {
        if ($merma->status !== 'pending') {
            return response()->json(['message' => 'Esta merma ya fue procesada.'], 422);
        }

        $merma->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Merma de producto rechazada.']);
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
            $costo_promedio = $ingredient->costo_promedio;

            $movement->update([
                'status'         => 'approved',
                'approved_by'    => $request->user()->id,
                'approved_at'    => now(),
                'cost_per_unit'  => $costo_promedio,
                'total_cost'     => $movement->quantity * $costo_promedio,
                'saldo_cantidad' => $nuevo_stock,
                'saldo_costo_unitario' => $costo_promedio,
                'saldo_costo_total' => $nuevo_stock * $costo_promedio,
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
