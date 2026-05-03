<?php

namespace Tests\Feature;

use Database\Seeders\ItemCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemCategorySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_item_categories_are_seeded(): void
    {
        $this->seed(ItemCategorySeeder::class);

        $expectedCategories = [
            'Electronics',
            'Clothing',
            'Documents/Books',
            'Keys',
            'Bags',
            'Accessories',
            'Sports Equipment',
            'Other',
        ];

        foreach ($expectedCategories as $category) {
            $this->assertDatabaseHas('item_categories', [
                'name' => $category,
            ]);
        }

        $this->assertDatabaseCount('item_categories', 8);
    }
}
