<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiRecommendation;

class AiDashboardController extends Controller
{
    /**
     * GET /api/ai/dashboard (o similar)
     * Obtiene las últimas recomendaciones generadas por la Inteligencia Artificial.
     */
    public function index()
    {
        $recommendations = AiRecommendation::all()->groupBy('type');
        
        return response()->json([
            'demand_forecast' => $recommendations->get('demand_forecast', collect())->pluck('data')->first() ?? [],
            'combo_suggestion' => $recommendations->get('combo_suggestion', collect())->pluck('data')->first() ?? [],
            'restock_alert' => $recommendations->get('restock_alert', collect())->pluck('data')->first() ?? [],
        ]);
    }
}
