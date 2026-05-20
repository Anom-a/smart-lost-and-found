<?php

namespace Tests\Feature;

use App\Models\FoundItem;
use App\Models\ItemCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FoundItemControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_student_can_create_found_item(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $category = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);

        Sanctum::actingAs($user);

        $response = $this->post('/api/found-items', $this->payload($category, [
            'image' => UploadedFile::fake()->image('found-item.jpg'),
        ]));

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Found ID card');

        $item = FoundItem::firstOrFail();
        $this->assertSame($user->id, $item->user_id);
        $this->assertNotNull($item->image_path);
        Storage::disk('public')->assertExists($item->image_path);
    }

    public function test_create_found_item_rejects_invalid_image_type(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        $category = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);

        $response = $this->postJson('/api/found-items', $this->payload($category, [
            'image' => UploadedFile::fake()->create('bad.gif', 100, 'image/gif'),
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors(['image']);
    }

    public function test_create_found_item_rejects_image_larger_than_5mb(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        $category = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);

        $response = $this->postJson('/api/found-items', $this->payload($category, [
            'image' => UploadedFile::fake()->image('too-large.jpg')->size(5121),
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors(['image']);
    }

    public function test_create_found_item_without_image_is_allowed(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $category = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);

        $response = $this->postJson('/api/found-items', $this->payload($category));

        $response->assertCreated()
            ->assertJsonPath('data.image_path', null);

        $this->assertNull(FoundItem::firstOrFail()->image_path);
    }

    public function test_create_found_item_saves_image_path_in_database(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        $category = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);

        $this->post('/api/found-items', $this->payload($category, [
            'image' => UploadedFile::fake()->image('id-card.png'),
        ]))->assertCreated();

        $item = FoundItem::firstOrFail();
        $this->assertNotNull($item->image_path);
        $this->assertStringStartsWith('items/found/', $item->image_path);
    }

    public function test_create_found_item_returns_validation_errors(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/found-items', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['item_category_id', 'title', 'description', 'contact_phone']);
    }

    public function test_found_items_can_be_listed(): void
    {
        $category = ItemCategory::create(['name' => 'Keys', 'slug' => 'keys']);
        $this->foundItem(['title' => 'Found keychain', 'item_category_id' => $category->id]);

        $this->getJson('/api/found-items')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.title', 'Found keychain');
    }

    public function test_found_items_can_be_searched(): void
    {
        $category = ItemCategory::create(['name' => 'Accessories', 'slug' => 'accessories']);
        $this->foundItem(['title' => 'Silver watch', 'description' => 'Watch found in cafe', 'item_category_id' => $category->id]);
        $this->foundItem(['title' => 'Blue bag', 'description' => 'Bag found in hallway', 'item_category_id' => $category->id]);

        $this->getJson('/api/found-items?search=watch')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Silver watch');
    }

    public function test_found_items_can_be_filtered_by_category(): void
    {
        $documents = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);
        $sports = ItemCategory::create(['name' => 'Sports Equipment', 'slug' => 'sports-equipment']);
        $this->foundItem(['title' => 'Student ID', 'item_category_id' => $documents->id]);
        $this->foundItem(['title' => 'Football', 'item_category_id' => $sports->id]);

        $this->getJson('/api/found-items?category_id='.$sports->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Football');
    }

    public function test_only_owner_can_update_found_item(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $category = ItemCategory::create(['name' => 'Bags', 'slug' => 'bags']);
        $item = $this->foundItem(['user_id' => $owner->id, 'item_category_id' => $category->id]);

        Sanctum::actingAs($other);
        $this->putJson('/api/found-items/'.$item->id, $this->payload($category, ['title' => 'Updated found item']))
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->putJson('/api/found-items/'.$item->id, $this->payload($category, ['title' => 'Updated found item']))
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated found item');
    }

    public function test_only_owner_can_delete_found_item(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $category = ItemCategory::create(['name' => 'Other', 'slug' => 'other']);
        $item = $this->foundItem(['user_id' => $owner->id, 'item_category_id' => $category->id]);

        Sanctum::actingAs($other);
        $this->deleteJson('/api/found-items/'.$item->id)->assertForbidden();

        Sanctum::actingAs($owner);
        $this->deleteJson('/api/found-items/'.$item->id)->assertOk();
        $this->assertSoftDeleted('found_items', ['id' => $item->id]);
    }

    private function payload(ItemCategory $category, array $overrides = []): array
    {
        return array_merge([
            'item_category_id' => $category->id,
            'title' => 'Found ID card',
            'description' => 'A student ID card found around the cafeteria.',
            'keywords' => ['id', 'card'],
            'found_location' => 'Cafeteria',
            'found_at' => now()->toDateTimeString(),
            'handover_location' => 'Security office',
            'contact_phone' => '+251912345678',
        ], $overrides);
    }

    private function foundItem(array $overrides = []): FoundItem
    {
        $categoryId = $overrides['item_category_id'] ?? ItemCategory::create(['name' => 'Other', 'slug' => uniqid('other-')])->id;

        return FoundItem::create(array_merge([
            'user_id' => User::factory()->create()->id,
            'item_category_id' => $categoryId,
            'title' => 'Found ID card',
            'description' => 'A student ID card found around the cafeteria.',
            'keywords' => ['id'],
            'found_location' => 'Cafeteria',
            'found_at' => now(),
            'image_path' => null,
            'handover_location' => 'Security office',
            'status' => 'available',
        ], $overrides));
    }

    public function test_matching_lost_item_reporter_gets_notification(): void
    {
        \Illuminate\Support\Facades\Notification::fake();

        $lostUser = User::factory()->create(['name' => 'John Lost', 'email' => 'john@lost.com', 'student_id' => '12345']);
        $foundUser = User::factory()->create(['name' => 'Jane Found', 'email' => 'jane@found.com', 'student_id' => '67890', 'phone' => '555-555-5555']);
        $category = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);

        // Create open lost report
        $lostItem = \App\Models\LostItem::create([
            'user_id' => $lostUser->id,
            'item_category_id' => $category->id,
            'title' => 'Student ID Card',
            'description' => 'Blue plastic card with name John Lost',
            'keywords' => ['id', 'card', 'blue'],
            'lost_location' => 'Cafeteria',
            'lost_at' => now(),
            'status' => 'open',
        ]);

        Sanctum::actingAs($foundUser);

        // Report found item (nearly identical)
        $response = $this->postJson('/api/found-items', [
            'item_category_id' => $category->id,
            'title' => 'Student ID Card',
            'description' => 'Blue plastic card with name John Lost',
            'keywords' => ['id', 'card', 'blue'],
            'found_location' => 'Cafeteria',
            'found_at' => now()->toDateTimeString(),
            'handover_location' => 'Security office',
            'contact_phone' => '+251912345678',
        ]);

        $response->assertCreated();

        // Assert notification was sent to $lostUser
        \Illuminate\Support\Facades\Notification::assertSentTo(
            $lostUser,
            \App\Notifications\MatchFoundNotification::class,
            function ($notification, $channels) use ($lostItem, $lostUser) {
                $this->assertContains('database', $channels);
                $data = $notification->toDatabase($lostUser);
                $this->assertEquals('Potential match found', $data['title']);
                $this->assertStringContainsString("Jane Found (jane@found.com, +251912345678)", $data['message']);
                $this->assertStringContainsString("Blue plastic card with name John Lost", $data['message']);
                return true;
            }
        );
    }

    public function test_no_notification_sent_if_match_score_is_seventy_percent_or_less(): void
    {
        \Illuminate\Support\Facades\Notification::fake();

        $lostUser = User::factory()->create();
        $foundUser = User::factory()->create();
        $category1 = ItemCategory::create(['name' => 'Documents/Books', 'slug' => 'documentsbooks']);
        $category2 = ItemCategory::create(['name' => 'Bags', 'slug' => 'bags']);

        // Different category makes score at most 60%
        $lostItem = \App\Models\LostItem::create([
            'user_id' => $lostUser->id,
            'item_category_id' => $category1->id,
            'title' => 'Student ID Card',
            'description' => 'Blue plastic card with name John Lost',
            'keywords' => ['id', 'card', 'blue'],
            'lost_location' => 'Cafeteria',
            'lost_at' => now(),
            'status' => 'open',
        ]);

        Sanctum::actingAs($foundUser);

        $response = $this->postJson('/api/found-items', [
            'item_category_id' => $category2->id,
            'title' => 'Student ID Card',
            'description' => 'Blue plastic card with name John Lost',
            'keywords' => ['id', 'card', 'blue'],
            'found_location' => 'Cafeteria',
            'found_at' => now()->toDateTimeString(),
            'handover_location' => 'Security office',
            'contact_phone' => '+251912345678',
        ]);

        $response->assertCreated();

        // Assert notification was NOT sent to $lostUser
        \Illuminate\Support\Facades\Notification::assertNotSentTo(
            $lostUser,
            \App\Notifications\MatchFoundNotification::class
        );
    }
}
