<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    // Solo manejamos created_at, no hay updated_at
    public $timestamps = false;
    
    protected $fillable = [
        'user_id', 'action', 'table_name', 'record_id', 'old_values', 'new_values', 'created_at'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
