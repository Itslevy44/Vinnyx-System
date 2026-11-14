<?php

namespace App\Modules\Auth\DataObjects;

/** Passed to AuthProvider::register() to create or link a user. */
final class AuthIdentityData
{
    public function __construct(
        public readonly VerifiedIdentity $identity,
        public readonly string           $userType,  // staff | customer
        public readonly ?string          $role = null,
        public readonly ?string          $password = null,
    ) {}
}
