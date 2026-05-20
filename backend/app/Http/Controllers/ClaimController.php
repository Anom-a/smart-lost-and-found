<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClaimRequest;
use App\Http\Resources\ClaimResource;
use App\Models\ClaimRequest;
use App\Notifications\ClaimApprovedNotification;
use App\Notifications\ClaimRejectedNotification;
use App\Notifications\NewClaimNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class ClaimController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);

        $claims = ClaimRequest::query()
            ->with(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user'])
            ->latest()
            ->get();

        $claims = $claims->filter(function (ClaimRequest $claim) use ($request): bool {
            $userId = $this->resolveUserId($request) ?? 0;

            return (int) $claim->claimant_user_id === $userId
                || (int) ($claim->lostItem?->user_id ?? 0) === $userId;
        })->values();

        $sent = $claims->filter(fn (ClaimRequest $claim): bool => (int) $claim->claimant_user_id === $userId)->values();
        $received = $claims->filter(fn (ClaimRequest $claim): bool => (int) $claim->lostItem?->user_id === $userId)->values();

        return response()->json([
            'sent' => ClaimResource::collection($sent)->toArray($request),
            'received' => ClaimResource::collection($received)->toArray($request),
        ]);
    }

    public function store(StoreClaimRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['claimant_user_id'] = $this->resolveUserId($request);
        $data['status'] = 'pending';

        $claim = DB::transaction(function () use ($data): ClaimRequest {
            return ClaimRequest::create($data)->load(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user']);
        });

        $claim->foundItem?->user?->notify(new NewClaimNotification($claim));

        return response()->json((new ClaimResource($claim))->resolve($request), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $claim = $this->findVisibleClaim($request, $id);

        if ($claim === null) {
            return $this->errorResponse('You may not view this claim.', 403);
        }

        return response()->json((new ClaimResource($claim))->resolve($request));
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $claim = ClaimRequest::query()->with(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user'])->findOrFail($id);
        $userId = $this->resolveUserId($request) ?? 0;

        if ((int) $userId !== (int) $claim->foundItem?->user_id) {
            return $this->errorResponse('You may not approve this claim.', 403);
        }

        DB::transaction(function () use ($claim): void {
            $claim->update(['status' => 'approved']);
            $claim->foundItem?->update(['status' => 'claimed']);
            $claim->lostItem?->update(['status' => 'claimed']);
        });

        $claim->refresh()->load(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user']);
        $claim->claimant?->notify(new ClaimApprovedNotification($claim));

        return response()->json((new ClaimResource($claim))->resolve($request));
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $claim = ClaimRequest::query()->with(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user'])->findOrFail($id);
        $userId = $this->resolveUserId($request) ?? 0;

        if ((int) $userId !== (int) $claim->foundItem?->user_id) {
            return $this->errorResponse('You may not reject this claim.', 403);
        }

        $claim->update(['status' => 'rejected']);
        $claim->claimant?->notify(new ClaimRejectedNotification($claim));

        return response()->json((new ClaimResource($claim->fresh(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user'])))->resolve($request));
    }

    private function findVisibleClaim(Request $request, int $id): ?ClaimRequest
    {
        $claim = ClaimRequest::query()
            ->with(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user'])
            ->find($id);

        if ($claim === null) {
            return null;
        }

        $userId = $this->resolveUserId($request) ?? 0;
        $isClaimant = (int) $claim->claimant_user_id === $userId;
        $isLostItemOwner = (int) $claim->lostItem?->user_id === $userId;

        return $isClaimant || $isLostItemOwner ? $claim : null;
    }

    private function resolveUserId(Request $request): ?int
    {
        $bearerToken = $request->bearerToken();

        if ($bearerToken) {
            $personalAccessToken = PersonalAccessToken::findToken($bearerToken);

            if ($personalAccessToken?->tokenable_id) {
                return (int) $personalAccessToken->tokenable_id;
            }
        }

        return $request->user()?->id;
    }
}
