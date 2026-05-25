<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * @OA\Get(
     *     path="/profile",
     *     tags={"Profile"},
     *     summary="Ambil data profil pasien yang sedang login",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Data profil berhasil diambil"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'status' => 'success',
            'data'   => $user->only(['id', 'name', 'email', 'no_hp', 'role', 'created_at']),
        ]);
    }

    /**
     * @OA\Put(
     *     path="/profile",
     *     tags={"Profile"},
     *     summary="Update profil pasien (nama, email, no_hp)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name",  type="string", example="Budi Santoso Baru"),
     *             @OA\Property(property="email", type="string", format="email", example="budibaru@example.com"),
     *             @OA\Property(property="no_hp", type="string", example="081299998888")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profil berhasil diperbarui"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function update(Request $request): JsonResponse
    {
        $user      = auth()->user();
        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            // Unique kecuali email milik sendiri
            'email' => "sometimes|email|unique:users,email,{$user->id}",
            'no_hp' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data'    => $user->fresh()->only(['id', 'name', 'email', 'no_hp', 'role']),
        ]);
    }

    /**
     * @OA\Put(
     *     path="/profile/password",
     *     tags={"Profile"},
     *     summary="Ganti password pasien",
     *     description="Butuh verifikasi password lama sebelum set password baru.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password","new_password","new_password_confirmation"},
     *             @OA\Property(property="current_password",          type="string", format="password", example="password123"),
     *             @OA\Property(property="new_password",              type="string", format="password", example="newpassword456"),
     *             @OA\Property(property="new_password_confirmation", type="string", format="password", example="newpassword456")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Password berhasil diganti"),
     *     @OA\Response(response=422, description="Password lama salah atau validasi gagal")
     * )
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = auth()->user();

        $request->validate([
            'current_password'          => 'required|string',
            'new_password'              => ['required', 'confirmed', Password::min(6)],
            'new_password_confirmation' => 'required|string',
        ]);

        // Verifikasi password lama sebelum ganti
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Password lama tidak sesuai.',
                'errors'  => ['current_password' => ['Password lama tidak sesuai.']],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Password berhasil diperbarui. Silakan login ulang.',
        ]);
    }
}