<?php

namespace Tests\Feature;

use App\Models\ItemCategory;
use App\Models\LostItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LostItemControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_student_can_create_lost_item(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $category = ItemCategory::create(['name' => 'Electronics', 'slug' => 'electronics']);

        Sanctum::actingAs($user);

        $response = $this->post('/api/lost-items', $this->payload($category, [
            'images' => [$this->fakeImage()],
        ]));

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Lost laptop');

        $item = LostItem::firstOrFail();
        $this->assertSame($user->id, $item->user_id);
        Storage::disk('public')->assertExists($item->images[0]);
    }

    public function test_create_lost_item_returns_validation_errors(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/lost-items', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['item_category_id', 'title', 'description']);
    }

    public function test_lost_items_can_be_listed(): void
    {
        $category = ItemCategory::create(['name' => 'Keys', 'slug' => 'keys']);
        $this->lostItem(['title' => 'Dorm room key', 'item_category_id' => $category->id]);

        $this->getJson('/api/lost-items')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.title', 'Dorm room key');
    }

    public function test_lost_items_can_be_searched(): void
    {
        $category = ItemCategory::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $this->lostItem(['title' => 'Silver calculator', 'description' => 'Casio calculator near library', 'item_category_id' => $category->id]);
        $this->lostItem(['title' => 'Blue jacket', 'description' => 'Warm clothing', 'item_category_id' => $category->id]);

        $this->getJson('/api/lost-items?search=calculator')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Silver calculator');
    }

    public function test_lost_items_can_be_filtered_by_category(): void
    {
        $electronics = ItemCategory::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $keys = ItemCategory::create(['name' => 'Keys', 'slug' => 'keys']);
        $this->lostItem(['title' => 'Laptop charger', 'item_category_id' => $electronics->id]);
        $this->lostItem(['title' => 'Mailbox key', 'item_category_id' => $keys->id]);

        $this->getJson('/api/lost-items?category_id='.$keys->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Mailbox key');
    }

    public function test_only_owner_can_update_lost_item(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $category = ItemCategory::create(['name' => 'Bags', 'slug' => 'bags']);
        $item = $this->lostItem(['user_id' => $owner->id, 'item_category_id' => $category->id]);

        Sanctum::actingAs($other);
        $this->putJson('/api/lost-items/'.$item->id, $this->payload($category, ['title' => 'Updated title']))
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->putJson('/api/lost-items/'.$item->id, $this->payload($category, ['title' => 'Updated title']))
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated title');
    }

    public function test_only_owner_can_delete_lost_item(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $category = ItemCategory::create(['name' => 'Other', 'slug' => 'other']);
        $item = $this->lostItem(['user_id' => $owner->id, 'item_category_id' => $category->id]);

        Sanctum::actingAs($other);
        $this->deleteJson('/api/lost-items/'.$item->id)->assertForbidden();

        Sanctum::actingAs($owner);
        $this->deleteJson('/api/lost-items/'.$item->id)->assertOk();
        $this->assertSoftDeleted('lost_items', ['id' => $item->id]);
    }

    private function payload(ItemCategory $category, array $overrides = []): array
    {
        return array_merge([
            'item_category_id' => $category->id,
            'title' => 'Lost laptop',
            'description' => 'A black laptop lost around the main library.',
            'keywords' => ['laptop', 'black'],
            'lost_location' => 'Main library',
            'lost_at' => now()->toDateTimeString(),
        ], $overrides);
    }

    private function lostItem(array $overrides = []): LostItem
    {
        $categoryId = $overrides['item_category_id'] ?? ItemCategory::create(['name' => 'Other', 'slug' => uniqid('other-')])->id;

        return LostItem::create(array_merge([
            'user_id' => User::factory()->create()->id,
            'item_category_id' => $categoryId,
            'title' => 'Lost laptop',
            'description' => 'A black laptop lost around the main library.',
            'keywords' => ['laptop'],
            'lost_location' => 'Main library',
            'lost_at' => now(),
            'images' => [],
            'status' => 'open',
        ], $overrides));
    }

    private function fakeImage(): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'lost-item-image');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='));

        return new UploadedFile($path, 'item.png', 'image/png', null, true);
    }
}
