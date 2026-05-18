<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Http\Request;

class JadwalController extends Controller
{
    public function index()
    {
        $jadwals = Jadwal::with('dokter')->get();
        return response()->json([
            'status' => 'success',
            'data' => $jadwals
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dokter_id' => 'required|exists:dokters,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'kuota' => 'required|integer',
        ]);

        $jadwal = Jadwal::create($request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil ditambahkan',
            'data' => $jadwal
        ], 201);
    }

    public function show($id)
    {
        $jadwal = Jadwal::with('dokter')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $jadwal
        ]);
    }

    public function update(Request $request, $id)
    {
        $jadwal = Jadwal::findOrFail($id);
        $jadwal->update($request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil diupdate',
            'data' => $jadwal
        ]);
    }

    public function destroy($id)
    {
        Jadwal::findOrFail($id)->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil dihapus'
        ]);
    }
}