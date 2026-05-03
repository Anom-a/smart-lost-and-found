<?php

namespace Tests\Feature;

use App\Models\FoundItem;
use App\Models\ItemCategory;
use App\Models\LostItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LostItemMatchesTest extends TestCase
{
    use RefreshDatabase;

    public function test_lost_item_matches_endpoint_returns_scored_available_found_items(): void
    {
        $category = ItemCategory::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $user = User::factory()->create();

        $lostItem = LostItem::create([
            'user_id' => $user->id,
            'item_category_id' => $category->id,
            'title' => 'Lost black laptop',
            'description' => 'A black laptop lost near the main library.',
            'keywords' => ['black', 'laptop'],
            'lost_location' => 'Main Library',
            'lost_at' => now(),
            'images' => [],
            'status' => 'open',
        ]);

        FoundItem::create([
            'user_id' => User::factory()->create()->id,
            'item_category_id' => $category->id,
            'title' => 'Found black laptop',
            'description' => 'A black laptop found at the library desk.',
            'keywords' => ['black', 'laptop'],
            'found_location' => 'Library desk',
            'found_at' => now(),
            'images' => [],
            'status' => 'available',
        ]);

        FoundItem::create([
            'user_id' => User::factory()->create()->id,
            'item_category_id' => $category->id,
            'title' => 'Claimed black laptop',
            'description' => 'A black laptop found at the library desk.',
            'keywords' => ['black', 'laptop'],
            'found_location' => 'Library desk',
            'found_at' => now(),
            'images' => [],
            'status' => 'claimed',
        ]);

        $this->getJson('/api/lost-items/'.$lostItem->id.'/matches')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'available')
            ->assertJsonStructure([
                'data' => [
                    [
                        'id',
                        'match_score',
                        'match_breakdown' => ['category', 'keyword', 'date', 'location', 'total'],
                    ],
                ],
            ]);
    }
}
