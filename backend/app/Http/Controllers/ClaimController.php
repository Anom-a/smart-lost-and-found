<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClaimRequest;
use App\Models\ClaimRequest;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $claims = ClaimRequest::query()
            ->with(['claimant', 'lostItem', 'foundItem'])
            ->where(function ($query) use ($request): void {
                $query->where('claimant_id', $request->user()->id)
                    ->orWhereHas('lostItem', fn ($query) => $query->where('user_id', $request->user()->id))
                    ->orWhereHas('foundItem', fn ($query) => $query->where('user_id', $request->user()->id));
            })
            ->latest()
            ->paginate(min($request->integer('per_page', 15), 50));

        return $this->successResponse('Claims retrieved.', $claims->items(), 200, [
            'current_page' => $claims->currentPage(),
            'per_page' => $claims->perPage(),
            'total' => $claims->total(),
            'last_page' => $claims->lastPage(),
        ]);
    }

    public function store(StoreClaimRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['claimant_id'] = $request->user()->id;
        $data['status'] = 'pending';

        $exists = ClaimRequest::where('claimant_id', $data['claimant_id'])
            ->where('lost_item_id', $data['lost_item_id'])
            ->where('found_item_id', $data['found_item_id'])
            ->exists();

        if ($exists) {
            return $this->errorResponse('You have already submitted this claim.', 409);
        }

        $claim = ClaimRequest::create($data)->load(['claimant', 'lostItem', 'foundItem']);

        $this->notifyItemOwners($claim, 'claim_created', 'New claim request', 'A student submitted a claim request.');

        return $this->successResponse('Claim request created.', $claim, 201);
    }

    public function show(Request $request, ClaimRequest $claim): JsonResponse
    {
        if (! $this->canViewClaim($request, $claim)) {
            return $this->errorResponse('You may not view this claim.', 403);
        }

        return $this->successResponse('Claim retrieved.', $claim->load(['claimant', 'lostItem', 'foundItem']));
    }

    public function approve(Request $request, ClaimRequest $claim): JsonResponse
    {
        if (! $this->canReviewClaim($request, $claim)) {
            return $this->errorResponse('You may not approve this claim.', 403);
        }

        $claim->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        $claim->lostItem()->update(['status' => 'claimed']);
        $claim->foundItem()->update(['status' => 'claimed']);

        Notification::create([
            'user_id' => $claim->claimant_id,
            'type' => 'claim_approved',
            'title' => 'Claim approved',
            'message' => 'Your claim request was approved.',
            'data' => ['claim_request_id' => $claim->id],
        ]);

        return $this->successResponse('Claim approved.', $claim->fresh(['claimant', 'lostItem', 'foundItem']));
    }

    public function reject(Request $request, ClaimRequest $claim): JsonResponse
    {
        if (! $this->canReviewClaim($request, $claim)) {
            return $this->errorResponse('You may not reject this claim.', 403);
        }

        $claim->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        Notification::create([
            'user_id' => $claim->claimant_id,
            'type' => 'claim_rejected',
            'title' => 'Claim rejected',
            'message' => 'Your claim request was rejected.',
            'data' => ['claim_request_id' => $claim->id],
        ]);

        return $this->successResponse('Claim rejected.', $claim->fresh(['claimant', 'lostItem', 'foundItem']));
    }

    private function canViewClaim(Request $request, ClaimRequest $claim): bool
    {
        $claim->loadMissing(['lostItem', 'foundItem']);

        return $request->user()->id === $claim->claimant_id
            || $request->user()->id === $claim->lostItem->user_id
            || $request->user()->id === $claim->foundItem->user_id;
    }

    private function canReviewClaim(Request $request, ClaimRequest $claim): bool
    {
        $claim->loadMissing(['lostItem', 'foundItem']);

        return $request->user()->id === $claim->lostItem->user_id
            || $request->user()->id === $claim->foundItem->user_id;
    }

    private function notifyItemOwners(ClaimRequest $claim, string $type, string $title, string $message): void
    {
        foreach (array_unique([$claim->lostItem->user_id, $claim->foundItem->user_id]) as $userId) {
            Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => ['claim_request_id' => $claim->id],
            ]);
        }
    }
}
