<?php

namespace Database\Factories;

use App\Models\ItemCategory;
use App\Models\LostItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LostItem>
 */
class LostItemFactory extends Factory
{
    protected $model = LostItem::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'item_category_id' => ItemCategory::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'keywords' => [fake()->word(), fake()->word()],
            'lost_location' => fake()->city(),
            'lost_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'image_path' => null,
            'contact_preference' => 'email',
            'status' => 'open',
        ];
    }
}