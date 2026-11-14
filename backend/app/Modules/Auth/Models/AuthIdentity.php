<?php

namespace App\Modules\Auth\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Links a User to an external identity (Google, Apple, password hash, etc.)
 * Unique on (provider, provider_user_id).
 * One user can have many identities.
 */
class AuthIdentity extends Model
{
    protected $table = 'auth_identities';

    protected $fillable = [
        'user_id',
        'provider',
        'provider_user_id',
        'provider_email',
        'verified_at',
        'last_used_at',
    ];

    protected $casts = [
        'verified_at'  => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
