<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_callbacks', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 30);
            $table->json('raw_payload');
            $table->string('verification_result', 30)->nullable(); // valid|invalid|unknown
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('received_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();

            $table->index(['provider', 'received_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_callbacks');
    }
};
