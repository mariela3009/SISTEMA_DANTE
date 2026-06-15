<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIngredientsTable extends Migration
{
    public function up()
    {
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('unit', ['gr', 'kg', 'ml', 'l', 'unidad'])->default('unidad');
            $table->decimal('stock_actual', 10, 3)->default(0);
            $table->decimal('stock_minimo', 10, 3)->default(0);
            $table->date('fecha_vencimiento')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ingredients');
    }
}
