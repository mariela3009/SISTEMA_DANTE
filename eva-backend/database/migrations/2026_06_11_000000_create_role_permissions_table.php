<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRolePermissionsTable extends Migration
{
    public function up()
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->enum('role', ['admin', 'cajero', 'cocina']);
            $table->string('module');        // dashboard, pos, ventas, inventario, etc.
            $table->string('module_label');   // Nombre legible: "Punto de Venta"
            $table->boolean('can_view')->default(false);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->timestamps();

            $table->unique(['role', 'module']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('role_permissions');
    }
}
