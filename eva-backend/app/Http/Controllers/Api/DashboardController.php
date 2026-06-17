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

        $alertasPrincipal = Ingredient::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('is_active', true)->get(['id', 'name', 'stock_actual', 'unit']);
            
        // Solo alertar cocina si realmente tiene insumos asignados (stock_cocina > 0)
        $alertasCocina = Ingredient::whereColumn('stock_cocina', '<=', 'stock_minimo')
            ->where('stock_cocina', '>', 0)
            ->where('is_active', true)->get(['id', 'name', 'stock_cocina as stock_actual', 'unit']);
            
        $alertasInsumos = $alertasPrincipal->concat($alertasCocina)->unique('id')->values();

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

        // Datos para las gráficas de tendencia (últimos 7 días)
        $trendData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $diaIngresos = Sale::whereDate('created_at', $date)->where('status', 'completed')->sum('total');
            $diaVentas = Sale::whereDate('created_at', $date)->where('status', 'completed')->count();
            $trendData[] = [
                'date' => now()->subDays($i)->format('d M'),
                'ingresos' => round($diaIngresos, 2),
                'ventas' => $diaVentas,
                'ticket' => $diaVentas > 0 ? round($diaIngresos / $diaVentas, 2) : 0
            ];
        }

        return response()->json([
            'today'               => now()->format('d M Y'),
            'ingresos'            => $totalIngresos,
            'ventas_totales'      => $totalVentas,
            'ticket_promedio'     => $ticketPromedio,
            'alertas_insumos'     => $alertasInsumos,
            'top_vendidos'        => $topVendidos,
            'bottom_vendidos'     => $bottomVendidos,
            'insumos_rotacion'    => $insumosMayorRotacion,
            'trend_data'          => $trendData,
        ]);
    }

    public function stockAlerts()
    {
        // Alertas tanto para stock principal como para stock cocina
        $alertasPrincipal = Ingredient::whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('is_active', true)
            ->get(['id', 'name', 'stock_actual', 'stock_minimo', 'unit'])
            ->map(fn($item) => [
                'alert_category' => 'stock',
                'type' => 'principal',
                'ingredient' => $item->name,
                'current' => $item->stock_actual,
                'min' => $item->stock_minimo,
                'unit' => $item->unit
            ]);

        // Solo alertar cocina si realmente tiene insumos asignados (stock_cocina > 0)
        $alertasCocina = Ingredient::whereColumn('stock_cocina', '<=', 'stock_minimo')
            ->where('stock_cocina', '>', 0)
            ->where('is_active', true)
            ->get(['id', 'name', 'stock_cocina', 'stock_minimo', 'unit'])
            ->map(fn($item) => [
                'alert_category' => 'stock',
                'type' => 'cocina',
                'ingredient' => $item->name,
                'current' => $item->stock_cocina,
                'min' => $item->stock_minimo,
                'unit' => $item->unit
            ]);

        // Alertas de vencimiento (vencidos o por vencer en <= 7 días)
        $alertasVencimiento = Ingredient::whereNotNull('fecha_vencimiento')
            ->where('is_active', true)
            ->whereDate('fecha_vencimiento', '<=', now()->addDays(7))
            ->where('stock_actual', '>', 0)
            ->get(['id', 'name', 'fecha_vencimiento'])
            ->map(function($item) {
                $days = (int) now()->startOfDay()->diffInDays($item->fecha_vencimiento->startOfDay(), false);
                return [
                    'alert_category' => 'expiration',
                    'type' => $days < 0 ? 'vencido' : 'por_vencer',
                    'ingredient' => $item->name,
                    'days' => $days,
                    'date' => $item->fecha_vencimiento->format('d/m/Y')
                ];
            });

        return response()->json([
            'alertas' => $alertasPrincipal->concat($alertasCocina)->concat($alertasVencimiento)->values()
        ]);
    }
}
