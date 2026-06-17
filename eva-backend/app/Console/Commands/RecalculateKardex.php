<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ingredient;
use App\Models\InventoryMovement;

class RecalculateKardex extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'kardex:recalculate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalcula los costos y saldos históricos del Kardex';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ingredients = Ingredient::all();
        
        foreach ($ingredients as $ingredient) {
            $movements = InventoryMovement::where('ingredient_id', $ingredient->id)
                ->orderBy('created_at', 'asc')
                ->orderBy('id', 'asc')
                ->get();
                
            $current_stock = 0;
            $current_cost = 0;

            foreach ($movements as $mov) {
                if ($mov->type === 'entrada') {
                    $mov_cost_unit = $mov->cost_per_unit > 0 ? $mov->cost_per_unit : $current_cost;
                    
                    if ($current_stock + $mov->quantity > 0 && $mov_cost_unit > 0) {
                        $current_cost = (($current_stock * $current_cost) + ($mov->quantity * $mov_cost_unit)) / ($current_stock + $mov->quantity);
                    }
                    
                    $current_stock += $mov->quantity;
                    
                    $mov->saldo_cantidad = $current_stock;
                    $mov->cost_per_unit = $mov_cost_unit;
                    $mov->total_cost = $mov->quantity * $mov_cost_unit;
                    $mov->saldo_costo_unitario = $current_cost;
                    $mov->saldo_costo_total = $current_stock * $current_cost;
                } else if (in_array($mov->type, ['salida_venta', 'salida_merma'])) {
                    $current_stock -= $mov->quantity;
                    
                    $mov->saldo_cantidad = $current_stock;
                    $mov->cost_per_unit = $current_cost;
                    $mov->total_cost = $mov->quantity * $current_cost;
                    $mov->saldo_costo_unitario = $current_cost;
                    $mov->saldo_costo_total = $current_stock * $current_cost;
                }
                
                $mov->save();
            }
            
            $ingredient->stock_actual = $current_stock;
            $ingredient->costo_promedio = $current_cost;
            $ingredient->save();
        }

        $this->info('Historial del Kardex recalculado satisfactoriamente.');
        return 0;
    }
}
