<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * Four-level fallback for percentage commission (spec v1.0 §2.1):
         *   1. teller + service   (most specific)
         *   2. teller only
         *   3. service only
         *   4. global default     (teller_id NULL, service_id NULL)
         *
         * The CommissionResolver picks the most-specific matching row.
         */
        Schema::create('commission_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teller_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('service_id', 100)->nullable();
            $table->string('strategy', 30)->default('percentage');
            $table->decimal('rate', 8, 4);          // e.g. 10.0000 = 10 %
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['teller_id', 'service_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_rates');
    }
};
