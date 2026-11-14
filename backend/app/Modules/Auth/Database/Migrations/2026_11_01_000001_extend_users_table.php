<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('password')->nullable()->change(); // social-only users have no password
            $table->string('role', 30)->default('teller')->after('phone');
            $table->string('user_type', 20)->default('staff')->after('role');
            $table->boolean('is_active')->default(true)->after('user_type');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'user_type', 'is_active', 'last_login_at']);
            $table->string('password')->nullable(false)->change();
        });
    }
};
