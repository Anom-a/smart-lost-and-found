<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ItemCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Electronics',
            'Clothing',
            'Documents/Books',
            'Keys',
            'Bags',
            'Accessories',
            'Sports Equipment',
            'Other',
        ];

        foreach ($categories as $category) {
            DB::table('item_categories')->updateOrInsert(
                ['slug' => Str::slug($category)],
                [
                    'name' => $category,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
