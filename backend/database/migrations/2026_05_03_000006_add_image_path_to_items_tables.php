<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lost_items', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('lost_at');
        });

        Schema::table('found_items', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('found_at');
        });
    }

    public function down(): void
    {
        Schema::table('lost_items', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });

        Schema::table('found_items', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });
    }
};
