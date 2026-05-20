<?php

namespace App\Notifications;

use App\Models\ClaimRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewClaimNotification extends Notification
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
            'title' => 'New claim request',
            'message' => $this->claim->claimant?->name.' submitted a claim for '.$this->claim->foundItem?->title.'.',
            'type' => 'new_claim',
            'claim_id' => $this->claim->id,
            'claimant_name' => $this->claim->claimant?->name,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_claim',
            'message' => $this->claim->claimant?->name.' submitted a claim for '.$this->claim->foundItem?->title.'.',
            'claim_id' => $this->claim->id,
            'claimant_name' => $this->claim->claimant?->name,
        ];
    }
}