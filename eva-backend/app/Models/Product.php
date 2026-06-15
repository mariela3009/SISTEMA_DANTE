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

    protected $appends = ['discounted_price', 'active_promotion'];

    public function getActivePromotionAttribute()
    {
        return $this->promotions()
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }

    public function getDiscountedPriceAttribute()
    {
        $promo = $this->active_promotion;
        if ($promo) {
            return round($this->price * (1 - ($promo->discount_percentage / 100)), 2);
        }
        return $this->price;
    }

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

    public function promotions()
    {
        return $this->belongsToMany(Promotion::class, 'promotion_product');
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
