<?php

namespace App\Modules\Auth\DataObjects;

/** Returned by a provider after it successfully verifies a credential. */
final class VerifiedIdentity
{
    public function __construct(
        public readonly string  $provider,
        public readonly string  $providerUserId,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?string $name,
        public readonly bool    $emailVerified = false,
    ) {}
}
