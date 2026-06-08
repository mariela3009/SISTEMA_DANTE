<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecipeItemsTable extends Migration
{
    public function up()
    {
        Schema::create('recipe_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('ingredient_id')->constrained()->onDelete('restrict');
            $table->decimal('quantity', 10, 3); // cantidad requerida por unidad de producto
            $table->timestamps();

            $table->unique(['product_id', 'ingredient_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('recipe_items');
    }
}
