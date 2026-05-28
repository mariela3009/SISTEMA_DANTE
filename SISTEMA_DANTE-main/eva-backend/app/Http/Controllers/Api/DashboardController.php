<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = now()->toDateString();

        $totalIngresos   = Sale::whereDate('created_at', $today)->where('status', 'completed')->sum('total');
        $totalVentas     = Sale::whereDate('created_at', $today)->where('status', 'completed')->count();
        $ticketPromedio  = $totalVentas > 0 ? round($totalIngresos / $totalVentas, 2) : 0;

        $alertasInsumos  = Ingredient::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('is_active', true)->get(['id', 'name', 'stock_actual', 'unit']);

        $topVendidos = SaleItem::select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->whereHas('sale', fn($q) => $q->whereDate('created_at', $today)->where('status', 'completed'))
            ->groupBy('product_id')->orderByDesc('total_qty')->take(5)
            ->with('product:id,name')->get()
            ->map(fn($i) => ['name' => $i->product->name, 'qty' => (int) $i->total_qty]);

        $bottomVendidos = SaleItem::select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->whereHas('sale', fn($q) => $q->whereDate('created_at', $today)->where('status', 'completed'))
            ->groupBy('product_id')->orderBy('total_qty')->take(5)
            ->with('product:id,name')->get()
            ->map(fn($i) => ['name' => $i->product->name, 'qty' => (int) $i->total_qty]);

        $insumosMayorRotacion = \App\Models\InventoryMovement::select('ingredient_id', DB::raw('SUM(quantity) as consumido'))
            ->where('type', 'salida_venta')->whereDate('created_at', $today)
            ->groupBy('ingredient_id')->orderByDesc('consumido')->take(5)
            ->with('ingredient:id,name,unit')->get()
            ->map(fn($m) => ['name' => $m->ingredient->name, 'consumido' => $m->consumido, 'unit' => $m->ingredient->unit]);

        return response()->json([
            'today'               => now()->format('d M Y'),
            'ingresos'            => $totalIngresos,
            'ventas_totales'      => $totalVentas,
            'ticket_promedio'     => $ticketPromedio,
            'alertas_insumos'     => $alertasInsumos,
            'top_vendidos'        => $topVendidos,
            'bottom_vendidos'     => $bottomVendidos,
            'insumos_rotacion'    => $insumosMayorRotacion,
        ]);
    }

    public function stockAlerts()
    {
        // Alertas tanto para stock principal como para stock cocina
        $alertasPrincipal = Ingredient::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('is_active', true)
            ->get(['id', 'name', 'stock_actual', 'stock_minimo', 'unit'])
            ->map(fn($item) => [
                'type' => 'principal',
                'ingredient' => $item->name,
                'current' => $item->stock_actual,
                'min' => $item->stock_minimo,
                'unit' => $item->unit
            ]);

        $alertasCocina = Ingredient::whereColumn('stock_cocina', '<=', 'stock_minimo')
            ->where('is_active', true)
            ->get(['id', 'name', 'stock_cocina', 'stock_minimo', 'unit'])
            ->map(fn($item) => [
                'type' => 'cocina',
                'ingredient' => $item->name,
                'current' => $item->stock_cocina,
                'min' => $item->stock_minimo,
                'unit' => $item->unit
            ]);

        return response()->json([
            'alertas' => $alertasPrincipal->concat($alertasCocina)->values()
        ]);
    }
}
