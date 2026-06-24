<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * POST /api/login
     * Valida el correo y contraseña del usuario.
     * Si son correctos, devuelve un Token JWT de seguridad para mantener la sesión abierta.
     * También valida si la cuenta del usuario no ha sido desactivada por un Administrador.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (! $token = auth('api')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        $user = auth('api')->user();

        if (!$user->is_active) {
            auth('api')->logout();
            return response()->json([
                'message' => 'Acceso denegado. Tu cuenta está inhabilitada.',
            ], 403);
        }

        return $this->respondWithToken($token);
    }

    /**
     * POST /api/logout
     */
    public function logout()
    {
        auth('api')->logout();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    /**
     * GET /api/me
     * Obtiene los datos del usuario que actualmente tiene sesión iniciada.
     * Carga todos sus permisos dependiendo de su Rol (ej. Admin, Cajero, Cocinero)
     * para saber qué pantallas del frontend mostrarle.
     */
    public function me()
    {
        $user = auth('api')->user();
        $permissions = \App\Models\RolePermission::where('role', $user->role)
            ->get()
            ->keyBy('module');

        return response()->json(array_merge($user->toArray(), ['permissions' => $permissions]));
    }

    /**
     * POST /api/refresh
     */
    public function refresh()
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    protected function respondWithToken($token)
    {
        $user = auth('api')->user();
        $permissions = \App\Models\RolePermission::where('role', $user->role)
            ->get()
            ->keyBy('module');

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => array_merge($user->toArray(), ['permissions' => $permissions])
        ]);
    }

    /**
     * POST /api/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }
}
