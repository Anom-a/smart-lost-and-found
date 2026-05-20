<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('claim_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claimant_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lost_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('found_item_id')->constrained()->cascadeOnDelete();
            $table->text('proof_message');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['claimant_user_id', 'lost_item_id', 'found_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claim_requests');
    }
};
