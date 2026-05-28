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
