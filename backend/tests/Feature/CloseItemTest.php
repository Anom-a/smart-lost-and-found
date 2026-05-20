<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\LostItem;
use App\Models\FoundItem;
use App\Models\ItemCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CloseItemTest extends TestCase
{
    use RefreshDatabase;

    private function createUserWithToken()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        return $user;
    }

    private function createLostItem(User $user, array $overrides = [])
    {
        $category = ItemCategory::firstOrCreate(
            ['slug' => 'electronics'],
            ['name' => 'Electronics']
        );
        return LostItem::create(array_merge([
            'user_id' => $user->id,
            'item_category_id' => $category->id,
            'title' => 'Lost Phone',
            'description' => 'Black iPhone',
            'status' => 'open',
            'contact_phone' => '+251912345678',
        ], $overrides));
    }

    private function createFoundItem(User $user, array $overrides = [])
    {
        $category = ItemCategory::firstOrCreate(
            ['slug' => 'electronics'],
            ['name' => 'Electronics']
        );
        return FoundItem::create(array_merge([
            'user_id' => $user->id,
            'item_category_id' => $category->id,
            'title' => 'Found Phone',
            'description' => 'Found iPhone black',
            'status' => 'available',
            'contact_phone' => '+251912345678',
        ], $overrides));
    }

    // --- Lost Item Close Tests ---

    public function test_owner_can_close_their_lost_item()
    {
        $user = $this->createUserWithToken();
        $item = $this->createLostItem($user);

        $response = $this->patchJson("/api/lost-items/{$item->id}/close");

        $response->assertOk();
        $this->assertEquals('closed', $item->refresh()->status);
    }

    public function test_non_owner_cannot_close_lost_item()
    {
        $owner = User::factory()->create();
        $item = $this->createLostItem($owner);

        $nonOwner = $this->createUserWithToken();

        $response = $this->patchJson("/api/lost-items/{$item->id}/close");

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_close_lost_item()
    {
        $owner = User::factory()->create();
        $item = $this->createLostItem($owner);

        $response = $this->patchJson("/api/lost-items/{$item->id}/close");

        $response->assertUnauthorized();
    }

    public function test_closing_a_lost_item_is_permanent()
    {
        $user = $this->createUserWithToken();
        // Since 'closed' might not be valid yet in Enum validation, we bypass or implement:
        $item = $this->createLostItem($user, ['status' => 'closed']);

        $response = $this->patchJson("/api/lost-items/{$item->id}/close");

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'The item is already closed.']);
    }

    public function test_closed_lost_items_are_hidden_from_browse_by_default()
    {
        $user = User::factory()->create();
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'closed']);
        $this->createLostItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/lost-items");

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        foreach ($response->json('data') as $item) {
            $this->assertNotEquals('closed', $item['status']);
        }
    }

    public function test_status_filter_open_returns_only_open_lost_items()
    {
        $user = User::factory()->create();
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'closed']);
        $this->createLostItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/lost-items?status=open");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        foreach ($response->json('data') as $item) {
            $this->assertEquals('open', $item['status']);
        }
    }

    public function test_status_filter_closed_returns_only_closed_lost_items()
    {
        $user = User::factory()->create();
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'closed']);
        $this->createLostItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/lost-items?status=closed");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        foreach ($response->json('data') as $item) {
            $this->assertEquals('closed', $item['status']);
        }
    }

    public function test_status_filter_all_returns_every_lost_item()
    {
        $user = User::factory()->create();
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'closed']);
        $this->createLostItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/lost-items?status=all");

        $response->assertOk();
        $response->assertJsonCount(4, 'data');
    }

    // --- Found Item Close Tests ---

    public function test_owner_can_close_their_found_item()
    {
        $user = $this->createUserWithToken();
        $item = $this->createFoundItem($user);

        $response = $this->patchJson("/api/found-items/{$item->id}/close");

        $response->assertOk();
        $this->assertEquals('closed', $item->refresh()->status);
    }

    public function test_non_owner_cannot_close_found_item()
    {
        $owner = User::factory()->create();
        $item = $this->createFoundItem($owner);

        $nonOwner = $this->createUserWithToken();

        $response = $this->patchJson("/api/found-items/{$item->id}/close");

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_close_found_item()
    {
        $owner = User::factory()->create();
        $item = $this->createFoundItem($owner);

        $response = $this->patchJson("/api/found-items/{$item->id}/close");

        $response->assertUnauthorized();
    }

    public function test_closing_a_found_item_is_permanent()
    {
        $user = $this->createUserWithToken();
        $item = $this->createFoundItem($user, ['status' => 'closed']);

        $response = $this->patchJson("/api/found-items/{$item->id}/close");

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'The item is already closed.']);
    }

    public function test_closed_found_items_are_hidden_from_browse_by_default()
    {
        $user = User::factory()->create();
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'closed']);
        $this->createFoundItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/found-items");

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
        foreach ($response->json('data') as $item) {
            $this->assertNotEquals('closed', $item['status']);
        }
    }

    public function test_status_filter_available_returns_only_available_found_items()
    {
        $user = User::factory()->create();
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'closed']);
        $this->createFoundItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/found-items?status=available");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        foreach ($response->json('data') as $item) {
            $this->assertEquals('available', $item['status']);
        }
    }

    public function test_status_filter_closed_returns_only_closed_found_items()
    {
        $user = User::factory()->create();
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'closed']);
        $this->createFoundItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/found-items?status=closed");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        foreach ($response->json('data') as $item) {
            $this->assertEquals('closed', $item['status']);
        }
    }

    public function test_status_filter_all_returns_every_found_item()
    {
        $user = User::factory()->create();
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'closed']);
        $this->createFoundItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/found-items?status=all");

        $response->assertOk();
        $response->assertJsonCount(4, 'data');
    }

    // --- My Items Tests ---

    public function test_my_lost_items_returns_only_authenticated_users_lost_items()
    {
        $userA = $this->createUserWithToken();
        $this->createLostItem($userA);
        $this->createLostItem($userA);
        $this->createLostItem($userA);

        $userB = User::factory()->create();
        $this->createLostItem($userB);
        $this->createLostItem($userB);

        $response = $this->getJson("/api/my/lost-items");

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
    }

    public function test_my_lost_items_includes_all_statuses()
    {
        $user = $this->createUserWithToken();
        $this->createLostItem($user, ['status' => 'open']);
        $this->createLostItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/my/lost-items");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_my_found_items_returns_only_authenticated_users_found_items()
    {
        $userA = $this->createUserWithToken();
        $this->createFoundItem($userA);
        $this->createFoundItem($userA);

        $userB = User::factory()->create();
        $this->createFoundItem($userB);
        $this->createFoundItem($userB);
        $this->createFoundItem($userB);

        $response = $this->getJson("/api/my/found-items");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }

    public function test_my_found_items_includes_all_statuses()
    {
        $user = $this->createUserWithToken();
        $this->createFoundItem($user, ['status' => 'available']);
        $this->createFoundItem($user, ['status' => 'closed']);

        $response = $this->getJson("/api/my/found-items");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }
}
