<?php

namespace App\Http\Middleware;

use App\Core\Exceptions\UnauthorizedException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage: Route::middleware('role:owner') or 'role:owner,manager'
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            throw new UnauthorizedException('You do not have permission for this action.');
        }

        return $next($request);
    }
}
