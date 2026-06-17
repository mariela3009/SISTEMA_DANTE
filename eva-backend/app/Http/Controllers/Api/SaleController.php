<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['user', 'client', 'items.product'])->orderBy('created_at', 'desc');
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }
        return response()->json($query->paginate(20));
    }

    public function createCulqiOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        $totalCobrar = 0;
        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $totalCobrar += $product->discounted_price * $item['quantity'];
        }
        $totalCobrar = round($totalCobrar * 1.18, 2); // Sumar IGV

        $clientDetails = [
            'first_name' => 'Cliente',
            'last_name' => 'POS',
            'email' => 'cliente@cafeteriadante.com',
            'phone_number' => '999999999'
        ];

        if ($request->client_id) {
            $client = \App\Models\Client::find($request->client_id);
            if ($client) {
                $clientDetails['first_name'] = $client->name;
                $clientDetails['last_name'] = '';
                if ($client->email) $clientDetails['email'] = $client->email;
                if ($client->phone) $clientDetails['phone_number'] = $client->phone;
            }
        }

        $response = \Illuminate\Support\Facades\Http::withToken(env('CULQI_SECRET_KEY'))
            ->post('https://api.culqi.com/v2/orders', [
                'amount' => (int) ($totalCobrar * 100),
                'currency_code' => 'PEN',
                'description' => 'Venta POS Cafeteria Dante',
                'order_number' => 'ORD-' . time() . '-' . rand(100, 999),
                'client_details' => $clientDetails,
                'expiration_date' => time() + 86400,
                'confirm' => false
            ]);

        if ($response->successful()) {
            return response()->json(['order_id' => $response->json('id')]);
        }

        $errorMsg = $response->json('user_message') ?? $response->json('merchant_message') ?? 'Error al generar la orden en Culqi.';
        return response()->json(['message' => $errorMsg], 400);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'client_id' => 'nullable|exists:clients,id',
            'invoice_type' => 'required|in:ticket,boleta,factura',
            'payment_method' => 'required|in:cash,efectivo,culqi',
            'culqi_token_id' => 'nullable|string',
            'culqi_order_id' => 'nullable|string'
        ]);

        // Si el método es Culqi, cobramos primero usando el token o validamos la orden
        $culqiChargeId = null;
        if ($request->payment_method === 'culqi') {
            if ($request->culqi_order_id) {
                // Pago procesado con Yape (requiere validar estado de la orden)
                $response = \Illuminate\Support\Facades\Http::withToken(env('CULQI_SECRET_KEY'))
                    ->get('https://api.culqi.com/v2/orders/' . $request->culqi_order_id);

                if (!$response->successful() || $response->json('state') !== 'paid') {
                    return response()->json(['message' => 'La orden de Yape/Culqi no se ha completado o es inválida.'], 400);
                }
                $culqiChargeId = $request->culqi_order_id;
            } else if ($request->culqi_token_id) {
                // Pago procesado con Tarjeta (requiere hacer el charge)
                $totalCobrar = 0;
                foreach ($request->items as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    $totalCobrar += $product->discounted_price * $item['quantity'];
                }
                $totalCobrar = round($totalCobrar * 1.18, 2);

                $response = \Illuminate\Support\Facades\Http::withToken(env('CULQI_SECRET_KEY'))
                    ->post('https://api.culqi.com/v2/charges', [
                        'amount' => (int) ($totalCobrar * 100),
                        'currency_code' => 'PEN',
                        'email' => $request->user()->email ?? 'caja@cafeteriadante.com',
                        'source_id' => $request->culqi_token_id
                    ]);

                if (!$response->successful()) {
                    $errorMsg = $response->json('user_message') ?? $response->json('merchant_message') ?? 'Error al procesar el pago con tarjeta.';
                    return response()->json(['message' => $errorMsg], 400);
                }
                $culqiChargeId = $response->json('id');
            } else {
                return response()->json(['message' => 'Se requiere el token de tarjeta o el ID de la orden de Yape.'], 400);
            }
        }

        $result = DB::transaction(function () use ($request, $culqiChargeId) {
            $subtotal = 0;
            $saleItemsData = [];

            foreach ($request->items as $item) {
                $product = Product::with('recipeItems.ingredient')->lockForUpdate()->findOrFail($item['product_id']);

                if (!$product->is_active) {
                    throw new \Exception("El producto \"{$product->name}\" no está disponible.");
                }

                foreach ($product->recipeItems as $recipeItem) {
                    $required = $recipeItem->quantity * $item['quantity'];
                    if ($recipeItem->ingredient->stock_actual < $required) {
                        throw new \Exception("Stock insuficiente de \"{$recipeItem->ingredient->name}\" para \"{$product->name}\".");
                    }
                }

                $finalPrice = $product->discounted_price;
                $lineSubtotal = $finalPrice * $item['quantity'];
                $subtotal += $lineSubtotal;
                $saleItemsData[] = ['product' => $product, 'quantity' => $item['quantity'], 'unit_price' => $finalPrice, 'subtotal' => $lineSubtotal];
            }

            $igv   = round($subtotal * 0.18, 2);
            $total = round($subtotal + $igv, 2);

            $invoiceType = $request->invoice_type;

            $paymentMethod = $request->payment_method === 'cash' ? 'efectivo' : $request->payment_method;

            $sale = Sale::create([
                'user_id'         => $request->user()->id,
                'client_id'       => $request->client_id,
                'subtotal'        => $subtotal,
                'tax'             => $igv,
                'total'           => $total,
                'payment_method'  => $paymentMethod,
                'paypal_order_id' => $culqiChargeId, // Guardamos el ID del cargo en la columna existente
                'invoice_type'    => $invoiceType,
                'status'          => 'completed',
            ]);

            foreach ($saleItemsData as $data) {
                SaleItem::create([
                    'sale_id'    => $sale->id,
                    'product_id' => $data['product']->id,
                    'quantity'   => $data['quantity'],
                    'unit_price' => $data['unit_price'],
                    'subtotal'   => $data['subtotal'],
                ]);

                foreach ($data['product']->recipeItems as $recipeItem) {
                    $consumed = $recipeItem->quantity * $data['quantity'];
                    $ingredient = Ingredient::lockForUpdate()->findOrFail($recipeItem->ingredient_id);
                    $ingredient->decrement('stock_actual', $consumed);
                    
                    $nuevo_stock = $ingredient->stock_actual;
                    $costo_promedio = $ingredient->costo_promedio;
                    
                    InventoryMovement::create([
                        'ingredient_id'  => $recipeItem->ingredient_id,
                        'user_id'        => $request->user()->id,
                        'type'           => 'salida_venta',
                        'quantity'       => $consumed,
                        'cost_per_unit'  => $costo_promedio,
                        'total_cost'     => $consumed * $costo_promedio,
                        'saldo_cantidad' => $nuevo_stock,
                        'saldo_costo_unitario' => $costo_promedio,
                        'saldo_costo_total' => $nuevo_stock * $costo_promedio,
                        'reason'         => "Venta #{$sale->id} - {$data['product']->name}",
                        'status'         => 'approved',
                        'approved_by'    => $request->user()->id,
                        'approved_at'    => now(),
                    ]);
                }
            }

            return $sale->load(['user', 'client', 'items.product']);
        });

        return response()->json(['message' => 'Venta registrada con éxito.', 'sale' => $result], 201);
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load(['user', 'client', 'items.product']));
    }
}
