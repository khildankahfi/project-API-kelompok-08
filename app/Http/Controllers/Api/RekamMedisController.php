<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RekamMedis;
use App\Models\Reservasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RekamMedisController extends Controller
{
    /**
     * GET /api/rekam-medis — admin: lihat semua rekam medis.
     */
    public function index(): JsonResponse
    {
        $rekamMedis = RekamMedis::with(['user', 'dokter', 'reservasi'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'total'  => $rekamMedis->count(),
            'data'   => $rekamMedis,
        ]);
    }

    /**
     * POST /api/rekam-medis — admin: tambah rekam medis.
     * user_id & dokter_id otomatis diambil dari reservasi — tidak perlu input manual.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservasi_id'    => 'required|exists:reservasis,id|unique:rekam_medis,reservasi_id',
            'tanggal_periksa' => 'required|date',
            'diagnosis'       => 'required|string|min:5',
            'resep_obat'      => 'required|string|min:5',
            'catatan_dokter'  => 'nullable|string',
        ]);

        // Ambil user_id & dokter_id dari reservasi — hindari data inconsistency
        $reservasi = Reservasi::findOrFail($validated['reservasi_id']);

        $rekamMedis = RekamMedis::create([
            ...$validated,
            'user_id'   => $reservasi->user_id,
            'dokter_id' => $reservasi->dokter_id,
        ]);

        // Update status reservasi → selesai otomatis
        $reservasi->update(['status' => 'selesai']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Rekam medis berhasil ditambahkan. Status reservasi diperbarui ke "selesai".',
            'data'    => $rekamMedis->load(['user', 'dokter', 'reservasi']),
        ], 201);
    }

    /**
     * GET /api/rekam-medis/{id} — admin.
     */
    public function show(int $id): JsonResponse
    {
        $rekamMedis = RekamMedis::with(['user', 'dokter', 'reservasi'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $rekamMedis,
        ]);
    }

    /**
     * PUT /api/rekam-medis/{id} — admin.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $rekamMedis = RekamMedis::findOrFail($id);

        $validated = $request->validate([
            'tanggal_periksa' => 'sometimes|date',
            'diagnosis'       => 'sometimes|string|min:5',
            'resep_obat'      => 'sometimes|string|min:5',
            'catatan_dokter'  => 'nullable|string',
        ]);

        $rekamMedis->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Rekam medis berhasil diperbarui.',
            'data'    => $rekamMedis->fresh(['user', 'dokter', 'reservasi']),
        ]);
    }

    /**
     * DELETE /api/rekam-medis/{id} — admin.
     */
    public function destroy(int $id): JsonResponse
    {
        RekamMedis::findOrFail($id)->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Rekam medis berhasil dihapus.',
        ]);
    }
}
