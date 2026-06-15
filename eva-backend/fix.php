<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement("ALTER TABLE sales MODIFY COLUMN payment_method ENUM('efectivo','paypal','culqi') NOT NULL DEFAULT 'efectivo'");
    echo "OK";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
