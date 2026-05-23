<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReservasiController extends Controller
{
    /**
     * GET /api/reservasis
     * Pasien hanya melihat reservasi milik sendiri.
     */
    public function index(): JsonResponse
    {
        $reservasis = Reservasi::with(['dokter', 'jadwal'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $reservasis,
        ]);
    }

    /**
     * POST /api/reservasis
     * Buat reservasi baru. user_id diambil dari JWT, bukan input.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dokter_id'          => 'required|exists:dokters,id',
            'jadwal_id'          => 'required|exists:jadwals,id',
            'tanggal_reservasi'  => 'required|date|after_or_equal:today',
            'keluhan'            => 'required|string|min:10|max:1000',
        ]);

        // Verifikasi jadwal milik dokter yang dipilih
        $jadwal = \App\Models\Jadwal::where('id', $validated['jadwal_id'])
            ->where('dokter_id', $validated['dokter_id'])
            ->where('is_aktif', true)
            ->firstOrFail();

        $reservasi = Reservasi::create([
            'user_id'           => auth()->id(),
            'dokter_id'         => $validated['dokter_id'],
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $validated['tanggal_reservasi'],
            'keluhan'           => $validated['keluhan'],
            'nomor_antrian'     => 'ANT-' . strtoupper(Str::random(6)),
            'status'            => 'pending',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Reservasi berhasil dibuat.',
            'data'    => $reservasi->load(['dokter', 'jadwal']),
        ], 201);
    }

    /**
     * GET /api/reservasis/{id}
     * Pasien hanya bisa lihat milik sendiri.
     */
    public function show(int $id): JsonResponse
    {
        $reservasi = Reservasi::with(['dokter', 'jadwal', 'rekamMedis.dokter'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $reservasi,
        ]);
    }

    /**
     * PUT /api/reservasis/{id}
     * Pasien hanya boleh membatalkan (status → dibatalkan) reservasi milik sendiri.
     * Status lain (dikonfirmasi, selesai) hanya bisa diset admin.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $reservasi = Reservasi::where('user_id', auth()->id())->findOrFail($id);

        // Pasien hanya boleh membatalkan, dan hanya ketika status masih pending
        if ($reservasi->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Reservasi tidak dapat diubah karena sudah berstatus ' . $reservasi->status . '.',
            ], 422);
        }

        $request->validate([
            'status' => 'required|in:dibatalkan',
        ]);

        $reservasi->update(['status' => 'dibatalkan']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Reservasi berhasil dibatalkan.',
            'data'    => $reservasi->fresh(['dokter', 'jadwal']),
        ]);
    }

    /**
     * DELETE /api/reservasis/{id}
     * Hapus (soft delete) reservasi milik sendiri yang masih pending.
     */
    public function destroy(int $id): JsonResponse
    {
        $reservasi = Reservasi::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->findOrFail($id);

        $reservasi->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Reservasi berhasil dihapus.',
        ]);
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN ENDPOINTS
    // ═══════════════════════════════════════════════════════

    /**
     * GET /api/admin/reservasis — admin: lihat semua reservasi.
     */
    public function indexAdmin(): JsonResponse
    {
        $reservasis = Reservasi::with(['user', 'dokter', 'jadwal', 'rekamMedis'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'total'  => $reservasis->count(),
            'data'   => $reservasis,
        ]);
    }

    /**
     * PATCH /api/admin/reservasis/{id}/status — admin: update status reservasi.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $reservasi = Reservasi::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,dikonfirmasi,selesai,dibatalkan',
        ]);

        $reservasi->update(['status' => $validated['status']]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Status reservasi berhasil diperbarui.',
            'data'    => $reservasi->fresh(['user', 'dokter', 'jadwal']),
        ]);
    }
}
