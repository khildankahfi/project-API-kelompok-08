<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\PaginationHelper;
use App\Models\Reservasi;
use App\Notifications\ReservasiDibatalkan;
use App\Notifications\ReservasiDikonfirmasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReservasiController extends Controller
{
    use PaginationHelper;

    /**
     * @OA\Get(
     *     path="/reservasis",
     *     tags={"Reservasi"},
     *     summary="Daftar reservasi milik sendiri",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status",   in="query", required=false, @OA\Schema(type="string", enum={"pending","dikonfirmasi","selesai","dibatalkan"})),
     *     @OA\Parameter(name="page",     in="query", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=10)),
     *     @OA\Response(response=200, description="Daftar reservasi"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Reservasi::with(['dokter', 'jadwal'])
            ->where('user_id', auth()->id())
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $this->paginatedResponse($query->paginate($this->getPerPage(10)));
    }

    /**
     * @OA\Post(
     *     path="/reservasis",
     *     tags={"Reservasi"},
     *     summary="Buat reservasi baru",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"dokter_id","jadwal_id","tanggal_reservasi","keluhan"},
     *             @OA\Property(property="dokter_id",         type="integer", example=1),
     *             @OA\Property(property="jadwal_id",         type="integer", example=1),
     *             @OA\Property(property="tanggal_reservasi", type="string",  format="date", example="2026-06-10"),
     *             @OA\Property(property="keluhan",           type="string",  example="Demam tinggi selama 3 hari", minLength=10)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Reservasi berhasil dibuat"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dokter_id'         => 'required|exists:dokters,id',
            'jadwal_id'         => 'required|exists:jadwals,id',
            'tanggal_reservasi' => 'required|date|after_or_equal:today',
            'keluhan'           => 'required|string|min:10|max:1000',
        ]);

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
     * @OA\Get(
     *     path="/reservasis/{id}",
     *     tags={"Reservasi"},
     *     summary="Detail reservasi milik sendiri",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Detail reservasi beserta rekam medis jika sudah ada"),
     *     @OA\Response(response=404, description="Tidak ditemukan")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $reservasi = Reservasi::with(['dokter', 'jadwal', 'rekamMedis'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json(['status' => 'success', 'data' => $reservasi]);
    }

    /**
     * @OA\Put(
     *     path="/reservasis/{id}",
     *     tags={"Reservasi"},
     *     summary="Batalkan reservasi milik sendiri (hanya status pending)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(@OA\Property(property="status", type="string", enum={"dibatalkan"}, example="dibatalkan"))
     *     ),
     *     @OA\Response(response=200, description="Reservasi berhasil dibatalkan"),
     *     @OA\Response(response=422, description="Status bukan pending")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $reservasi = Reservasi::where('user_id', auth()->id())->findOrFail($id);

        if ($reservasi->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => "Reservasi tidak dapat diubah karena sudah berstatus {$reservasi->status}.",
            ], 422);
        }

        $request->validate(['status' => 'required|in:dibatalkan']);
        $reservasi->update(['status' => 'dibatalkan']);

        // Kirim notifikasi email pembatalan ke pasien
        try {
            $reservasi->user->notify(new ReservasiDibatalkan($reservasi));
        } catch (\Exception) {
            // Gagal kirim email tidak boleh gagalkan response API
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Reservasi berhasil dibatalkan.',
            'data'    => $reservasi->fresh(['dokter', 'jadwal']),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/reservasis/{id}",
     *     tags={"Reservasi"},
     *     summary="Hapus reservasi (hanya pending)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\Response(response=200, description="Reservasi berhasil dihapus"),
     *     @OA\Response(response=404, description="Tidak ditemukan")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        Reservasi::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->findOrFail($id)
            ->delete();

        return response()->json(['status' => 'success', 'message' => 'Reservasi berhasil dihapus.']);
    }

    // ═══ ADMIN ════════════════════════════════════════════════════════

    /**
     * @OA\Get(
     *     path="/admin/reservasis",
     *     tags={"Admin"},
     *     summary="Semua reservasi seluruh pasien (admin only)",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="status",    in="query", required=false, @OA\Schema(type="string", enum={"pending","dikonfirmasi","selesai","dibatalkan"})),
     *     @OA\Parameter(name="search",    in="query", description="Cari nama pasien", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="dokter_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="page",      in="query", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="per_page",  in="query", required=false, @OA\Schema(type="integer", example=15)),
     *     @OA\Response(response=200, description="Semua reservasi"),
     *     @OA\Response(response=403, description="Bukan admin")
     * )
     */
    public function indexAdmin(Request $request): JsonResponse
    {
        $query = Reservasi::with(['user', 'dokter', 'jadwal', 'rekamMedis'])->latest();

        if ($status   = $request->query('status'))    $query->where('status', $status);
        if ($search   = $request->query('search'))    $query->whereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"));
        if ($dokterId = $request->query('dokter_id')) $query->where('dokter_id', $dokterId);

        return $this->paginatedResponse($query->paginate($this->getPerPage(15)));
    }

    /**
     * @OA\Patch(
     *     path="/admin/reservasis/{id}/status",
     *     tags={"Admin"},
     *     summary="Update status reservasi + kirim email notifikasi ke pasien",
     *     description="Otomatis kirim email ke pasien saat status berubah ke 'dikonfirmasi' atau 'dibatalkan'.",
     *     security={{"bearerAuth":{}, "apiKeyAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string",
     *                 enum={"pending","dikonfirmasi","selesai","dibatalkan"},
     *                 example="dikonfirmasi")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Status diperbarui + email terkirim"),
     *     @OA\Response(response=403, description="Bukan admin"),
     *     @OA\Response(response=404, description="Reservasi tidak ditemukan")
     * )
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $reservasi  = Reservasi::with('user')->findOrFail($id);
        $statusLama = $reservasi->status;

        $validated = $request->validate([
            'status' => 'required|in:pending,dikonfirmasi,selesai,dibatalkan',
        ]);

        $reservasi->update(['status' => $validated['status']]);

        // ── Kirim email notifikasi berdasarkan perubahan status ──────────
        // Dibungkus try-catch agar kegagalan email tidak gagalkan response
        try {
            match ($validated['status']) {
                'dikonfirmasi' => $reservasi->user->notify(new ReservasiDikonfirmasi($reservasi)),
                'dibatalkan'   => $reservasi->user->notify(new ReservasiDibatalkan($reservasi)),
                default        => null, // selesai & pending tidak perlu notif
            };
        } catch (\Exception) {}

        $emailInfo = match ($validated['status']) {
            'dikonfirmasi', 'dibatalkan' => ' Email notifikasi telah dikirim ke pasien.',
            default                      => '',
        };

        return response()->json([
            'status'  => 'success',
            'message' => "Status reservasi berhasil diperbarui.{$emailInfo}",
            'data'    => $reservasi->fresh(['user', 'dokter', 'jadwal']),
        ]);
    }
}