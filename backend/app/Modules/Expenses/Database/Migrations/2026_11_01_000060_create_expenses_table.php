<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->string('category', 100);
            $table->string('description', 255);
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('KES');
            $table->date('expense_date');
            $table->foreignId('recorded_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('pending'); // pending|approved|rejected
            $table->string('branch_id')->nullable();
            $table->timestamps();

            $table->index(['expense_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
