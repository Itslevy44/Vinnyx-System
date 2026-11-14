<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->morphs('payable');                          // payable_type + payable_id
            $table->string('method_code', 30);
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('KES');
            $table->string('status', 30)->default('initiated');
            // initiated|pending|succeeded|failed|cancelled|expired|partially_refunded|refunded
            $table->string('provider_reference', 100)->nullable();
            $table->string('idempotency_key', 100)->nullable()->unique();
            $table->string('payer_phone', 20)->nullable();
            $table->foreignId('initiated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('branch_id')->nullable();
            $table->string('failure_reason', 255)->nullable();
            $table->timestamp('initiated_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'initiated_at']);
            $table->index('method_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
