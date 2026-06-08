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

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'client_id' => 'nullable|exists:clients,id',
            'invoice_type' => 'required|in:ticket,boleta,factura',
            'payment_method' => 'required|in:cash,paypal',
            'paypal_order_id' => 'required_if:payment_method,paypal'
        ]);

        $result = DB::transaction(function () use ($request) {
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

            $sale = Sale::create([
                'user_id'         => $request->user()->id,
                'client_id'       => $request->client_id,
                'subtotal'        => $subtotal,
                'tax'             => $igv,
                'total'           => $total,
                'payment_method'  => $request->payment_method,
                'paypal_order_id' => $request->paypal_order_id,
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
                    
                    InventoryMovement::create([
                        'ingredient_id'  => $recipeItem->ingredient_id,
                        'user_id'        => $request->user()->id,
                        'type'           => 'salida_venta',
                        'quantity'       => $consumed,
                        'cost_per_unit'  => $ingredient->costo_promedio,
                        'saldo_cantidad' => $ingredient->stock_actual,
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
