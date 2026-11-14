<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('reason', 255)->nullable();
            $table->string('status', 30)->default('pending'); // pending|succeeded|failed
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('provider_reference', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
