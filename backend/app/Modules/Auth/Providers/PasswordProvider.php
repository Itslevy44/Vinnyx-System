<?php

namespace App\Modules\Auth\Providers;

use App\Models\User;
use App\Modules\Auth\Contracts\AuthProvider;
use App\Modules\Auth\DataObjects\AuthIdentityData;
use App\Modules\Auth\DataObjects\VerifiedIdentity;
use App\Modules\Auth\Models\AuthIdentity;
use App\Modules\Auth\Models\AuthProviderSetting;
use App\Core\Exceptions\UnauthorizedException;
use App\Core\Exceptions\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordProvider implements AuthProvider
{
    public function key(): string
    {
        return 'password';
    }

    public function label(): string
    {
        return 'Email / Phone & Password';
    }

    public function isEnabled(): bool
    {
        $setting = AuthProviderSetting::where('provider', $this->key())->first();

        return $setting ? $setting->is_enabled : true; // default enabled
    }

    public function allowedFor(): array
    {
        $setting = AuthProviderSetting::where('provider', $this->key())->first();

        return $setting?->allowed_user_types ?? ['staff', 'customer'];
    }

    public function authenticate(Request $request): VerifiedIdentity
    {
        $request->validate([
            'identifier' => ['required', 'string'],
            'password'   => ['required', 'string'],
        ]);

        $identifier = $request->input('identifier');
        $password   = $request->input('password');

        // Allow login by email or phone
        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (! $user || ! Hash::check($password, (string) $user->password)) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        if (! $user->is_active) {
            throw new UnauthorizedException('Account is deactivated.');
        }

        return new VerifiedIdentity(
            provider:        $this->key(),
            providerUserId:  $user->email ?? $user->phone,
            email:           $user->email,
            phone:           $user->phone,
            name:            $user->name,
            emailVerified:   (bool) $user->email_verified_at,
        );
    }

    public function register(AuthIdentityData $data): User
    {
        $identity = $data->identity;

        if (! $identity->email && ! $identity->phone) {
            throw new ValidationException('Email or phone is required for registration.');
        }

        // Find existing user by email or phone
        $user = User::where('email', $identity->email)
            ->orWhere('phone', $identity->phone)
            ->first();

        if (! $user) {
            $user = User::create([
                'name'      => $identity->name ?? 'User',
                'email'     => $identity->email,
                'phone'     => $identity->phone,
                'password'  => $data->password ? Hash::make($data->password) : null,
                'role'      => $data->role ?? 'customer',
                'user_type' => $data->userType,
                'is_active' => true,
            ]);
        }

        // Create the identity link (idempotent)
        AuthIdentity::firstOrCreate(
            ['provider' => $this->key(), 'provider_user_id' => $identity->providerUserId],
            ['user_id' => $user->id, 'provider_email' => $identity->email, 'verified_at' => now()]
        );

        return $user;
    }
}
