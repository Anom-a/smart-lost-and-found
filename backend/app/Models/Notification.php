<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($notification) {
            if (isset($notification->data['title'])) {
                $notification->title = $notification->data['title'];
            }
            if (isset($notification->data['message'])) {
                $notification->message = $notification->data['message'];
            }
        });
    }

    public function getTitleAttribute($value)
    {
        return $value ?? ($this->data['title'] ?? null);
    }

    public function getMessageAttribute($value)
    {
        return $value ?? ($this->data['message'] ?? null);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
