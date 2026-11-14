<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Settings\Database\Seeders\SettingsSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Settings defaults first (other seeders may read them)
        $this->call(SettingsSeeder::class);

        // Create the default Owner account if it doesn't exist
        User::firstOrCreate(
            ['email' => 'owner@vinnyx.co.ke'],
            [
                'name'      => 'Owner',
                'password'  => Hash::make('password'),
                'role'      => 'owner',
                'user_type' => 'staff',
                'is_active' => true,
            ]
        );
    }
}
