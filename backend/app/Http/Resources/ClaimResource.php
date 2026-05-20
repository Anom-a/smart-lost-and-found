<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClaimResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->loadMissing(['claimant', 'lostItem.category', 'foundItem.category', 'foundItem.user']);

        return [
            'id' => $this->id,
            'status' => $this->status,
            'proof_message' => $this->proof_message,
            'created_at' => optional($this->created_at)->toISOString(),
            'claimant' => [
                'id' => $this->claimant?->id,
                'name' => $this->claimant?->name,
                'student_id' => $this->claimant?->student_id,
            ],
            'lost_item' => [
                'id' => $this->lostItem?->id,
                'title' => $this->lostItem?->title,
                'category' => $this->lostItem?->category?->name,
                'location' => $this->lostItem?->lost_location,
                'date_lost' => optional($this->lostItem?->lost_at)->toISOString(),
                'status' => $this->lostItem?->status,
            ],
            'found_item' => [
                'id' => $this->foundItem?->id,
                'title' => $this->foundItem?->title,
                'category' => $this->foundItem?->category?->name,
                'location' => $this->foundItem?->found_location,
                'date_found' => optional($this->foundItem?->found_at)->toISOString(),
                'status' => $this->foundItem?->status,
                'reporter' => $this->foundItem?->user ? [
                    'id' => $this->foundItem->user->id,
                    'name' => $this->foundItem->user->name,
                    'student_id' => $this->foundItem->user->student_id,
                ] : null,
            ],
        ];
    }
}