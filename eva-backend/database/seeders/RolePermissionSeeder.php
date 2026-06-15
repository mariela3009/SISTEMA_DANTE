<?php

namespace Database\Seeders;

use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        $modules = [
            'dashboard'   => 'Dashboard',
            'pos'         => 'Punto de Venta',
            'ventas'      => 'Ventas',
            'inventario'  => 'Inventario',
            'productos'   => 'Productos y Recetas',
            'mermas'      => 'Mermas',
            'clientes'    => 'Clientes',
            'promociones' => 'Promociones',
            'ia'          => 'Sugerencias IA',
            'personal'    => 'Personal',
            'roles'       => 'Roles y Permisos',
            'auditoria'   => 'Auditoría',
        ];

        $defaults = [
            'admin' => [
                'dashboard'  => [true, true, true, true],
                'pos'        => [true, true, true, true],
                'ventas'     => [true, true, true, true],
                'inventario' => [true, true, true, true],
                'productos'  => [true, true, true, true],
                'mermas'     => [true, true, true, true],
                'clientes'   => [true, true, true, true],
                'promociones'=> [true, true, true, true],
                'ia'         => [true, true, true, true],
                'personal'   => [true, true, true, true],
                'roles'      => [true, true, true, true],
                'auditoria'  => [true, false, false, false],
            ],
            'cajero' => [
                'dashboard'  => [true, false, false, false],
                'pos'        => [true, true, false, false],
                'ventas'     => [true, true, false, false],
                'inventario' => [false, false, false, false],
                'productos'  => [false, false, false, false],
                'mermas'     => [false, false, false, false],
                'clientes'   => [true, true, true, false],
                'promociones'=> [false, false, false, false],
                'ia'         => [false, false, false, false],
                'personal'   => [false, false, false, false],
                'roles'      => [false, false, false, false],
                'auditoria'  => [false, false, false, false],
            ],
            'cocina' => [
                'dashboard'  => [false, false, false, false],
                'pos'        => [false, false, false, false],
                'ventas'     => [false, false, false, false],
                'inventario' => [true, true, false, false],
                'productos'  => [false, false, false, false],
                'mermas'     => [true, true, false, false],
                'clientes'   => [false, false, false, false],
                'promociones'=> [false, false, false, false],
                'ia'         => [false, false, false, false],
                'personal'   => [false, false, false, false],
                'roles'      => [false, false, false, false],
                'auditoria'  => [false, false, false, false],
            ],
        ];

        foreach ($defaults as $role => $perms) {
            foreach ($perms as $module => $flags) {
                RolePermission::updateOrCreate(
                    ['role' => $role, 'module' => $module],
                    [
                        'module_label' => $modules[$module],
                        'can_view'     => $flags[0],
                        'can_create'   => $flags[1],
                        'can_edit'     => $flags[2],
                        'can_delete'   => $flags[3],
                    ]
                );
            }
        }
    }
}
