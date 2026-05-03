<?php

namespace Tests\Feature;

use App\Models\FoundItem;
use App\Models\ItemCategory;
use App\Models\LostItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProtectedRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_protected_routes_return_401_without_token(): void
    {
        $category = ItemCategory::create(['name' => 'Other', 'slug' => 'other']);
        $user = User::factory()->create();
        $lostItem = LostItem::create([
            'user_id' => $user->id,
            'item_category_id' => $category->id,
            'title' => 'Lost wallet',
            'description' => 'Wallet lost near the parking area.',
            'images' => [],
            'status' => 'open',
        ]);
        $foundItem = FoundItem::create([
            'user_id' => $user->id,
            'item_category_id' => $category->id,
            'title' => 'Found wallet',
            'description' => 'Wallet found near the parking area.',
            'images' => [],
            'status' => 'available',
        ]);

        $this->postJson('/api/lost-items', [])->assertUnauthorized();
        $this->putJson('/api/lost-items/'.$lostItem->id, [])->assertUnauthorized();
        $this->deleteJson('/api/lost-items/'.$lostItem->id)->assertUnauthorized();

        $this->postJson('/api/found-items', [])->assertUnauthorized();
        $this->putJson('/api/found-items/'.$foundItem->id, [])->assertUnauthorized();
        $this->deleteJson('/api/found-items/'.$foundItem->id)->assertUnauthorized();

        $this->getJson('/api/claims')->assertUnauthorized();
        $this->postJson('/api/claims', [])->assertUnauthorized();
        $this->getJson('/api/notifications')->assertUnauthorized();
        $this->postJson('/api/notifications/mark-all-read')->assertUnauthorized();
    }
}
