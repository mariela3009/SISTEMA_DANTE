<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        // API pura: no existe ruta 'login' web, siempre retornar null
        // Laravel responderá con JSON 401 Unauthenticated automáticamente
        return null;
    }
}
