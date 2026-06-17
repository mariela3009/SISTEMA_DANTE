<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'ingredient_id', 'user_id', 'type', 'quantity', 'saldo_cantidad',
        'cost_per_unit', 'reason', 'document_ref',
        'status', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'quantity'       => 'float',
        'saldo_cantidad' => 'float',
        'cost_per_unit'  => 'float',
        'approved_at'    => 'datetime',
    ];

    protected $appends = ['total_cost', 'saldo_costo_unitario', 'saldo_costo_total'];

    public function getTotalCostAttribute()
    {
        return round($this->quantity * $this->cost_per_unit, 2);
    }

    public function getSaldoCostoUnitarioAttribute()
    {
        // El costo por unidad guardado en el momento del movimiento es el costo promedio vigente
        return round($this->cost_per_unit, 2);
    }

    public function getSaldoCostoTotalAttribute()
    {
        // El saldo_cantidad * costo_promedio
        return round($this->saldo_cantidad * $this->cost_per_unit, 2);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
