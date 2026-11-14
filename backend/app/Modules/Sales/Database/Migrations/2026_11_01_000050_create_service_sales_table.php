<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_sales', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();      // human-readable, e.g. SV-2026-00001
            $table->foreignId('teller_id')->constrained('users');
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('service_id', 100);              // slug/code of the service
            $table->string('service_name', 255);            // snapshot of name at sale time
            $table->decimal('unit_price', 12, 2);
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('commission_rate', 8, 4)->default(0);
            $table->string('status', 20)->default('completed'); // completed|voided
            $table->string('void_reason', 255)->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('voided_at')->nullable();
            $table->string('branch_id')->nullable();
            $table->timestamps();

            $table->index(['teller_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_sales');
    }
};
