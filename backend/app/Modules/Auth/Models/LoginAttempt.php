<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Records every login attempt (success and failure).
 * Used for throttling, audit log, and security monitoring.
 */
class LoginAttempt extends Model
{
    public $timestamps = false;

    protected $table = 'login_attempts';

    protected $fillable = [
        'identifier',
        'provider',
        'ip_address',
        'user_agent',
        'succeeded',
        'failure_reason',
        'created_at',
    ];

    protected $casts = [
        'succeeded'  => 'boolean',
        'created_at' => 'datetime',
    ];
}
