<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLostItemRequest;
use App\Http\Resources\LostItemResource;
use App\Models\LostItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LostItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = LostItem::query()
            ->with(['user', 'category'])
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = '%'.$request->string('search')->toString().'%';
                $query->where(function ($query) use ($search): void {
                    $query->where('title', 'like', $search)
                        ->orWhere('description', 'like', $search);
                });
            })
            ->when($request->filled('category_id'), fn ($query) => $query->where('item_category_id', $request->integer('category_id')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('lost_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('lost_at', '<=', $request->date('date_to')))
            ->latest()
            ->paginate(min($request->integer('per_page', 15), 50));

        return $this->successResponse('Lost items retrieved.', LostItemResource::collection($items), 200, [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }

    public function store(StoreLostItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['images'] = $this->storeImages($request, 'lost-items');
        $data['status'] = $data['status'] ?? 'open';

        $item = LostItem::create($data)->load(['user', 'category']);

        return $this->successResponse('Lost item created.', new LostItemResource($item), 201);
    }

    public function show(LostItem $lostItem): JsonResponse
    {
        return $this->successResponse('Lost item retrieved.', new LostItemResource($lostItem->load(['user', 'category'])));
    }

    public function update(StoreLostItemRequest $request, LostItem $lostItem): JsonResponse
    {
        if ($request->user()->id !== $lostItem->user_id) {
            return $this->errorResponse('You may only update your own lost items.', 403);
        }

        $data = $request->validated();

        if ($request->hasFile('images')) {
            $data['images'] = $this->storeImages($request, 'lost-items');
        }

        $lostItem->update($data);

        return $this->successResponse('Lost item updated.', new LostItemResource($lostItem->fresh(['user', 'category'])));
    }

    public function destroy(Request $request, LostItem $lostItem): JsonResponse
    {
        if ($request->user()->id !== $lostItem->user_id) {
            return $this->errorResponse('You may only delete your own lost items.', 403);
        }

        $lostItem->delete();

        return $this->successResponse('Lost item deleted.');
    }

    private function storeImages(Request $request, string $directory): array
    {
        if (! $request->hasFile('images')) {
            return [];
        }

        return collect($request->file('images'))
            ->map(fn ($image) => $image->store($directory, 'public'))
            ->all();
    }
}
