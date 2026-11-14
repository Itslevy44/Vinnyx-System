<?php

namespace App\Core\Http;

use Illuminate\Http\JsonResponse;

/**
 * Uniform JSON response shape used by all module controllers.
 *
 * Success:  { "data": ..., "meta": ... }
 * Error:    { "error": { "code": "...", "message": "..." } }
 */
final class ApiResponse
{
    public static function ok(mixed $data = null, array $meta = [], int $status = 200): JsonResponse
    {
        $body = ['data' => $data];
        if ($meta) {
            $body['meta'] = $meta;
        }

        return response()->json($body, $status);
    }

    public static function created(mixed $data = null): JsonResponse
    {
        return self::ok($data, status: 201);
    }

    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    public static function error(string $code, string $message, int $status = 400): JsonResponse
    {
        return response()->json([
            'error' => [
                'code'    => $code,
                'message' => $message,
            ],
        ], $status);
    }

    public static function paginated(\Illuminate\Pagination\LengthAwarePaginator $paginator, callable $transform): JsonResponse
    {
        return self::ok(
            array_map($transform, iterator_to_array($paginator->items())),
            [
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ]
        );
    }
}
