<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::with('products')->orderBy('created_at', 'desc');
        if ($request->has('active')) {
            $query->where('is_active', true)
                  ->where('start_date', '<=', now())
                  ->where('end_date', '>=', now());
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:promotions,name',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id'
        ]);

        $promotion = Promotion::create($request->only('name', 'discount_percentage', 'start_date', 'end_date', 'is_active'));
        $promotion->products()->sync($request->product_ids);

        return response()->json($promotion->load('products'), 201);
    }

    public function show(Promotion $promotion)
    {
        return response()->json($promotion->load('products'));
    }

    public function update(Request $request, Promotion $promotion)
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('promotions', 'name')->ignore($promotion->id)],
            'discount_percentage' => 'numeric|min:0|max:100',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'is_active' => 'boolean',
            'product_ids' => 'array',
            'product_ids.*' => 'exists:products,id'
        ]);

        $promotion->update($request->only('name', 'discount_percentage', 'start_date', 'end_date', 'is_active'));
        if ($request->has('product_ids')) {
            $promotion->products()->sync($request->product_ids);
        }

        return response()->json($promotion->load('products'));
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();
        return response()->json(['message' => 'Promoción eliminada']);
    }
}
