<?php

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\DataObjects\AuthIdentityData;
use App\Modules\Auth\DataObjects\VerifiedIdentity;
use Illuminate\Http\Request;

/**
 * Every authentication provider must implement this contract.
 * The AuthService handles the common work (find/link user, throttling,
 * Sanctum token issuance, audit log). Providers only verify credentials.
 */
interface AuthProvider
{
    /** Short key used in the database and config: password, phone_otp, google, apple */
    public function key(): string;

    /** Display label shown to users */
    public function label(): string;

    /** Whether this provider is currently enabled (reads from settings) */
    public function isEnabled(): bool;

    /** User types this provider is available to: staff, customer, or both */
    public function allowedFor(): array;

    /**
     * Verify the credential in the request.
     * Returns a VerifiedIdentity on success, throws on failure.
     */
    public function authenticate(Request $request): VerifiedIdentity;

    /**
     * Create or link a user record from a verified identity.
     * Called by the AuthService after authenticate().
     */
    public function register(AuthIdentityData $identity): \App\Models\User;
}
