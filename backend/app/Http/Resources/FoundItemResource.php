<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FoundItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'item_category_id' => $this->item_category_id,
            'title' => $this->title,
            'description' => $this->description,
            'keywords' => $this->keywords ?? [],
            'found_location' => $this->found_location,
            'found_at' => optional($this->found_at)->toISOString(),
            'handover_location' => $this->handover_location,
            'images' => $this->images ?? [],
            'status' => $this->status,
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
        ];
    }
}
