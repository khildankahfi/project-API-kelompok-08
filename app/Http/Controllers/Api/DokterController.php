<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DokterController extends Controller
{
    /**
     * GET /api/dokters — public, tampil beserta jadwal aktif.
     */
    public function index(): JsonResponse
    {
        $dokters = Dokter::with(['jadwals' => fn($q) => $q->where('is_aktif', true)])
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $dokters,
        ]);
    }

    /**
     * POST /api/dokters — admin only (JWT + API Key + admin role).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'              => 'required|string|max:255',
            'spesialisasi'      => 'required|string|max:255',
            'no_str'            => 'required|string|unique:dokters,no_str|max:50',
            'biaya_konsultasi'  => 'required|integer|min:0',
            'foto'              => 'nullable|string',
            'bio'               => 'nullable|string',
        ]);

        $dokter = Dokter::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Dokter berhasil ditambahkan.',
            'data'    => $dokter,
        ], 201);
    }

    /**
     * GET /api/dokters/{id} — public, beserta jadwal & histori reservasi.
     */
    public function show(int $id): JsonResponse
    {
        $dokter = Dokter::with([
            'jadwals' => fn($q) => $q->where('is_aktif', true),
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $dokter,
        ]);
    }

    /**
     * PUT /api/dokters/{id} — admin only.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $dokter = Dokter::findOrFail($id);

        $validated = $request->validate([
            'nama'             => 'sometimes|string|max:255',
            'spesialisasi'     => 'sometimes|string|max:255',
            'no_str'           => "sometimes|string|unique:dokters,no_str,{$id}|max:50",
            'biaya_konsultasi' => 'sometimes|integer|min:0',
            'foto'             => 'nullable|string',
            'bio'              => 'nullable|string',
        ]);

        $dokter->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data dokter berhasil diperbarui.',
            'data'    => $dokter->fresh(),
        ]);
    }

    /**
     * DELETE /api/dokters/{id} — admin only.
     * Cascade delete ke jadwals → reservasis → rekam_medis (via FK).
     */
    public function destroy(int $id): JsonResponse
    {
        Dokter::findOrFail($id)->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Dokter berhasil dihapus.',
        ]);
    }
}
