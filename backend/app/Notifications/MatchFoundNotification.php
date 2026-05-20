<?php

namespace App\Notifications;

use App\Models\FoundItem;
use App\Models\LostItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MatchFoundNotification extends Notification
{
    use Queueable;

    public function __construct(private LostItem $lostItem, private FoundItem $foundItem)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $finder = $this->foundItem->user;
        $phone = $this->foundItem->contact_phone ?? $finder->phone;
        $contact = $finder->name . ' (' . $finder->email . ($phone ? ', ' . $phone : '') . ')';

        return [
            'title' => 'Potential match found',
            'message' => "A potential match has been found for your lost item '{$this->lostItem->title}'. Description: '{$this->foundItem->description}'. Contact the finder: {$contact}.",
            'type' => 'match_found',
            'lost_item_id' => $this->lostItem->id,
            'lost_item_title' => $this->lostItem->title,
            'found_item_id' => $this->foundItem->id,
            'found_item_title' => $this->foundItem->title,
            'found_item_description' => $this->foundItem->description,
            'match_score' => $this->foundItem->match_score ?? 0.0,
            'finder_name' => $finder->name,
            'finder_email' => $finder->email,
            'finder_phone' => $phone,
        ];
    }

    public function toArray(object $notifiable): array
    {
        $finder = $this->foundItem->user;
        $phone = $this->foundItem->contact_phone ?? $finder->phone;
        $contact = $finder->name . ' (' . $finder->email . ($phone ? ', ' . $phone : '') . ')';

        return [
            'type' => 'match_found',
            'message' => "A potential match has been found for your lost item '{$this->lostItem->title}'. Description: '{$this->foundItem->description}'. Contact the finder: {$contact}.",
            'lost_item_id' => $this->lostItem->id,
            'lost_item_title' => $this->lostItem->title,
            'found_item_id' => $this->foundItem->id,
            'found_item_title' => $this->foundItem->title,
            'found_item_description' => $this->foundItem->description,
            'match_score' => $this->foundItem->match_score ?? 0.0,
            'finder_name' => $finder->name,
            'finder_email' => $finder->email,
            'finder_phone' => $phone,
        ];
    }
}
