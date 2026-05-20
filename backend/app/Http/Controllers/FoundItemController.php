<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFoundItemRequest;
use App\Http\Resources\FoundItemResource;
use App\Models\FoundItem;
use App\Models\LostItem;
use App\Services\MatchingService;
use App\Notifications\MatchFoundNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoundItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->input('status');

        $items = FoundItem::query()
            ->with(['user', 'category'])
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = '%'.$request->string('search')->toString().'%';
                $query->where(function ($query) use ($search): void {
                    $query->where('title', 'like', $search)
                        ->orWhere('description', 'like', $search);
                });
            })
            ->when($request->filled('category_id'), fn ($query) => $query->where('item_category_id', $request->integer('category_id')))
            ->when(!$request->has('status'), fn ($query) => $query->where('status', 'available'))
            ->when($request->has('status') && $status !== 'all', fn ($query) => $query->where('status', $status))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('found_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('found_at', '<=', $request->date('date_to')))
            ->latest()
            ->paginate(min($request->integer('per_page', 15), 50));

        return $this->successResponse('Found items retrieved.', FoundItemResource::collection($items), 200, [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }

    public function close(Request $request, FoundItem $foundItem): JsonResponse
    {
        if ($request->user()->id !== $foundItem->user_id) {
            return $this->errorResponse('You may only close your own found items.', 403);
        }

        if ($foundItem->status === 'closed') {
            return $this->errorResponse('The item is already closed.', 422);
        }

        $foundItem->update(['status' => 'closed']);

        return $this->successResponse('Found item closed.', new FoundItemResource($foundItem->fresh(['user', 'category'])));
    }

    public function store(StoreFoundItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['image_path'] = $this->storeImage($request, 'items/found');
        $data['status'] = $data['status'] ?? 'available';

        $item = FoundItem::create($data)->load(['user', 'category']);

        $matchingService = app(MatchingService::class);
        $lostItems = LostItem::query()
            ->with(['user', 'category'])
            ->where('status', 'open')
            ->get();

        foreach ($lostItems as $lostItem) {
            $score = $matchingService->score($lostItem, $item);
            if ($score > 0.70) {
                // Attach temporary match_score attribute for use in notifications
                $item->setAttribute('match_score', $score);
                $lostItem->user?->notify(new MatchFoundNotification($lostItem, $item));
            }
        }

        return $this->successResponse('Found item created.', new FoundItemResource($item), 201);
    }

    public function show(FoundItem $foundItem): JsonResponse
    {
        return $this->successResponse('Found item retrieved.', new FoundItemResource($foundItem->load(['user', 'category'])));
    }

    public function update(StoreFoundItemRequest $request, FoundItem $foundItem): JsonResponse
    {
        if ($request->user()->id !== $foundItem->user_id) {
            return $this->errorResponse('You may only update your own found items.', 403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $this->storeImage($request, 'items/found');
        }

        $foundItem->update($data);

        return $this->successResponse('Found item updated.', new FoundItemResource($foundItem->fresh(['user', 'category'])));
    }

    public function destroy(Request $request, FoundItem $foundItem): JsonResponse
    {
        if ($request->user()->id !== $foundItem->user_id) {
            return $this->errorResponse('You may only delete your own found items.', 403);
        }

        $foundItem->delete();

        return $this->successResponse('Found item deleted.');
    }

    private function storeImage(Request $request, string $directory): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        return $request->file('image')->store($directory, 'public');
    }
}
