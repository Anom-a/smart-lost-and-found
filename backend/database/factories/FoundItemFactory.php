<?php

namespace Database\Factories;

use App\Models\FoundItem;
use App\Models\ItemCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FoundItem>
 */
class FoundItemFactory extends Factory
{
    protected $model = FoundItem::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'item_category_id' => ItemCategory::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'keywords' => [fake()->word(), fake()->word()],
            'found_location' => fake()->city(),
            'found_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'image_path' => null,
            'handover_location' => null,
            'status' => 'available',
        ];
    }
}