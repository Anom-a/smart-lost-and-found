<?php

namespace App\Http\Controllers;

use App\Http\Resources\FoundItemResource;
use App\Models\FoundItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyFoundItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = FoundItem::query()
            ->with(['category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(12);

        return $this->successResponse('My found items retrieved.', FoundItemResource::collection($items), 200, [
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage(),
            'total' => $items->total(),
            'last_page' => $items->lastPage(),
        ]);
    }
}
