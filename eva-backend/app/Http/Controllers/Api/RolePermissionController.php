<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RolePermissionController extends Controller
{
    /**
     * GET /api/role-permissions
     * Returns all permissions grouped by role.
     */
    public function index()
    {
        $permissions = RolePermission::orderBy('role')
            ->orderBy('id')
            ->get()
            ->groupBy('role');

        return response()->json($permissions);
    }

    /**
     * GET /api/role-permissions/{role}
     * Returns permissions for a specific role.
     */
    public function show(string $role)
    {
        if (!in_array($role, ['admin', 'cajero', 'cocina'])) {
            return response()->json(['message' => 'Rol no válido.'], 404);
        }

        $permissions = RolePermission::where('role', $role)
            ->orderBy('id')
            ->get();

        return response()->json($permissions);
    }

    /**
     * PUT /api/role-permissions/{role}
     * Bulk update permissions for a role.
     *
     * Expected payload:
     * {
     *   "permissions": [
     *     { "module": "dashboard", "can_view": true, "can_create": false, ... },
     *     ...
     *   ]
     * }
     */
    public function update(Request $request, string $role)
    {
        if (!in_array($role, ['admin', 'cajero', 'cocina'])) {
            return response()->json(['message' => 'Rol no válido.'], 404);
        }

        $request->validate([
            'permissions'              => 'required|array',
            'permissions.*.module'     => 'required|string',
            'permissions.*.can_view'   => 'required|boolean',
            'permissions.*.can_create' => 'required|boolean',
            'permissions.*.can_edit'   => 'required|boolean',
            'permissions.*.can_delete' => 'required|boolean',
        ]);

        foreach ($request->permissions as $perm) {
            RolePermission::where('role', $role)
                ->where('module', $perm['module'])
                ->update([
                    'can_view'   => $perm['can_view'],
                    'can_create' => $perm['can_create'],
                    'can_edit'   => $perm['can_edit'],
                    'can_delete' => $perm['can_delete'],
                ]);
        }

        $updated = RolePermission::where('role', $role)->orderBy('id')->get();

        return response()->json([
            'message'     => "Permisos del rol '$role' actualizados correctamente.",
            'permissions' => $updated,
        ]);
    }

    /**
     * POST /api/role-permissions/{role}/reset
     * Reset permissions for a role to defaults.
     */
    public function reset(string $role)
    {
        if (!in_array($role, ['admin', 'cajero', 'cocina'])) {
            return response()->json(['message' => 'Rol no válido.'], 404);
        }

        $defaults = $this->getDefaults();

        if (!isset($defaults[$role])) {
            return response()->json(['message' => 'No hay valores por defecto para este rol.'], 404);
        }

        foreach ($defaults[$role] as $module => $perms) {
            RolePermission::where('role', $role)
                ->where('module', $module)
                ->update([
                    'can_view'   => $perms['can_view'],
                    'can_create' => $perms['can_create'],
                    'can_edit'   => $perms['can_edit'],
                    'can_delete' => $perms['can_delete'],
                ]);
        }

        $updated = RolePermission::where('role', $role)->orderBy('id')->get();

        return response()->json([
            'message'     => "Permisos del rol '$role' restaurados a valores por defecto.",
            'permissions' => $updated,
        ]);
    }

    /**
     * Default permission map.
     */
    private function getDefaults(): array
    {
        return [
            'admin' => [
                'dashboard'  => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'pos'        => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'ventas'     => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'inventario' => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'productos'  => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'mermas'     => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'clientes'   => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'promociones'=> ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'ia'         => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'personal'   => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'roles'      => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => true],
                'auditoria'  => ['can_view' => true,  'can_create' => false, 'can_edit' => false, 'can_delete' => false],
            ],
            'cajero' => [
                'dashboard'  => ['can_view' => true,  'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'pos'        => ['can_view' => true,  'can_create' => true,  'can_edit' => false, 'can_delete' => false],
                'ventas'     => ['can_view' => true,  'can_create' => true,  'can_edit' => false, 'can_delete' => false],
                'inventario' => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'productos'  => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'mermas'     => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'clientes'   => ['can_view' => true,  'can_create' => true,  'can_edit' => true,  'can_delete' => false],
                'promociones'=> ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'ia'         => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'personal'   => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'roles'      => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'auditoria'  => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
            ],
            'cocina' => [
                'dashboard'  => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'pos'        => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'ventas'     => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'inventario' => ['can_view' => true,  'can_create' => true,  'can_edit' => false, 'can_delete' => false],
                'productos'  => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'mermas'     => ['can_view' => true,  'can_create' => true,  'can_edit' => false, 'can_delete' => false],
                'clientes'   => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'promociones'=> ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'ia'         => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'personal'   => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'roles'      => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
                'auditoria'  => ['can_view' => false, 'can_create' => false, 'can_edit' => false, 'can_delete' => false],
            ],
        ];
    }
}
