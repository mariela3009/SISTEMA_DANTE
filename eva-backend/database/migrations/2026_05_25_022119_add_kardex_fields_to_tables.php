<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddKardexFieldsToTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->decimal('costo_promedio', 10, 4)->default(0)->after('stock_actual');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->decimal('saldo_cantidad', 10, 3)->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropColumn('costo_promedio');
        });

        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropColumn('saldo_cantidad');
        });
    }
}
