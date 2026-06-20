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
        // 1. Obtener los IDs de las ventas que tienen al menos un item pendiente, preparando o listo
        $activeSaleIds = SaleItem::whereIn('status', ['pending', 'preparing', 'ready'])
            ->where('is_cancelled', false)
            ->pluck('sale_id')
            ->unique();

        // 2. Traer todos los items (incluyendo los cancelados) pero SOLO de esas ventas activas
        $items = SaleItem::with(['product.category', 'sale.client', 'sale.user'])
            ->whereIn('sale_id', $activeSaleIds)
            ->orderBy('created_at', 'asc')
            ->get();

        // 3. Agrupar los items por ID de Venta
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
                        'is_cancelled' => $item->is_cancelled,
                        'category_icon' => optional($item->product->category)->icon,
                    ];
                })->values()
            ];
        })->values();

        return response()->json($grouped);
    }

    /**
     * Obtener el historial de items cancelados del día actual.
     */
    public function getCancelledHistory()
    {
        $history = SaleItem::with(['product', 'sale.user'])
            ->where('is_cancelled', true)
            ->whereDate('updated_at', \Carbon\Carbon::today())
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'sale_id' => $item->sale_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'cancelled_at' => $item->updated_at->format('H:i:s'),
                    'user_name' => $item->sale->user->name,
                ];
            });

        return response()->json($history);
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
     * Cancelar un item desde despacho/cajero.
     */
    public function cancelItem(Request $request, SaleItem $saleItem)
    {
        if ($saleItem->is_cancelled || $saleItem->status === 'delivered') {
            return response()->json(['message' => 'No se puede cancelar este item.'], 422);
        }

        $saleItem->update([
            'is_cancelled' => true,
            'kitchen_notified' => false
        ]);

        return response()->json(['message' => 'Producto cancelado. Se ha notificado a cocina.']);
    }

    /**
     * Obtener alertas de cancelación no leídas para la cocina.
     */
    public function getAlerts()
    {
        $alerts = SaleItem::with('product')
            ->where('is_cancelled', true)
            ->where('kitchen_notified', false)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'sale_id' => $item->sale_id,
                    'product_name' => $item->product->name,
                ];
            });

        return response()->json($alerts);
    }

    /**
     * Marcar la alerta como entendida por la cocina.
     */
    public function acknowledgeAlert(SaleItem $saleItem)
    {
        $saleItem->update(['kitchen_notified' => true]);
        return response()->json(['message' => 'Alerta marcada como entendida']);
    }
}
