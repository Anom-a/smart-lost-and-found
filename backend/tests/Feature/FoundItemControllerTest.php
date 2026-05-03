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
            'images' => [$this->fakeImage()],
        ]));

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Found ID card');

        $item = FoundItem::firstOrFail();
        $this->assertSame($user->id, $item->user_id);
        Storage::disk('public')->assertExists($item->images[0]);
    }

    public function test_create_found_item_returns_validation_errors(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/found-items', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['item_category_id', 'title', 'description']);
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
            'handover_location' => 'Security office',
            'images' => [],
            'status' => 'available',
        ], $overrides));
    }

    private function fakeImage(): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'found-item-image');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='));

        return new UploadedFile($path, 'item.png', 'image/png', null, true);
    }
}
