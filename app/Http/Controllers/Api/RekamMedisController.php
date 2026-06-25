<?php

namespace App\Http\Controllers\Api;

use OpenApi\Annotations as OA;
use App\Http\Controllers\Controller;
use App\Http\Traits\PaginationHelper;
use App\Models\RekamMedis;
use App\Models\Reservasi;
use App\Notifications\RekamMedisBaru;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RekamMedisController extends Controller
{
    use PaginationHelper;

    /**
     * @OA\Get(
     *     path="/rekam-medis",
     *     tags={"Rekam Medis"},
     *     summary="Semua rekam medis (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="search",    in="query", description="Cari diagnosis atau resep", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="dokter_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="page",      in="query", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="per_page",  in="query", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Response(response=200, description="Daftar rekam medis"),
     *     @OA\Response(response=403, description="Bukan admin")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = RekamMedis::with(['user', 'dokter', 'reservasi'])->latest();

        if ($search   = $request->query('search'))    $query->where(fn($q) => $q->where('diagnosis', 'like', "%{$search}%")->orWhere('resep_obat', 'like', "%{$search}%"));
        if ($dokterId = $request->query('dokter_id')) $query->where('dokter_id', $dokterId);

        return $this->paginatedResponse($query->paginate($this->getPerPage(10)));
    }

    /**
     * @OA\Post(
     *     path="/rekam-medis",
     *     tags={"Rekam Medis"},
     *     summary="Buat rekam medis baru (admin only)",
     *     description="user_id dan dokter_id diambil otomatis dari reservasi_id. Status reservasi otomatis berubah ke 'selesai'.",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reservasi_id","tanggal_periksa","diagnosis","resep_obat"},
     *             @OA\Property(property="reservasi_id",    type="integer", example=1, description="Unik — satu reservasi hanya bisa punya satu rekam medis"),
     *             @OA\Property(property="tanggal_periksa", type="string",  format="date", example="2026-06-10"),
     *             @OA\Property(property="diagnosis",       type="string",  example="Infeksi Saluran Pernapasan Atas (ISPA)", minLength=5),
     *             @OA\Property(property="resep_obat",      type="string",  example="Paracetamol 500mg 3x1", minLength=5),
     *             @OA\Property(property="catatan_dokter",  type="string",  example="Istirahat 3 hari.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Rekam medis berhasil dibuat",
     *         @OA\JsonContent(
     *             @OA\Property(property="status",  type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Rekam medis berhasil ditambahkan. Status reservasi diperbarui ke 'selesai'.")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Bukan admin"),
     *     @OA\Response(response=422, description="Validasi gagal atau reservasi sudah punya rekam medis")
     * )
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

        $reservasi  = Reservasi::findOrFail($validated['reservasi_id']);
        $rekamMedis = RekamMedis::create([
            ...$validated,
            'user_id'   => $reservasi->user_id,
            'dokter_id' => $reservasi->dokter_id,
        ]);

        $reservasi->update(['status' => 'selesai']);

        // Notifikasi ke pasien bahwa rekam medisnya sudah tersedia
        try {
            $reservasi->user->notify(new RekamMedisBaru($rekamMedis));
        } catch (\Exception) {}

        return response()->json([
            'status'  => 'success',
            'message' => 'Rekam medis berhasil ditambahkan. Status reservasi diperbarui ke "selesai".',
            'data'    => $rekamMedis->load(['user', 'dokter', 'reservasi']),
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/rekam-medis/{id}",
     *     tags={"Rekam Medis"},
     *     summary="Detail rekam medis (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Detail rekam medis"),
     *     @OA\Response(response=404, description="Tidak ditemukan")
     * )
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => RekamMedis::with(['user','dokter','reservasi'])->findOrFail($id)]);
    }

    /**
     * @OA\Put(
     *     path="/rekam-medis/{id}",
     *     tags={"Rekam Medis"},
     *     summary="Update rekam medis (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="diagnosis",      type="string", example="Diagnosis diperbarui"),
     *             @OA\Property(property="resep_obat",     type="string", example="Resep diperbarui"),
     *             @OA\Property(property="catatan_dokter", type="string", example="Catatan diperbarui")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Rekam medis berhasil diperbarui"),
     *     @OA\Response(response=404, description="Tidak ditemukan")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $rekamMedis = RekamMedis::findOrFail($id);
        $rekamMedis->update($request->validate([
            'tanggal_periksa' => 'sometimes|date',
            'diagnosis'       => 'sometimes|string|min:5',
            'resep_obat'      => 'sometimes|string|min:5',
            'catatan_dokter'  => 'nullable|string',
        ]));

        return response()->json(['status' => 'success', 'message' => 'Rekam medis berhasil diperbarui.', 'data' => $rekamMedis->fresh(['user','dokter','reservasi'])]);
    }

    /**
     * @OA\Delete(
     *     path="/rekam-medis/{id}",
     *     tags={"Rekam Medis"},
     *     summary="Hapus rekam medis (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Rekam medis berhasil dihapus"),
     *     @OA\Response(response=404, description="Tidak ditemukan")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        RekamMedis::findOrFail($id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Rekam medis berhasil dihapus.']);
    }
}