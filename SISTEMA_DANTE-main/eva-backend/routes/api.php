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

// Rutas protegidas (requieren token Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Usuarios
    Route::apiResource('/users', \App\Http\Controllers\Api\UserController::class);

    // Dashboard (solo Admin)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/alerts/stock',    [DashboardController::class, 'stockAlerts']);

    // Categorías
    Route::get('/categories', [CategoryController::class, 'index']);

    // Productos
    Route::get('/products',              [ProductController::class, 'index']);
    Route::get('/products/{product}',    [ProductController::class, 'show']);
    Route::post('/products',             [ProductController::class, 'store']);
    Route::put('/products/{product}',    [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::post('/products/{product}/recipe', [ProductController::class, 'saveRecipe']);

    // Insumos
    Route::get('/ingredients',              [IngredientController::class, 'index']);
    Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show']);
    Route::post('/ingredients',             [IngredientController::class, 'store']);
    Route::put('/ingredients/{ingredient}', [IngredientController::class, 'update']);
    Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy']);

    // Clientes (RF-018)
    Route::apiResource('/clients', ClientController::class);

    // Inventario / Movimientos
    Route::get('/inventory/movements',               [InventoryController::class, 'movements']);
    Route::post('/inventory/entrada',                [InventoryController::class, 'entrada']);
    Route::post('/inventory/merma',                  [InventoryController::class, 'merma']);
    Route::post('/inventory/merma/{movement}/approve', [InventoryController::class, 'approveMerma']);
    Route::post('/inventory/merma/{movement}/reject',  [InventoryController::class, 'rejectMerma']);

    // Ventas / POS
    Route::get('/sales',          [SaleController::class, 'index']);
    Route::post('/sales',         [SaleController::class, 'store']);
    Route::get('/sales/{sale}',   [SaleController::class, 'show']);
});
