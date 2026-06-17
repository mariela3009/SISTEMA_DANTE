<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Combo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'image_url', 'special_price', 'is_active', 'start_date', 'end_date'
    ];

    protected $casts = [
        'special_price' => 'float',
        'is_active'     => 'boolean',
        'start_date'    => 'datetime',
        'end_date'      => 'datetime',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'combo_products')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }

    public function getIsCurrentlyActiveAttribute(): bool
    {
        if (!$this->is_active) return false;
        $now = now();
        if ($this->start_date && $now < $this->start_date) return false;
        if ($this->end_date && $now > $this->end_date) return false;
        return true;
    }

    // Precio total de los productos sin descuento
    public function getOriginalPriceAttribute(): float
    {
        return $this->products->sum(fn($p) => $p->price * ($p->pivot->quantity ?? 1));
    }

    // % de ahorro del combo
    public function getSavingsPercentageAttribute(): float
    {
        $original = $this->original_price;
        if ($original <= 0) return 0;
        return round((($original - $this->special_price) / $original) * 100, 1);
    }
}
