<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->decimal('stock_cocina', 10, 3)->default(0.000)->after('stock_actual');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->enum('status', ['pending', 'preparing', 'ready', 'delivered'])->default('pending')->after('subtotal');
        });

        DB::statement("ALTER TABLE inventory_movements MODIFY COLUMN type ENUM('entrada', 'salida_venta', 'salida_merma', 'ajuste', 'pase_cocina') NOT NULL");
    }

    public function down()
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropColumn('stock_cocina');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        DB::statement("ALTER TABLE inventory_movements MODIFY COLUMN type ENUM('entrada', 'salida_venta', 'salida_merma', 'ajuste') NOT NULL");
    }
};
