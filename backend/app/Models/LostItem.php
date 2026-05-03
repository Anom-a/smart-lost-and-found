<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LostItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'item_category_id',
        'title',
        'description',
        'keywords',
        'lost_location',
        'lost_at',
        'images',
        'contact_preference',
        'status',
    ];

    protected $casts = [
        'keywords' => 'array',
        'images' => 'array',
        'lost_at' => 'datetime',
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
