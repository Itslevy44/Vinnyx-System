<?php

namespace App\Models;

use App\Modules\Auth\Models\AuthIdentity;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'user_type',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    public function isStaff(): bool
    {
        return $this->user_type === 'staff';
    }

    public function isCustomer(): bool
    {
        return $this->user_type === 'customer';
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function identities(): HasMany
    {
        return $this->hasMany(AuthIdentity::class);
    }
}
