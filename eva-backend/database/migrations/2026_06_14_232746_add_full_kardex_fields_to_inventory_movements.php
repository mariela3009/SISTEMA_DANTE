<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            // El costo total del movimiento (Cantidad * Costo Unitario)
            $table->decimal('total_cost', 10, 4)->nullable()->after('cost_per_unit');
            
            // Costo Promedio Ponderado vigente DESPUÉS de este movimiento
            $table->decimal('saldo_costo_unitario', 10, 4)->nullable()->after('saldo_cantidad');
            
            // Valorización Total del Inventario DESPUÉS de este movimiento (Saldo Cantidad * Saldo Costo Unitario)
            $table->decimal('saldo_costo_total', 12, 4)->nullable()->after('saldo_costo_unitario');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn(['total_cost', 'saldo_costo_unitario', 'saldo_costo_total']);
        });
    }
};
