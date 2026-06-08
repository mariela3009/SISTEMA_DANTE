<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ClientController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - EVA Sistema Cafetería Dante
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas (requieren token JWT)
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Usuarios y Auditoría (Solo admin)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/users', \App\Http\Controllers\Api\UserController::class);
        Route::get('/audit-logs', [\App\Http\Controllers\Api\AuditController::class, 'index']);
    });

    // Dashboard (Solo Admin)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->middleware('role:admin');
    Route::get('/alerts/stock',    [DashboardController::class, 'stockAlerts'])->middleware('role:admin');

    // Categorías (Todos autenticados)
    Route::get('/categories', [CategoryController::class, 'index']);

    // Productos (Admin gestiona, Cajero puede ver)
    Route::get('/products',              [ProductController::class, 'index']);
    Route::get('/products/{product}',    [ProductController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/products',             [ProductController::class, 'store']);
        Route::put('/products/{product}',    [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/products/{product}/recipe', [ProductController::class, 'saveRecipe']);
    });

    // Promociones (Admin)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/promotions', \App\Http\Controllers\Api\PromotionController::class);
    });

    // Insumos (Admin y Cocina)
    Route::get('/ingredients',              [IngredientController::class, 'index']);
    Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show']);
    Route::middleware('role:admin')->group(function () {
        Route::post('/ingredients',             [IngredientController::class, 'store']);
        Route::put('/ingredients/{ingredient}', [IngredientController::class, 'update']);
        Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy']);
    });

    // Clientes (Cajero y Admin)
    Route::middleware('role:admin,cajero')->group(function () {
        Route::apiResource('/clients', ClientController::class);
    });

    // Inventario / Movimientos (Admin, Cocina)
    Route::get('/inventory/movements',               [InventoryController::class, 'movements'])->middleware('role:admin,cocina');
    Route::post('/inventory/entrada',                [InventoryController::class, 'entrada'])->middleware('role:admin');
    Route::post('/inventory/merma',                  [InventoryController::class, 'merma'])->middleware('role:admin,cocina');
    Route::post('/inventory/merma-producto',         [InventoryController::class, 'mermaProducto'])->middleware('role:admin,cocina');
    Route::post('/inventory/merma/{movement}/approve', [InventoryController::class, 'approveMerma'])->middleware('role:admin');
    Route::post('/inventory/merma/{movement}/reject',  [InventoryController::class, 'rejectMerma'])->middleware('role:admin');

    // Cocina (KDS)
    Route::middleware('role:admin,cocina')->group(function () {
        Route::get('/kitchen', [\App\Http\Controllers\Api\KitchenController::class, 'index']);
        Route::put('/kitchen/{saleItem}/status', [\App\Http\Controllers\Api\KitchenController::class, 'updateStatus']);
        Route::post('/kitchen/{saleItem}/cancel', [\App\Http\Controllers\Api\KitchenController::class, 'cancelItem']);
    });

    // Ventas / POS (Solo Cajero y Admin)
    Route::middleware('role:admin,cajero')->group(function () {
        Route::apiResource('/sales', \App\Http\Controllers\Api\SaleController::class)->except(['update', 'destroy']);
    });

    // Inteligencia Artificial (Admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/ai/dashboard', [\App\Http\Controllers\Api\AiDashboardController::class, 'index']);
    });
});
