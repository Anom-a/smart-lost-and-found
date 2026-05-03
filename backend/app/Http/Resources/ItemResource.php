<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->resource::class,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'keywords' => $this->keywords ?? [],
            'images' => $this->images ?? [],
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
