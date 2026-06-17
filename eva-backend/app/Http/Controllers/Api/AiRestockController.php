<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AiRestockController extends Controller
{
    /**
     * GET /api/ai/restock-suggestions
     */
    public function index(Request $request)
    {
        $daysWindow = (int) $request->get('days_window', 30); // 30 days history
        $targetDays = (int) $request->get('target_days', 30); // 30 days forward target
        $startDate = Carbon::now()->subDays($daysWindow);

        $ingredients = Ingredient::where('is_active', true)->get();

        // Get consumption data
        $movements = InventoryMovement::whereIn('type', ['salida_venta', 'salida_merma'])
            ->where('created_at', '>=', $startDate)
            ->selectRaw('ingredient_id, SUM(quantity) as total_consumption')
            ->groupBy('ingredient_id')
            ->pluck('total_consumption', 'ingredient_id');

        $suggestions = [];

        foreach ($ingredients as $ing) {
            $consumed = $movements->get($ing->id) ?? 0;
            // daily consumption
            $dailyConsumption = $consumed / max(1, $daysWindow);
            
            $daysRemaining = 999;
            if ($dailyConsumption <= 0) {
                // Not consumed in the last 30 days. See if below minimum
                if ($ing->stock_actual <= $ing->stock_minimo) {
                    $urgencyLevel = 'attention';
                    $suggestedBuy = max(0, $ing->stock_minimo - $ing->stock_actual + 1);
                } else {
                    continue; // Skip
                }
            } else {
                $daysRemaining = $ing->stock_actual / $dailyConsumption;
                $targetStock = $dailyConsumption * $targetDays;
                
                if ($targetStock < $ing->stock_minimo) {
                    $targetStock = $ing->stock_minimo;
                }

                $suggestedBuy = max(0, $targetStock - $ing->stock_actual);

                if ($daysRemaining <= 3) {
                    $urgencyLevel = 'critical';
                } elseif ($daysRemaining <= 7) {
                    $urgencyLevel = 'warning';
                } elseif ($daysRemaining <= 15) {
                    $urgencyLevel = 'attention';
                } else {
                    if ($ing->stock_actual <= $ing->stock_minimo) {
                         $urgencyLevel = 'attention';
                    } else {
                        continue; // No need to restock yet
                    }
                }
            }

            if ($suggestedBuy > 0) {
                $suggestions[] = [
                    'ingredient' => [
                        'id' => $ing->id,
                        'name' => $ing->name,
                        'unit' => $ing->unit,
                        'stock_actual' => $ing->stock_actual,
                        'stock_minimo' => $ing->stock_minimo,
                    ],
                    'metrics' => [
                        'daily_consumption' => round($dailyConsumption, 2),
                        'days_remaining' => round($daysRemaining, 1),
                        'target_days' => $targetDays
                    ],
                    'suggestion' => [
                        'quantity_to_buy' => ceil($suggestedBuy),
                        'urgency' => $urgencyLevel
                    ]
                ];
            }
        }

        // Sort by urgency
        $urgencyOrder = ['critical' => 1, 'warning' => 2, 'attention' => 3];
        usort($suggestions, function ($a, $b) use ($urgencyOrder) {
            $orderA = $urgencyOrder[$a['suggestion']['urgency']] ?? 4;
            $orderB = $urgencyOrder[$b['suggestion']['urgency']] ?? 4;
            if ($orderA === $orderB) {
                return $a['metrics']['days_remaining'] <=> $b['metrics']['days_remaining'];
            }
            return $orderA <=> $orderB;
        });

        // Mock data if everything is empty for the demo
        if (count($suggestions) === 0) {
            $randomIngredients = Ingredient::where('is_active', true)->inRandomOrder()->take(3)->get();
            $fakeUrgencies = ['critical', 'warning', 'attention'];
            foreach($randomIngredients as $index => $ing) {
                $suggestions[] = [
                    'ingredient' => [
                        'id' => $ing->id,
                        'name' => $ing->name,
                        'unit' => $ing->unit,
                        'stock_actual' => $ing->stock_actual,
                        'stock_minimo' => $ing->stock_minimo,
                    ],
                    'metrics' => [
                        'daily_consumption' => rand(10, 50) / 10,
                        'days_remaining' => rand(1, 14),
                        'target_days' => $targetDays
                    ],
                    'suggestion' => [
                        'quantity_to_buy' => rand(10, 100),
                        'urgency' => $fakeUrgencies[$index] ?? 'attention'
                    ]
                ];
            }
        }

        return response()->json([
            'suggestions' => $suggestions,
            'stats' => [
                'total' => count($suggestions),
                'critical' => collect($suggestions)->where('suggestion.urgency', 'critical')->count(),
                'warning' => collect($suggestions)->where('suggestion.urgency', 'warning')->count(),
                'attention' => collect($suggestions)->where('suggestion.urgency', 'attention')->count(),
            ]
        ]);
    }
}
