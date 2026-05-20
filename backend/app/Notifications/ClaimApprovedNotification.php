<?php

namespace App\Notifications;

use App\Models\ClaimRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClaimApprovedNotification extends Notification
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
            'title' => 'Claim approved',
            'message' => 'Your claim for '.$this->claim->foundItem?->title.' has been approved.',
            'type' => 'claim_approved',
            'claim_id' => $this->claim->id,
            'item_title' => $this->claim->foundItem?->title,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'claim_approved',
            'message' => 'Your claim for '.$this->claim->foundItem?->title.' has been approved.',
            'claim_id' => $this->claim->id,
            'item_title' => $this->claim->foundItem?->title,
        ];
    }
}