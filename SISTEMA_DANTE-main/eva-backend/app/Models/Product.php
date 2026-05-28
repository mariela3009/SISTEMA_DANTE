<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price', 'image_url', 'category_id', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'price'     => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function recipeItems()
    {
        return $this->hasMany(RecipeItem::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    // Verifica si todos los insumos de la receta tienen stock
    public function hasStock(int $quantity = 1): bool
    {
        foreach ($this->recipeItems as $item) {
            if ($item->ingredient->stock_actual < ($item->quantity * $quantity)) {
                return false;
            }
        }
        return true;
    }
}
