<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('display_name', 100);
            $table->string('driver', 50);
            $table->json('channels');               // ["in_shop","online"]
            $table->boolean('is_active')->default(true);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->text('config')->nullable();     // encrypted JSON for gateway credentials
            $table->timestamps();
        });

        // Seed Phase 1 methods
        DB::table('payment_methods')->insert([
            [
                'code'         => 'cash',
                'display_name' => 'Cash',
                'driver'       => 'cash',
                'channels'     => json_encode(['in_shop']),
                'is_active'    => true,
                'sort_order'   => 1,
                'config'       => null,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'code'         => 'mpesa_manual',
                'display_name' => 'M-Pesa (Manual Code)',
                'driver'       => 'mpesa_manual',
                'channels'     => json_encode(['in_shop']),
                'is_active'    => true,
                'sort_order'   => 2,
                'config'       => null,
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
