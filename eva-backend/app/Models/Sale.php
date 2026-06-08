<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'client_id', 'subtotal', 'tax', 'total', 'payment_method', 'invoice_type', 'status', 'paypal_order_id'
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax'      => 'float',
        'total'    => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }
}

