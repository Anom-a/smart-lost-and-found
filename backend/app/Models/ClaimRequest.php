<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClaimRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'claimant_id',
        'lost_item_id',
        'found_item_id',
        'message',
        'proof_details',
        'status',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'proof_details' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function claimant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimant_id');
    }

    public function lostItem(): BelongsTo
    {
        return $this->belongsTo(LostItem::class);
    }

    public function foundItem(): BelongsTo
    {
        return $this->belongsTo(FoundItem::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
