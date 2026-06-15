<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (!empty($roles) && !in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Acceso denegado. Permisos insuficientes para tu rol.'
            ], 403);
        }

        return $next($request);
    }
}
