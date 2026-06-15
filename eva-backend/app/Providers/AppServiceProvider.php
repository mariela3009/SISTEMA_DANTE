<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Registro de Auditoría
        \App\Models\Product::observe(\App\Observers\AuditObserver::class);
        \App\Models\Ingredient::observe(\App\Observers\AuditObserver::class);
        \App\Models\Sale::observe(\App\Observers\AuditObserver::class);
        \App\Models\InventoryMovement::observe(\App\Observers\AuditObserver::class);

        ResetPassword::createUrlUsing(function ($notifiable, $token) {
            return "http://localhost:3000/recuperar-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
