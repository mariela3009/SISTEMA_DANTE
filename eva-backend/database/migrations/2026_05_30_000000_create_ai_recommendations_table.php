<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->id();
            $table->string('type')->index(); // 'demand_forecast', 'combo_suggestion', 'restock_alert'
            $table->json('data');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_recommendations');
    }
};
