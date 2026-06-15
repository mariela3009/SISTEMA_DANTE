<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $fillable = [
        'role',
        'module',
        'module_label',
        'can_view',
        'can_create',
        'can_edit',
        'can_delete',
    ];

    protected $casts = [
        'can_view'   => 'boolean',
        'can_create' => 'boolean',
        'can_edit'   => 'boolean',
        'can_delete' => 'boolean',
    ];

    /**
     * Get all permissions for a specific role, keyed by module.
     */
    public static function forRole(string $role)
    {
        return static::where('role', $role)->get();
    }

    /**
     * Get permissions grouped by role.
     */
    public static function allGroupedByRole()
    {
        return static::all()->groupBy('role');
    }
}
