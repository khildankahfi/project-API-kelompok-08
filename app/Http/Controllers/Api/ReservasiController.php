<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\PaginationHelper;
use App\Models\Reservasi;
use App\Notifications\ReservasiDibatalkan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservasiController extends Controller
{
    use PaginationHelper;

    // Map nama hari Indonesia → nomor hari PHP (0=Minggu, 1=Senin, dst)
    private const HARI_MAP = [
        'Minggu' => 0, 'Senin' => 1, 'Selasa' => 2,
        'Rabu'   => 3, 'Kamis' => 4, 'Jumat'  => 5, 'Sabtu' => 6,
    ];

    /**
     * GET /api/reservasis?status=menunggu&page=1
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
     * POST /api/reservasis
     *
     * Alur baru:
     * 1. Validasi hari — tanggal_reservasi harus sesuai hari jadwal
     * 2. Cek kuota — hitung reservasi aktif hari itu, tolak kalau penuh
     * 3. Generate nomor antrian berdasarkan urutan (ANT-01, ANT-02, ...)
     * 4. Status langsung 'menunggu' (tidak perlu konfirmasi admin)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dokter_id'         => 'required|exists:dokters,id',
            'jadwal_id'         => 'required|exists:jadwals,id',
            'tanggal_reservasi' => 'required|date|after_or_equal:today',
            'keluhan'           => 'required|string|min:10|max:1000',
        ]);

        // ── Ambil jadwal & verifikasi milik dokter ────────────────────────
        $jadwal = \App\Models\Jadwal::where('id', $validated['jadwal_id'])
            ->where('dokter_id', $validated['dokter_id'])
            ->where('is_aktif', true)
            ->firstOrFail();

        // ── Validasi hari: tanggal harus cocok dengan hari jadwal ─────────
        $hariJadwal   = $jadwal->hari;
        $hariTanggal  = (int) date('w', strtotime($validated['tanggal_reservasi']));
        $hariExpected = self::HARI_MAP[$hariJadwal] ?? -1;

        if ($hariTanggal !== $hariExpected) {
            return response()->json([
                'status'  => 'error',
                'message' => "Tanggal yang dipilih bukan hari {$hariJadwal}. Silakan pilih tanggal yang sesuai dengan jadwal praktik.",
            ], 422);
        }

        // ── Cek kuota harian ──────────────────────────────────────────────
        $terdaftar = Reservasi::where('jadwal_id', $jadwal->id)
            ->where('tanggal_reservasi', $validated['tanggal_reservasi'])
            ->whereNotIn('status', ['dibatalkan'])
            ->count();

        if ($terdaftar >= $jadwal->kuota) {
            return response()->json([
                'status'  => 'error',
                'message' => "Antrian untuk jadwal ini pada tanggal tersebut sudah penuh ({$jadwal->kuota} pasien). Silakan pilih tanggal lain.",
                'kuota'   => $jadwal->kuota,
                'terisi'  => $terdaftar,
            ], 422);
        }

        // ── Nomor antrian: unik global dengan format YYMMDD-J{jadwal_id}-{urutan} ──
        // Contoh: 260610-J2-03 = tanggal 10 Jun 2026, jadwal ke-2, antrian ke-3
        // Format ini unik karena kombinasi tanggal+jadwal+urutan tidak mungkin sama
        $nomorUrut    = $terdaftar + 1;
        $tglSingkat   = date('ymd', strtotime($validated['tanggal_reservasi']));
        $nomorAntrian = $tglSingkat . '-J' . $jadwal->id . '-' . str_pad($nomorUrut, 2, '0', STR_PAD_LEFT);

        $reservasi = Reservasi::create([
            'user_id'           => auth()->id(),
            'dokter_id'         => $validated['dokter_id'],
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $validated['tanggal_reservasi'],
            'keluhan'           => $validated['keluhan'],
            'nomor_antrian'     => $nomorAntrian,
            'status'            => 'menunggu',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => "Janji temu berhasil dibuat! Nomor antrian Anda: {$nomorAntrian}.",
            'data'    => $reservasi->load(['dokter', 'jadwal']),
            'info'    => [
                'nomor_antrian' => $nomorAntrian,
                'urutan'        => $nomorUrut,
                'dari_total'    => $jadwal->kuota,
                'sisa_kuota'    => $jadwal->kuota - $nomorUrut,
            ],
        ], 201);
    }

    /**
     * GET /api/reservasis/{id}
     */
    public function show(int $id): JsonResponse
    {
        $reservasi = Reservasi::with(['dokter', 'jadwal', 'rekamMedis'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json(['status' => 'success', 'data' => $reservasi]);
    }

    /**
     * PUT /api/reservasis/{id}
     * Pasien hanya bisa membatalkan yang masih 'menunggu'.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $reservasi = Reservasi::where('user_id', auth()->id())->findOrFail($id);

        if ($reservasi->status !== 'menunggu') {
            return response()->json([
                'status'  => 'error',
                'message' => "Janji temu tidak dapat dibatalkan karena sudah berstatus {$reservasi->status}.",
            ], 422);
        }

        $request->validate(['status' => 'required|in:dibatalkan']);
        $reservasi->update(['status' => 'dibatalkan']);

        try {
            $reservasi->user->notify(new ReservasiDibatalkan($reservasi));
        } catch (\Exception) {}

        return response()->json([
            'status'  => 'success',
            'message' => 'Janji temu berhasil dibatalkan.',
            'data'    => $reservasi->fresh(['dokter', 'jadwal']),
        ]);
    }

    /**
     * DELETE /api/reservasis/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Reservasi::where('user_id', auth()->id())
            ->where('status', 'menunggu')
            ->findOrFail($id)
            ->delete();

        return response()->json(['status' => 'success', 'message' => 'Janji temu berhasil dihapus.']);
    }

    // ═══ ADMIN ════════════════════════════════════════════════════════

    /**
     * GET /api/admin/reservasis
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
     * PATCH /api/admin/reservasis/{id}/status
     * Admin hanya bisa set: selesai | dibatalkan
     * (tidak ada 'dikonfirmasi' lagi — antrian langsung aktif)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $reservasi = Reservasi::with('user')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:menunggu,selesai,dibatalkan',
        ]);

        $reservasi->update(['status' => $validated['status']]);

        // Kirim notifikasi kalau dibatalkan admin
        try {
            if ($validated['status'] === 'dibatalkan') {
                $reservasi->user->notify(new ReservasiDibatalkan($reservasi));
            }
        } catch (\Exception) {}

        return response()->json([
            'status'  => 'success',
            'message' => 'Status janji temu berhasil diperbarui.',
            'data'    => $reservasi->fresh(['user', 'dokter', 'jadwal']),
        ]);
    }

    /**
     * GET /api/jadwals/{id}/kuota?tanggal=2026-06-10
     * Cek sisa kuota jadwal untuk tanggal tertentu (untuk frontend).
     */
    public function cekKuota(Request $request, int $jadwalId): JsonResponse
    {
        $request->validate(['tanggal' => 'required|date|after_or_equal:today']);

        $jadwal    = \App\Models\Jadwal::findOrFail($jadwalId);
        $terdaftar = Reservasi::where('jadwal_id', $jadwalId)
            ->where('tanggal_reservasi', $request->tanggal)
            ->whereNotIn('status', ['dibatalkan'])
            ->count();

        return response()->json([
            'status'     => 'success',
            'data'       => [
                'jadwal_id'   => $jadwalId,
                'tanggal'     => $request->tanggal,
                'kuota'       => $jadwal->kuota,
                'terisi'      => $terdaftar,
                'sisa'        => max(0, $jadwal->kuota - $terdaftar),
                'penuh'       => $terdaftar >= $jadwal->kuota,
            ],
        ]);
    }
}