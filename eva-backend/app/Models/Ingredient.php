<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'unit', 'stock_actual', 'costo_promedio', 'stock_minimo', 'fecha_vencimiento', 'is_active'
    ];

    protected $casts = [
        'is_active'       => 'boolean',
        'stock_actual'    => 'float',
        'costo_promedio'  => 'float',
        'stock_minimo'    => 'float',
        'fecha_vencimiento' => 'date',
    ];

    // Estado calculado del insumo
    public function getStatusAttribute(): string
    {
        if ($this->stock_actual <= 0) return 'sin_stock';
        if ($this->stock_actual <= $this->stock_minimo) return 'stock_bajo';
        if ($this->fecha_vencimiento && $this->fecha_vencimiento->isPast()) return 'vencido';
        if ($this->fecha_vencimiento && $this->fecha_vencimiento->diffInDays(now()) <= 7) return 'por_vencer';
        return 'normal';
    }

    public function recipeItems()
    {
        return $this->hasMany(RecipeItem::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }
}
