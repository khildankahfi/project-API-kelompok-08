<?php

namespace App\Http\Controllers\Api;

use OpenApi\Annotations as OA;
use App\Http\Controllers\Controller;
use App\Http\Traits\PaginationHelper;
use App\Models\Dokter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DokterController extends Controller
{
    use PaginationHelper;

    /**
     * @OA\Get(
     *     path="/dokters",
     *     tags={"Dokter"},
     *     summary="Daftar semua dokter (public)",
     *     description="Menampilkan semua dokter beserta jadwal aktif. Support pencarian dan pagination.",
     *     @OA\Parameter(name="search",      in="query", description="Cari nama atau spesialisasi", required=false, @OA\Schema(type="string", example="penyakit dalam")),
     *     @OA\Parameter(name="spesialisasi",in="query", description="Filter per spesialisasi",      required=false, @OA\Schema(type="string", example="Penyakit Dalam")),
     *     @OA\Parameter(name="page",        in="query", description="Nomor halaman",                required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="per_page",    in="query", description="Jumlah item per halaman (max 50)", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Response(
     *         response=200,
     *         description="Daftar dokter",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="data",   type="array", @OA\Items(
     *                 @OA\Property(property="id",                type="integer", example=1),
     *                 @OA\Property(property="nama",             type="string",  example="dr. Siti Nurhaliza, Sp.PD"),
     *                 @OA\Property(property="spesialisasi",     type="string",  example="Penyakit Dalam"),
     *                 @OA\Property(property="biaya_konsultasi", type="integer", example=150000)
     *             )),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="per_page",     type="integer", example=10),
     *                 @OA\Property(property="total",        type="integer", example=5),
     *                 @OA\Property(property="last_page",    type="integer", example=1),
     *                 @OA\Property(property="has_more",     type="boolean", example=false)
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Dokter::with(['jadwals' => fn($q) => $q->where('is_aktif', true)]);

        if ($search = $request->query('search')) {
            $query->where(fn($q) => $q
                ->where('nama', 'like', "%{$search}%")
                ->orWhere('spesialisasi', 'like', "%{$search}%")
            );
        }

        if ($spesialisasi = $request->query('spesialisasi')) {
            $query->where('spesialisasi', $spesialisasi);
        }

        return $this->paginatedResponse($query->paginate($this->getPerPage(10)));
    }

    /**
     * @OA\Post(
     *     path="/dokters",
     *     tags={"Dokter"},
     *     summary="Tambah dokter baru (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nama","spesialisasi","no_str","biaya_konsultasi"},
     *             @OA\Property(property="nama",             type="string",  example="dr. Siti Nurhaliza, Sp.PD"),
     *             @OA\Property(property="spesialisasi",     type="string",  example="Penyakit Dalam"),
     *             @OA\Property(property="no_str",           type="string",  example="STR-2024-001"),
     *             @OA\Property(property="biaya_konsultasi", type="integer", example=150000),
     *             @OA\Property(property="bio",              type="string",  example="Dokter berpengalaman 10 tahun.")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Dokter berhasil ditambahkan"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Bukan admin"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama'             => 'required|string|max:255',
            'spesialisasi'     => 'required|string|max:255',
            'no_str'           => 'required|string|unique:dokters,no_str|max:50',
            'biaya_konsultasi' => 'required|integer|min:0',
            'foto'             => 'nullable|string',
            'bio'              => 'nullable|string',
        ]);

        $dokter = Dokter::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Dokter berhasil ditambahkan.',
            'data'    => $dokter,
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/dokters/{id}",
     *     tags={"Dokter"},
     *     summary="Detail satu dokter (public)",
     *     @OA\Parameter(name="id", in="path", required=true, description="ID dokter", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Detail dokter beserta jadwal aktif"),
     *     @OA\Response(response=404, description="Dokter tidak ditemukan")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $dokter = Dokter::with(['jadwals' => fn($q) => $q->where('is_aktif', true)])->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $dokter]);
    }

    /**
     * @OA\Put(
     *     path="/dokters/{id}",
     *     tags={"Dokter"},
     *     summary="Update data dokter (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="biaya_konsultasi", type="integer", example=175000),
     *             @OA\Property(property="bio",              type="string",  example="Bio diperbarui.")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Dokter berhasil diperbarui"),
     *     @OA\Response(response=403, description="Bukan admin"),
     *     @OA\Response(response=404, description="Dokter tidak ditemukan")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $dokter    = Dokter::findOrFail($id);
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
     * @OA\Delete(
     *     path="/dokters/{id}",
     *     tags={"Dokter"},
     *     summary="Hapus dokter (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Dokter berhasil dihapus"),
     *     @OA\Response(response=403, description="Bukan admin"),
     *     @OA\Response(response=404, description="Dokter tidak ditemukan")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        Dokter::findOrFail($id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Dokter berhasil dihapus.']);
    }
}