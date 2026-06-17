<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Añadir el módulo de cocina/comandas a la tabla de permisos
        $roles = ['admin', 'cocina', 'cajero'];
        $module = 'cocina';
        $module_label = 'Comandas (KDS)';

        foreach ($roles as $role) {
            // Admin y cocina tienen acceso
            $hasAccess = in_array($role, ['admin', 'cocina']);
            
            // Check if it exists to avoid duplicates
            $exists = DB::table('role_permissions')->where('role', $role)->where('module', $module)->exists();
            if (!$exists) {
                DB::table('role_permissions')->insert([
                    'role'         => $role,
                    'module'       => $module,
                    'module_label' => $module_label,
                    'can_view'     => $hasAccess,
                    'can_create'   => false, // En cocina KDS no se crea, solo se cambia estado
                    'can_edit'     => $hasAccess,
                    'can_delete'   => false,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
        }
    }

    public function down()
    {
        DB::table('role_permissions')->where('module', 'cocina')->delete();
    }
};
