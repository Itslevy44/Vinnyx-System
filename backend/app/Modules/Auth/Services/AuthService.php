<?php

namespace App\Modules\Auth\Services;

use App\Core\Exceptions\UnauthorizedException;
use App\Models\User;
use App\Modules\Auth\Contracts\AuthProvider;
use App\Modules\Auth\Models\AuthIdentity;
use App\Modules\Auth\Models\LoginAttempt;
use App\Modules\Auth\Events\UserLoggedIn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthService
{
    /** @param  array<AuthProvider>  $providers */
    public function __construct(private readonly array $providers) {}

    /** Return all enabled providers (for GET /auth/providers). */
    public function enabledProviders(): array
    {
        return collect($this->providers)
            ->filter(fn (AuthProvider $p) => $p->isEnabled())
            ->map(fn (AuthProvider $p) => [
                'key'          => $p->key(),
                'label'        => $p->label(),
                'allowed_for'  => $p->allowedFor(),
            ])
            ->values()
            ->all();
    }

    /**
     * Authenticate a request via the given provider key.
     * Returns [user, token] on success.
     */
    public function login(string $providerKey, Request $request): array
    {
        $provider = $this->resolveProvider($providerKey);

        $this->checkThrottle($request);

        $identity = null;
        $user     = null;

        try {
            $identity = $provider->authenticate($request);

            // Resolve the user from the identity
            $user = $this->resolveUser($identity);

            if (! $user || ! $user->is_active) {
                throw new UnauthorizedException('Account is inactive.');
            }

            $this->recordAttempt($request, $providerKey, $request->input('identifier', $identity->email ?? $identity->phone ?? ''), true);

            RateLimiter::clear($this->throttleKey($request));

            DB::transaction(function () use ($user) {
                $user->update(['last_login_at' => now()]);
                AuthIdentity::where('user_id', $user->id)
                    ->where('provider', 'password')
                    ->update(['last_used_at' => now()]);
            });

            event(new UserLoggedIn($user));

            $token = $user->createToken('api-token')->plainTextToken;

            return ['user' => $user, 'token' => $token];

        } catch (\Throwable $e) {
            $identifier = $request->input('identifier', '');
            $this->recordAttempt($request, $providerKey, $identifier, false, $e->getMessage());

            RateLimiter::hit($this->throttleKey($request), 300);

            throw $e;
        }
    }

    /** Revoke all tokens for the user. */
    public function logout(User $user): void
    {
        $user->tokens()->delete();
    }

    private function resolveProvider(string $key): AuthProvider
    {
        foreach ($this->providers as $provider) {
            if ($provider->key() === $key) {
                if (! $provider->isEnabled()) {
                    throw new UnauthorizedException("Provider [{$key}] is disabled.");
                }

                return $provider;
            }
        }

        throw new UnauthorizedException("Unknown provider [{$key}].");
    }

    private function resolveUser(\App\Modules\Auth\DataObjects\VerifiedIdentity $identity): ?User
    {
        // First try by identity link
        $authIdentity = AuthIdentity::where('provider', $identity->provider)
            ->where('provider_user_id', $identity->providerUserId)
            ->with('user')
            ->first();

        if ($authIdentity) {
            return $authIdentity->user;
        }

        // Fall back to matching by email
        if ($identity->email) {
            return User::where('email', $identity->email)->first();
        }

        return null;
    }

    private function checkThrottle(Request $request): void
    {
        if (RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            $seconds = RateLimiter::availableIn($this->throttleKey($request));
            throw new UnauthorizedException("Too many login attempts. Try again in {$seconds} seconds.");
        }
    }

    private function throttleKey(Request $request): string
    {
        return 'login:' . Str::lower($request->input('identifier', '')) . '|' . $request->ip();
    }

    private function recordAttempt(
        Request $request,
        string  $provider,
        string  $identifier,
        bool    $succeeded,
        ?string $reason = null
    ): void {
        LoginAttempt::create([
            'identifier'     => $identifier,
            'provider'       => $provider,
            'ip_address'     => $request->ip(),
            'user_agent'     => $request->userAgent(),
            'succeeded'      => $succeeded,
            'failure_reason' => $reason,
            'created_at'     => now(),
        ]);
    }
}
