<?php

namespace App\Http\Controllers;

use App\Http\Resources\LostItemResource;
use App\Models\LostItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyLostItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = LostItem::query()
            ->with(['category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        return $this->successResponse('My lost items retrieved.', LostItemResource::collection($items), 200, [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }
}
