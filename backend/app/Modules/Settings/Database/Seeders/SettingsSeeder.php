<?php

namespace App\Modules\Settings\Database\Seeders;

use App\Modules\Settings\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // General
            ['key' => 'business_name',    'value' => 'Vinnyx',          'type' => 'string',  'group' => 'general',  'is_public' => true],
            ['key' => 'business_phone',   'value' => '',                'type' => 'string',  'group' => 'general',  'is_public' => true],
            ['key' => 'receipt_footer',   'value' => 'Thank you!',      'type' => 'string',  'group' => 'general',  'is_public' => true],
            ['key' => 'currency',         'value' => 'KES',             'type' => 'string',  'group' => 'general',  'is_public' => true],
            ['key' => 'timezone',         'value' => 'Africa/Nairobi',  'type' => 'string',  'group' => 'general',  'is_public' => true],

            // Day close
            ['key' => 'day_close_time',   'value' => '23:59',           'type' => 'string',  'group' => 'day_close', 'is_public' => false],

            // Commission
            ['key' => 'default_commission_rate', 'value' => '10',       'type' => 'integer', 'group' => 'commission','is_public' => false],

            // Auth providers enabled
            ['key' => 'auth_provider_password', 'value' => 'true',      'type' => 'boolean', 'group' => 'auth',      'is_public' => true],
        ];

        foreach ($defaults as $row) {
            Setting::firstOrCreate(['key' => $row['key']], $row);
        }
    }
}
