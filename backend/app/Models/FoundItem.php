<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FoundItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'item_category_id',
        'title',
        'description',
        'keywords',
        'found_location',
        'found_at',
        'handover_location',
        'images',
        'status',
    ];

    protected $casts = [
        'keywords' => 'array',
        'images' => 'array',
        'found_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'item_category_id');
    }

    public function claimRequests(): HasMany
    {
        return $this->hasMany(ClaimRequest::class);
    }
}
