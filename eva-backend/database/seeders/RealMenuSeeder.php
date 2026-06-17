<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class RealMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            'Café de Especialidad' => Category::firstOrCreate(['name' => 'Café de Especialidad']),
            'Bebidas Frías y Calientes' => Category::firstOrCreate(['name' => 'Bebidas Frías y Calientes']),
            'Salados' => Category::firstOrCreate(['name' => 'Salados']),
            'Dulces' => Category::firstOrCreate(['name' => 'Dulces']),
        ];

        $menu = [
            // 1. Café de Especialidad
            ['name' => 'V60', 'price' => 12.00, 'category_id' => $categories['Café de Especialidad']->id],
            ['name' => 'Origami', 'price' => 12.00, 'category_id' => $categories['Café de Especialidad']->id],
            ['name' => 'Prensa Francesa', 'price' => 12.00, 'category_id' => $categories['Café de Especialidad']->id],
            ['name' => 'Cafetera Gota a Gota (Chica)', 'price' => 12.00, 'category_id' => $categories['Café de Especialidad']->id],
            ['name' => 'Cafetera Gota a Gota (Grande)', 'price' => 20.00, 'category_id' => $categories['Café de Especialidad']->id],

            // 2. Bebidas Frías y Calientes
            ['name' => 'Mango Cold Brew', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Strawberry Cold Brew', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Cáscara Tonic', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Cold brew Tonic', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Cold brew - Cola', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Chocolate Caliente', 'price' => 10.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Ponche de Zapallo de Carga', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Latte Helado', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Jamaica Cooler', 'price' => 14.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Coffee Danshakes!', 'price' => 15.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Dantonic Chilcano', 'price' => 22.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],
            ['name' => 'Infusiones naturales', 'price' => 5.00, 'category_id' => $categories['Bebidas Frías y Calientes']->id],

            // 3. Salados
            ['name' => 'Croissant con lomito ahumado y queso', 'price' => 15.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Sánguche de jamón del país', 'price' => 15.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Pan con chicharrón', 'price' => 15.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Sánguche de pollo', 'price' => 15.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Pastel de acelga', 'price' => 10.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Pizza Capra', 'price' => 20.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Empanada de Aceitunas', 'price' => 6.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Empanada de queso de cabra Tarateño', 'price' => 6.00, 'category_id' => $categories['Salados']->id],
            ['name' => 'Empanada de Cordero', 'price' => 6.00, 'category_id' => $categories['Salados']->id],

            // 4. Dulces
            ['name' => 'Torta de Chocolate', 'price' => 15.00, 'category_id' => $categories['Dulces']->id],
            ['name' => 'Suspiro de Limeña / Suspiro de Tacneña', 'price' => 10.00, 'category_id' => $categories['Dulces']->id],
            ['name' => 'Torta de Zanahoria', 'price' => 15.00, 'category_id' => $categories['Dulces']->id],
            ['name' => 'Churros con chocolate', 'price' => 14.00, 'category_id' => $categories['Dulces']->id],
            ['name' => 'Croissant de chocolate', 'price' => 12.00, 'category_id' => $categories['Dulces']->id],
        ];

        foreach ($menu as $item) {
            Product::updateOrCreate(
                ['name' => $item['name']],
                [
                    'price' => $item['price'],
                    'category_id' => $item['category_id'],
                    'is_active' => true
                ]
            );
        }
    }
}
