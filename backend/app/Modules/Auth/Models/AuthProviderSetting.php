<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Owner-controlled settings for each auth provider.
 * config is encrypted JSON for client_id / client_secret etc.
 */
class AuthProviderSetting extends Model
{
    protected $table = 'auth_provider_settings';

    protected $fillable = [
        'provider',
        'is_enabled',
        'allowed_user_types',
        'config',
    ];

    protected $casts = [
        'is_enabled'         => 'boolean',
        'allowed_user_types' => 'array',
        'config'             => 'encrypted:array',
    ];
}
