<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('identifier', 255);   // email or phone
            $table->string('provider', 30);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('succeeded')->default(false);
            $table->string('failure_reason', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['identifier', 'provider', 'created_at']);
            $table->index('ip_address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};
