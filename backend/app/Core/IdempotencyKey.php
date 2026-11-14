<?php

namespace App\Core;

use Illuminate\Support\Facades\Cache;

/**
 * Lightweight idempotency helper.
 * Stores results in the cache for 24 hours keyed by the client-supplied
 * Idempotency-Key header.  If the same key is seen again we return the
 * cached response instead of re-executing the action.
 */
final class IdempotencyKey
{
    private const TTL_SECONDS = 86400; // 24 h

    public static function key(string $prefix, string $clientKey): string
    {
        return "idempotency:{$prefix}:" . hash('sha256', $clientKey);
    }

    public static function remember(string $prefix, string $clientKey, callable $action): mixed
    {
        $cacheKey = self::key($prefix, $clientKey);

        return Cache::remember($cacheKey, self::TTL_SECONDS, $action);
    }

    public static function has(string $prefix, string $clientKey): bool
    {
        return Cache::has(self::key($prefix, $clientKey));
    }
}
