<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lost_items', function (Blueprint $table): void {
            $table->string('contact_phone')->nullable()->after('contact_preference');
        });

        Schema::table('found_items', function (Blueprint $table): void {
            $table->string('contact_phone')->nullable()->after('handover_location');
        });
    }

    public function down(): void
    {
        Schema::table('lost_items', function (Blueprint $table): void {
            $table->dropColumn('contact_phone');
        });

        Schema::table('found_items', function (Blueprint $table): void {
            $table->dropColumn('contact_phone');
        });
    }
};
