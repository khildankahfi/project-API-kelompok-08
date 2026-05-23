<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Register pasien baru.
     * Otomatis generate api_key unik saat register.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'no_hp'    => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'no_hp'    => $validated['no_hp'] ?? null,
            'role'     => 'pasien',
            // api_key di-generate otomatis, bukan dari input user
            'api_key'  => Str::random(40),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'status'     => 'success',
            'message'    => 'Registrasi berhasil',
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'api_key'    => $user->api_key,
            'data'       => $user->only(['id', 'name', 'email', 'role', 'no_hp']),
        ], 201);
    }

    /**
     * Login dan dapatkan JWT token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $user = auth()->user();

        return response()->json([
            'status'     => 'success',
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'api_key'    => $user->api_key,
            'data'       => $user->only(['id', 'name', 'email', 'role', 'no_hp']),
        ]);
    }

    /**
     * Logout dan invalidate token JWT saat ini.
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException) {
            // Token sudah expired/invalid — tetap anggap logout berhasil
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Ambil data user yang sedang login.
     */
    public function me(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'status' => 'success',
            'data'   => $user,
        ]);
    }

    /**
     * Refresh JWT token.
     */
    public function refresh(): JsonResponse
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token tidak dapat di-refresh. Silakan login ulang.',
            ], 401);
        }

        return response()->json([
            'status'     => 'success',
            'token'      => $newToken,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }
}
