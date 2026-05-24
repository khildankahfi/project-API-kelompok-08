<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\PaginationHelper;
use App\Models\Jadwal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JadwalController extends Controller
{
    use PaginationHelper;

    private const HARI_LIST = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

    /**
     * GET /api/jadwals?page=1&per_page=10&hari=Senin&dokter_id=1
     * Public — support filter hari & dokter_id.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Jadwal::with('dokter');

        if ($hari = $request->query('hari')) {
            $query->where('hari', $hari);
        }

        if ($dokterId = $request->query('dokter_id')) {
            $query->where('dokter_id', $dokterId);
        }

        // Default tampilkan yang aktif saja, kecuali admin minta semua
        if ($request->query('show_all') !== 'true') {
            $query->where('is_aktif', true);
        }

        $jadwals = $query->paginate($this->getPerPage(10));

        return $this->paginatedResponse($jadwals);
    }

    public function store(Request $request): JsonResponse
    {
        $hariEnum  = implode(',', self::HARI_LIST);
        $validated = $request->validate([
            'dokter_id'   => 'required|exists:dokters,id',
            'hari'        => "required|in:{$hariEnum}",
            'jam_mulai'   => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'kuota'       => 'required|integer|min:1|max:100',
            'is_aktif'    => 'sometimes|boolean',
        ]);

        $jadwal = Jadwal::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Jadwal berhasil ditambahkan.',
            'data'    => $jadwal->load('dokter'),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $jadwal = Jadwal::with('dokter')->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $jadwal]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $jadwal   = Jadwal::findOrFail($id);
        $hariEnum = implode(',', self::HARI_LIST);

        $validated = $request->validate([
            'dokter_id'   => 'sometimes|exists:dokters,id',
            'hari'        => "sometimes|in:{$hariEnum}",
            'jam_mulai'   => 'sometimes|date_format:H:i',
            'jam_selesai' => 'sometimes|date_format:H:i',
            'kuota'       => 'sometimes|integer|min:1|max:100',
            'is_aktif'    => 'sometimes|boolean',
        ]);

        $jadwal->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Jadwal berhasil diperbarui.',
            'data'    => $jadwal->fresh('dokter'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        Jadwal::findOrFail($id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Jadwal berhasil dihapus.']);
    }
}