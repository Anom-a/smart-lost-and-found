<?php

namespace App\Notifications;

use App\Models\ClaimRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClaimRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(private ClaimRequest $claim)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Claim rejected',
            'message' => 'Your claim for '.$this->claim->foundItem?->title.' was rejected.',
            'type' => 'claim_rejected',
            'claim_id' => $this->claim->id,
            'item_title' => $this->claim->foundItem?->title,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'claim_rejected',
            'message' => 'Your claim for '.$this->claim->foundItem?->title.' was rejected.',
            'claim_id' => $this->claim->id,
            'item_title' => $this->claim->foundItem?->title,
        ];
    }
}