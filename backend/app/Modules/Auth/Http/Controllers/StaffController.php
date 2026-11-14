<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Core\Exceptions\UnauthorizedException;
use App\Core\Http\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * Owner-only: create and manage staff accounts.
 * Staff accounts are created by the Owner only — not through self-registration.
 */
class StaffController extends Controller
{
    /** GET /admin/staff */
    public function index(): JsonResponse
    {
        $staff = User::where('user_type', 'staff')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => $this->format($u));

        return ApiResponse::ok($staff);
    }

    /** POST /admin/staff */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', Rule::in(['owner', 'manager', 'teller'])],
        ]);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'] ?? null,
            'phone'     => $validated['phone'] ?? null,
            'password'  => Hash::make($validated['password']),
            'role'      => $validated['role'],
            'user_type' => 'staff',
            'is_active' => true,
        ]);

        return ApiResponse::created($this->format($user));
    }

    /** PATCH /admin/staff/{user} */
    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->user_type !== 'staff') {
            throw new UnauthorizedException('Can only manage staff accounts here.');
        }

        $validated = $request->validate([
            'name'      => ['sometimes', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'role'      => ['sometimes', Rule::in(['owner', 'manager', 'teller'])],
        ]);

        $user->update($validated);

        // Deactivating a staff member revokes all their tokens immediately
        if (isset($validated['is_active']) && ! $validated['is_active']) {
            $user->tokens()->delete();
        }

        return ApiResponse::ok($this->format($user->fresh()));
    }

    private function format(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'phone'     => $user->phone,
            'role'      => $user->role,
            'is_active' => $user->is_active,
        ];
    }
}
