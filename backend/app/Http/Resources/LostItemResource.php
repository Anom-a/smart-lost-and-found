<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LostItemResource extends JsonResource
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
            'lost_location' => $this->lost_location,
            'lost_at' => optional($this->lost_at)->toISOString(),
            'image_path' => $this->image_path,
            'contact_preference' => $this->contact_preference,
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
