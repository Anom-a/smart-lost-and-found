<?php

namespace App\Http\Controllers;

use App\Http\Resources\FoundItemResource;
use App\Http\Resources\LostItemResource;
use App\Models\FoundItem;
use App\Models\LostItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'lost_item_id' => ['nullable', 'integer', 'exists:lost_items,id'],
            'found_item_id' => ['nullable', 'integer', 'exists:found_items,id'],
        ]);

        if ($request->filled('lost_item_id')) {
            $lostItem = LostItem::findOrFail($request->integer('lost_item_id'));
            $matches = FoundItem::query()
                ->with(['user', 'category'])
                ->where('item_category_id', $lostItem->item_category_id)
                ->where('status', 'available')
                ->latest()
                ->limit(10)
                ->get();

            return $this->successResponse('Found item matches retrieved.', FoundItemResource::collection($matches));
        }

        if ($request->filled('found_item_id')) {
            $foundItem = FoundItem::findOrFail($request->integer('found_item_id'));
            $matches = LostItem::query()
                ->with(['user', 'category'])
                ->where('item_category_id', $foundItem->item_category_id)
                ->where('status', 'open')
                ->latest()
                ->limit(10)
                ->get();

            return $this->successResponse('Lost item matches retrieved.', LostItemResource::collection($matches));
        }

        return $this->errorResponse('Provide lost_item_id or found_item_id.', 422);
    }
}
