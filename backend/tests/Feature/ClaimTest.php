<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;
use App\Models\User;

class ClaimTest extends TestCase
{
    use RefreshDatabase;

    protected function createUserWithToken(array $attrs = [])
    {
        $user = User::factory()->create($attrs);
        $token = $user->createToken('test-token')->plainTextToken;
        return [$user, $token];
    }

    protected function createLostItem(array $attrs = [])
    {
        return \App\Models\LostItem::factory()->create($attrs);
    }

    protected function createFoundItem(array $attrs = [])
    {
        return \App\Models\FoundItem::factory()->create($attrs);
    }

    public function test_authenticated_user_can_submit_a_claim()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();

        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            'proof_message' => 'This is a valid proof message with enough length.',
        ];

        $resp = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $resp->assertStatus(201)
            ->assertJsonStructure(['id', 'status', 'claimant', 'lost_item', 'found_item'])
            ->assertJson(['status' => 'pending']);
    }

    public function test_unauthenticated_user_cannot_submit_a_claim()
    {
        $resp = $this->postJson('/api/claims', []);
        $resp->assertStatus(401);
    }

    public function test_claim_requires_proof_message()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            // missing proof_message
        ];

        $resp = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $resp->assertStatus(422)->assertJsonValidationErrors('proof_message');
    }

    public function test_claim_requires_valid_lost_item_id()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => 999999,
            'found_item_id' => $found->id,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $resp = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $resp->assertStatus(422)->assertJsonValidationErrors('lost_item_id');
    }

    public function test_claim_requires_valid_found_item_id()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => 999999,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $resp = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $resp->assertStatus(422)->assertJsonValidationErrors('found_item_id');
    }

    public function test_duplicate_claim_is_rejected()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $first = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        // attempt duplicate
        $second = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $second->assertStatus(409);
    }

    public function test_user_cannot_claim_their_own_found_item()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userA->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $resp = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $resp->assertStatus(403);
    }

    public function test_found_item_reporter_can_approve_a_claim()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $create = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $create->assertStatus(201);

        $claimId = data_get($create->json(), 'id');

        $approve = $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->patchJson("/api/claims/{$claimId}/approve");

        $approve->assertStatus(200)->assertJson(['status' => 'approved']);

        $this->assertDatabaseHas('found_items', ['id' => $found->id, 'status' => 'claimed']);
        $this->assertDatabaseHas('lost_items', ['id' => $lost->id, 'status' => 'claimed']);
    }

    public function test_found_item_reporter_can_reject_a_claim()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $create = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $create->assertStatus(201);
        $claimId = data_get($create->json(), 'id');

        $reject = $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->patchJson("/api/claims/{$claimId}/reject");

        $reject->assertStatus(200)->assertJson(['status' => 'rejected']);

        $this->assertDatabaseHas('found_items', ['id' => $found->id, 'status' => 'available']);
        $this->assertDatabaseHas('lost_items', ['id' => $lost->id, 'status' => 'open']);
    }

    public function test_non_reporter_cannot_approve_a_claim()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        [$userC, $tokenC] = $this->createUserWithToken();

        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $create = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $create->assertStatus(201);
        $claimId = data_get($create->json(), 'id');

        $resp = $this->withHeader('Authorization', "Bearer {$tokenC}")
            ->patchJson("/api/claims/{$claimId}/approve");

        $resp->assertStatus(403);
    }

    public function test_non_reporter_cannot_reject_a_claim()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        [$userC, $tokenC] = $this->createUserWithToken();

        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $payload = [
            'lost_item_id' => $lost->id,
            'found_item_id' => $found->id,
            'proof_message' => 'Valid proof message that is long enough.',
        ];

        $create = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', $payload);

        $create->assertStatus(201);
        $claimId = data_get($create->json(), 'id');

        $resp = $this->withHeader('Authorization', "Bearer {$tokenC}")
            ->patchJson("/api/claims/{$claimId}/reject");

        $resp->assertStatus(403);
    }

    public function test_user_can_list_their_own_claims()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();

        // Create several claims (attempts via API)
        // Sent by A
        for ($i = 0; $i < 3; $i++) {
            $lost = $this->createLostItem(['user_id' => $userA->id]);
            $found = $this->createFoundItem(['user_id' => $userB->id]);
            $this->withHeader('Authorization', "Bearer {$tokenA}")
                ->postJson('/api/claims', [
                    'lost_item_id' => $lost->id,
                    'found_item_id' => $found->id,
                    'proof_message' => 'Valid proof message that is long enough.',
                ]);
        }

        // Incoming to A (A is lost item reporter)
        for ($i = 0; $i < 2; $i++) {
            $lost = $this->createLostItem(['user_id' => $userA->id]);
            $found = $this->createFoundItem(['user_id' => $userB->id]);
            $this->withHeader('Authorization', "Bearer {$tokenB}")
                ->postJson('/api/claims', [
                    'lost_item_id' => $lost->id,
                    'found_item_id' => $found->id,
                    'proof_message' => 'Valid proof message that is long enough.',
                ]);
        }

        $resp = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/claims');

        $resp->assertStatus(200);
        // Expect structure with sent and received keys
        $resp->assertJsonStructure(['sent', 'received']);
    }

    public function test_user_cannot_see_other_users_claims()
    {
        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        [$userC, $tokenC] = $this->createUserWithToken();

        $lost = $this->createLostItem(['user_id' => $userB->id]);
        $found = $this->createFoundItem(['user_id' => $userC->id]);

        // Create claim between B and C
        $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->postJson('/api/claims', [
                'lost_item_id' => $lost->id,
                'found_item_id' => $found->id,
                'proof_message' => 'Valid proof message that is long enough.',
            ]);

        $resp = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->getJson('/api/claims');

        $resp->assertStatus(200);
        $json = $resp->json();
        $all = array_merge($json['sent'] ?? [], $json['received'] ?? []);

        // Assert none of the returned claims involve only B and C
        foreach ($all as $claim) {
            $this->assertFalse(
                ($claim['claimant']['id'] === $userB->id && $claim['found_item']['reporter']['id'] === $userC->id),
                'Claim between B and C should not be visible to A'
            );
        }
    }

    public function test_approving_claim_sends_notification_to_claimant()
    {
        Notification::fake();

        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $create = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', [
                'lost_item_id' => $lost->id,
                'found_item_id' => $found->id,
                'proof_message' => 'Valid proof message that is long enough.',
            ]);

        $claimId = data_get($create->json(), 'id');

        $this->withHeader('Authorization', "Bearer {$tokenB}")
            ->patchJson("/api/claims/{$claimId}/approve");

        Notification::assertSentTo($userA, \App\Notifications\ClaimApprovedNotification::class);
    }

    public function test_submitting_claim_sends_notification_to_found_item_reporter()
    {
        Notification::fake();

        [$userA, $tokenA] = $this->createUserWithToken();
        [$userB, $tokenB] = $this->createUserWithToken();
        $lost = $this->createLostItem(['user_id' => $userA->id]);
        $found = $this->createFoundItem(['user_id' => $userB->id]);

        $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/claims', [
                'lost_item_id' => $lost->id,
                'found_item_id' => $found->id,
                'proof_message' => 'Valid proof message that is long enough.',
            ]);

        Notification::assertSentTo($userB, \App\Notifications\NewClaimNotification::class);
    }
}
