<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('day_closes', function (Blueprint $table) {
            $table->id();
            $table->date('business_date')->unique();
            $table->decimal('total_cash', 12, 2)->default(0);
            $table->decimal('total_mpesa', 12, 2)->default(0);
            $table->decimal('total_sales', 12, 2)->default(0);
            $table->decimal('total_commission', 12, 2)->default(0);
            $table->decimal('total_expenses', 12, 2)->default(0);
            $table->decimal('cash_variance', 12, 2)->default(0); // counted - expected
            $table->decimal('cash_counted', 12, 2)->nullable();  // physical count entered by manager
            $table->json('breakdown')->nullable();               // per-method totals
            $table->foreignId('closed_by')->constrained('users');
            $table->string('notes', 500)->nullable();
            $table->string('branch_id')->nullable();
            $table->timestamp('closed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('day_closes');
    }
};
