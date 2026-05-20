<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lost_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->json('keywords')->nullable();
            $table->string('lost_location')->nullable();
            $table->timestamp('lost_at')->nullable();
            $table->json('images')->nullable();
            $table->string('contact_preference')->nullable();
            $table->enum('status', ['open', 'claimed', 'closed'])->default('open');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['item_category_id', 'status']);
            if (config('database.default') !== 'sqlite') {
                $table->fullText(['title', 'description']);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lost_items');
    }
};
