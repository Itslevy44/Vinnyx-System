<?php

namespace App\Modules\Auth\Http\Controllers;

use App\Core\Http\ApiResponse;
use App\Modules\Auth\Http\Requests\LoginRequest;
use App\Modules\Auth\Http\Requests\RegisterRequest;
use App\Modules\Auth\Services\AuthService;
use App\Modules\Auth\DataObjects\AuthIdentityData;
use App\Modules\Auth\DataObjects\VerifiedIdentity;
use App\Modules\Auth\Events\UserRegistered;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    /** GET /auth/providers */
    public function providers(): JsonResponse
    {
        return ApiResponse::ok($this->authService->enabledProviders());
    }

    /** POST /auth/login */
    public function login(LoginRequest $request): JsonResponse
    {
        ['user' => $user, 'token' => $token] = $this->authService->login('password', $request);

        return ApiResponse::ok([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ]);
    }

    /** POST /auth/register (customer self-registration) */
    public function register(RegisterRequest $request): JsonResponse
    {
        $identity = new VerifiedIdentity(
            provider:        'password',
            providerUserId:  $request->input('email') ?? $request->input('phone'),
            email:           $request->input('email'),
            phone:           $request->input('phone'),
            name:            $request->input('name'),
            emailVerified:   false,
        );

        $data = new AuthIdentityData(
            identity:  $identity,
            userType:  'customer',
            role:      'customer',
            password:  $request->input('password'),
        );

        /** @var \App\Modules\Auth\Contracts\AuthProvider $provider */
        $provider = app(\App\Modules\Auth\Providers\PasswordProvider::class);
        $user     = $provider->register($data);

        event(new UserRegistered($user));

        $token = $user->createToken('api-token')->plainTextToken;

        return ApiResponse::created([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ]);
    }

    /** GET /auth/me */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::ok($this->formatUser($request->user()));
    }

    /** POST /auth/logout */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return ApiResponse::noContent();
    }

    private function formatUser(\App\Models\User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'phone'     => $user->phone,
            'role'      => $user->role,
            'user_type' => $user->user_type,
            'is_active' => $user->is_active,
        ];
    }
}
