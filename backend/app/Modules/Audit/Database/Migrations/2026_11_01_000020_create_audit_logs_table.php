<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event', 100);                      // e.g. UserLoggedIn, PaymentSucceeded
            $table->string('module', 50);                      // Auth, Payments, Sales …
            $table->nullableMorphs('subject');                 // subject_type + subject_id
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->json('payload')->nullable();               // sanitised event data
            $table->string('branch_id')->nullable();           // branch readiness
            $table->timestamp('created_at')->useCurrent();

            $table->index(['event', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
