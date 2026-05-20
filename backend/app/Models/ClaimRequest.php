<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClaimRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'claimant_user_id',
        'lost_item_id',
        'found_item_id',
        'proof_message',
        'status',
    ];

    public function claimant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimant_user_id');
    }

    public function lostItem(): BelongsTo
    {
        return $this->belongsTo(LostItem::class, 'lost_item_id');
    }

    public function foundItem(): BelongsTo
    {
        return $this->belongsTo(FoundItem::class, 'found_item_id');
    }
}
