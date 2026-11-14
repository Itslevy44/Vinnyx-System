<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_provider_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 30)->unique();
            $table->boolean('is_enabled')->default(true);
            $table->json('allowed_user_types')->nullable(); // ["staff","customer"]
            $table->text('config')->nullable();             // encrypted JSON (client_id etc.)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_provider_settings');
    }
};
