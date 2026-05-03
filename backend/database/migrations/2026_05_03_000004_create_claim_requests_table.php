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
            $table->foreignId('claimant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lost_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('found_item_id')->constrained()->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->json('proof_details')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['claimant_id', 'lost_item_id', 'found_item_id']);
            $table->index(['lost_item_id', 'status']);
            $table->index(['found_item_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claim_requests');
    }
};
