<?php

namespace App\Http\Controllers\Api;

use OpenApi\Annotations as OA;
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
     * @OA\Post(
     *     path="/auth/register",
     *     tags={"Auth"},
     *     summary="Registrasi akun pasien baru",
     *     description="Mendaftarkan akun baru dengan role 'pasien'. Mengembalikan JWT token dan API Key.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *             @OA\Property(property="name",     type="string",  example="Budi Santoso"),
     *             @OA\Property(property="email",    type="string",  format="email", example="budi@example.com"),
     *             @OA\Property(property="password", type="string",  format="password", example="password123", minLength=6),
     *             @OA\Property(property="no_hp",    type="string",  example="081234567890")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Registrasi berhasil",
     *         @OA\JsonContent(
     *             @OA\Property(property="status",      type="string",  example="success"),
     *             @OA\Property(property="message",     type="string",  example="Registrasi berhasil"),
     *             @OA\Property(property="token",       type="string",  example="eyJ0eXAiOiJKV1Q..."),
     *             @OA\Property(property="token_type",  type="string",  example="bearer"),
     *             @OA\Property(property="expires_in",  type="integer", example=3600),
     *             @OA\Property(property="api_key",     type="string",  example="xK9mP2qRtL8nZvYw..."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id",    type="integer", example=3),
     *                 @OA\Property(property="name",  type="string",  example="Budi Santoso"),
     *                 @OA\Property(property="email", type="string",  example="budi@example.com"),
     *                 @OA\Property(property="role",  type="string",  example="pasien")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
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
     * @OA\Post(
     *     path="/auth/login",
     *     tags={"Auth"},
     *     summary="Login dan dapatkan JWT token",
     *     description="Autentikasi dengan email dan password. Mengembalikan JWT token dan API Key untuk digunakan di request selanjutnya.",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email",    type="string", format="email", example="admin@klinik.com"),
     *             @OA\Property(property="password", type="string", format="password", example="admin123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login berhasil",
     *         @OA\JsonContent(
     *             @OA\Property(property="status",     type="string",  example="success"),
     *             @OA\Property(property="token",      type="string",  example="eyJ0eXAiOiJKV1Q..."),
     *             @OA\Property(property="token_type", type="string",  example="bearer"),
     *             @OA\Property(property="expires_in", type="integer", example=3600),
     *             @OA\Property(property="api_key",    type="string",  example="xK9mP2qRtL8nZvYw...")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Email atau password salah")
     * )
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
     * @OA\Post(
     *     path="/auth/logout",
     *     tags={"Auth"},
     *     summary="Logout dan invalidate token",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Logout berhasil"),
     *     @OA\Response(response=401, description="Token tidak valid")
     * )
     */
    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException) {}

        return response()->json(['status' => 'success', 'message' => 'Logout berhasil.']);
    }

    /**
     * @OA\Get(
     *     path="/auth/me",
     *     tags={"Auth"},
     *     summary="Ambil data profil user yang sedang login",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Data user berhasil diambil",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id",      type="integer", example=1),
     *                 @OA\Property(property="name",    type="string",  example="Administrator"),
     *                 @OA\Property(property="email",   type="string",  example="admin@klinik.com"),
     *                 @OA\Property(property="role",    type="string",  example="admin"),
     *                 @OA\Property(property="api_key", type="string",  example="xK9mP2qRtL8nZvYw...")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me(): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => auth()->user()]);
    }

    /**
     * @OA\Post(
     *     path="/auth/refresh",
     *     tags={"Auth"},
     *     summary="Refresh JWT token tanpa login ulang",
     *     description="Token lama diinvalidasi dan token baru dikembalikan.",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token berhasil di-refresh",
     *         @OA\JsonContent(
     *             @OA\Property(property="status",     type="string",  example="success"),
     *             @OA\Property(property="token",      type="string",  example="eyJ0eXAiOiJKV1Q..."),
     *             @OA\Property(property="token_type", type="string",  example="bearer"),
     *             @OA\Property(property="expires_in", type="integer", example=3600)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Token tidak dapat di-refresh")
     * )
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