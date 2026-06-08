<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class KardexFinancieroTest extends TestCase
{
    use DatabaseTransactions; // MUY IMPORTANTE para no borrar la DB real del usuario

    public function test_entrada_calcula_costo_promedio_correctamente()
    {
        // 1. Preparar datos
        $user = User::create([
            'name' => 'Admin Test',
            'email' => 'admin_test_' . rand() . '@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);
        $this->actingAs($user);

        $ingredient = Ingredient::create([
            'name' => 'Café Test',
            'unit' => 'gr',
            'stock_actual' => 0,
            'costo_promedio' => 0,
            'stock_minimo' => 0,
        ]);

        // 2. Primera entrada (1000 gr a S/0.05 por gramo = S/50 total)
        $response = $this->postJson('/api/inventory/entrada', [
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'quantity' => 1000,
                    'cost_per_unit' => 0.05,
                ]
            ]
        ]);

        $response->assertStatus(201);

        $ingredient->refresh();
        $this->assertEquals(1000, $ingredient->stock_actual);
        $this->assertEquals(0.05, $ingredient->costo_promedio);

        // 3. Segunda entrada (500 gr a S/0.08 por gramo = S/40 total)
        $response2 = $this->postJson('/api/inventory/entrada', [
            'items' => [
                [
                    'ingredient_id' => $ingredient->id,
                    'quantity' => 500,
                    'cost_per_unit' => 0.08,
                ]
            ]
        ]);

        $response2->assertStatus(201);

        $ingredient->refresh();
        $this->assertEquals(1500, $ingredient->stock_actual);
        $this->assertEquals(0.06, $ingredient->costo_promedio);
        
        // 4. Verificar el Kardex (movimientos)
        $this->assertDatabaseHas('inventory_movements', [
            'ingredient_id' => $ingredient->id,
            'type' => 'entrada',
            'quantity' => 1000,
            'saldo_cantidad' => 1000,
            'cost_per_unit' => 0.05,
        ]);

        $this->assertDatabaseHas('inventory_movements', [
            'ingredient_id' => $ingredient->id,
            'type' => 'entrada',
            'quantity' => 500,
            'saldo_cantidad' => 1500,
            'cost_per_unit' => 0.08,
        ]);
    }

    public function test_merma_usa_costo_promedio_y_actualiza_saldo()
    {
        $user = User::create([
            'name' => 'Admin Test 2',
            'email' => 'admin_test2_' . rand() . '@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);
        $this->actingAs($user);

        // Insumo con stock 10 y costo promedio 2.50
        $ingredient = Ingredient::create([
            'name' => 'Leche Test',
            'unit' => 'l',
            'stock_actual' => 10,
            'costo_promedio' => 2.50,
            'stock_minimo' => 0,
        ]);

        // Crear solicitud de merma
        $responseMerma = $this->postJson('/api/inventory/merma', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 2,
            'reason' => 'Se venció',
        ]);

        $responseMerma->assertStatus(201);
        $movementId = $responseMerma->json('id');

        // Aprobar merma
        $responseApprove = $this->postJson("/api/inventory/merma/{$movementId}/approve");
        $responseApprove->assertStatus(200);

        $ingredient->refresh();
        $this->assertEquals(8, $ingredient->stock_actual);
        $this->assertEquals(2.50, $ingredient->costo_promedio); // El costo promedio NO cambia al sacar mermas o ventas

        // Verificar registro en Kardex
        $this->assertDatabaseHas('inventory_movements', [
            'id' => $movementId,
            'status' => 'approved',
            'cost_per_unit' => 2.50, // Toma el costo promedio
            'saldo_cantidad' => 8, // Refleja el nuevo saldo
        ]);
    }
}
