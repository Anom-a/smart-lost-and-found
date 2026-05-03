<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('found_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->json('keywords')->nullable();
            $table->string('found_location')->nullable();
            $table->timestamp('found_at')->nullable();
            $table->string('handover_location')->nullable();
            $table->json('images')->nullable();
            $table->enum('status', ['available', 'claimed', 'closed'])->default('available');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['item_category_id', 'status']);
            $table->fullText(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('found_items');
    }
};
