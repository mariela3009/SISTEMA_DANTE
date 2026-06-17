<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\InventoryMovement;

$movements = InventoryMovement::where('type', 'entrada')->where('cost_per_unit', '>', 5)->get();

foreach($movements as $mov) { 
    $mov->cost_per_unit = $mov->cost_per_unit / $mov->quantity; 
    $mov->save(); 
    echo "Fixed mov {$mov->id}\n"; 
}
