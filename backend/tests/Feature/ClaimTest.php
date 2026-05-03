<?php

namespace Tests\Feature;

use App\Models\ClaimRequest;
use App\Models\FoundItem;
use App\Models\ItemCategory;
use App\Models\LostItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClaimTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_student_can_create_claim(): void
    {
        [$claimant, $lostItem, $foundItem] = $this->claimFixture();

        Sanctum::actingAs($claimant);

        $response = $this->postJson('/api/claims', [
            'lost_item_id' => $lostItem->id,
            'found_item_id' => $foundItem->id,
            'message' => 'This looks like my item.',
            'proof_details' => ['color' => 'black'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.claimant_id', $claimant->id);

        $this->assertDatabaseHas('claim_requests', [
            'claimant_id' => $claimant->id,
            'lost_item_id' => $lostItem->id,
            'found_item_id' => $foundItem->id,
            'status' => 'pending',
        ]);
    }

    public function test_duplicate_claim_is_prevented(): void
    {
        [$claimant, $lostItem, $foundItem] = $this->claimFixture();
        ClaimRequest::create([
            'claimant_id' => $claimant->id,
            'lost_item_id' => $lostItem->id,
            'found_item_id' => $foundItem->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($claimant);

        $this->postJson('/api/claims', [
            'lost_item_id' => $lostItem->id,
            'found_item_id' => $foundItem->id,
        ])->assertStatus(409)
            ->assertJsonPath('success', false);
    }

    public function test_item_owner_can_approve_claim(): void
    {
        [$claimant, $lostItem, $foundItem, $lostOwner] = $this->claimFixture();
        $claim = ClaimRequest::create([
            'claimant_id' => $claimant->id,
            'lost_item_id' => $lostItem->id,
            'found_item_id' => $foundItem->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($lostOwner);

        $this->postJson('/api/claims/'.$claim->id.'/approve')
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('claim_requests', ['id' => $claim->id, 'status' => 'approved']);
        $this->assertDatabaseHas('lost_items', ['id' => $lostItem->id, 'status' => 'claimed']);
        $this->assertDatabaseHas('found_items', ['id' => $foundItem->id, 'status' => 'claimed']);
    }

    public function test_item_owner_can_reject_claim(): void
    {
        [$claimant, $lostItem, $foundItem, $lostOwner] = $this->claimFixture();
        $claim = ClaimRequest::create([
            'claimant_id' => $claimant->id,
            'lost_item_id' => $lostItem->id,
            'found_item_id' => $foundItem->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($lostOwner);

        $this->postJson('/api/claims/'.$claim->id.'/reject')
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('claim_requests', ['id' => $claim->id, 'status' => 'rejected']);
    }

    private function claimFixture(): array
    {
        $category = ItemCategory::create(['name' => 'Electronics', 'slug' => uniqid('electronics-')]);
        $claimant = User::factory()->create();
        $lostOwner = User::factory()->create();
        $foundOwner = User::factory()->create();

        $lostItem = LostItem::create([
            'user_id' => $lostOwner->id,
            'item_category_id' => $category->id,
            'title' => 'Lost tablet',
            'description' => 'A black tablet lost near the lab.',
            'keywords' => ['tablet'],
            'images' => [],
            'status' => 'open',
        ]);

        $foundItem = FoundItem::create([
            'user_id' => $foundOwner->id,
            'item_category_id' => $category->id,
            'title' => 'Found tablet',
            'description' => 'A black tablet found near the lab.',
            'keywords' => ['tablet'],
            'images' => [],
            'status' => 'available',
        ]);

        return [$claimant, $lostItem, $foundItem, $lostOwner, $foundOwner];
    }
}
