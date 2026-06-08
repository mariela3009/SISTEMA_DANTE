<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SaleItem;
use Illuminate\Http\Request;

class KitchenController extends Controller
{
    /**
     * Obtener los items de ventas que están pendientes, preparando o listos (no entregados).
     * Agrupados lógicamente o listados individualmente para el KDS.
     */
    public function index(Request $request)
    {
        // Traer items no entregados, ordenados por fecha ascendente (FIFO)
        $items = SaleItem::with(['product.category', 'sale.client', 'sale.user'])
            ->whereIn('status', ['pending', 'preparing', 'ready'])
            ->where('is_cancelled', false)
            ->orderBy('created_at', 'asc')
            ->get();

        // Agrupar los items por ID de Venta (Ticket/Comanda)
        $grouped = $items->groupBy('sale_id')->map(function ($saleItems, $saleId) {
            $sale = $saleItems->first()->sale;
            return [
                'sale_id' => $saleId,
                'client_name' => $sale->client ? $sale->client->name : 'Venta Rápida',
                'user_name' => $sale->user->name,
                'created_at' => $sale->created_at,
                'items' => $saleItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product->name,
                        'quantity' => $item->quantity,
                        'status' => $item->status,
                        'category_icon' => optional($item->product->category)->icon,
                    ];
                })->values()
            ];
        })->values();

        return response()->json($grouped);
    }

    /**
     * Cambiar el estado de un item de venta.
     */
    public function updateStatus(Request $request, SaleItem $saleItem)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,delivered'
        ]);

        $saleItem->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'item' => $saleItem
        ]);
    }

    /**
     * Cancelar un item desde cocina y retornar insumos.
     */
    public function cancelItem(Request $request, SaleItem $saleItem)
    {
        if ($saleItem->is_cancelled || $saleItem->status === 'delivered') {
            return response()->json(['message' => 'No se puede cancelar este item.'], 422);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $saleItem) {
            $saleItem->update([
                'is_cancelled' => true,
                'status' => 'pending' // o dejar en el estado que estaba, is_cancelled manda
            ]);

            $product = $saleItem->product()->with('recipeItems.ingredient')->first();
            
            // Retornar insumos al inventario (tipo entrada)
            foreach ($product->recipeItems as $recipeItem) {
                $returnQuantity = $recipeItem->quantity * $saleItem->quantity;
                $ingredient = \App\Models\Ingredient::lockForUpdate()->findOrFail($recipeItem->ingredient_id);
                
                $ingredient->increment('stock_actual', $returnQuantity);

                \App\Models\InventoryMovement::create([
                    'ingredient_id' => $ingredient->id,
                    'user_id'       => $request->user()->id,
                    'type'          => 'entrada', // Devolución
                    'quantity'      => $returnQuantity,
                    'cost_per_unit' => $ingredient->costo_promedio,
                    'saldo_cantidad'=> $ingredient->stock_actual,
                    'reason'        => "Cancelación KDS - Venta #{$saleItem->sale_id} - {$product->name}",
                    'status'        => 'approved',
                    'approved_by'   => $request->user()->id,
                    'approved_at'   => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Comanda cancelada e insumos devueltos al stock.']);
    }
}
