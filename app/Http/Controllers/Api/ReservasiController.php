<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservasi;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReservasiController extends Controller
{
    public function index()
    {
        $reservasis = Reservasi::with(['dokter', 'jadwal'])
            ->where('user_id', auth()->id())
            ->get();
        return response()->json([
            'status' => 'success',
            'data' => $reservasis
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dokter_id' => 'required|exists:dokters,id',
            'jadwal_id' => 'required|exists:jadwals,id',
            'tanggal_reservasi' => 'required|date',
            'keluhan' => 'required|string',
        ]);

        $reservasi = Reservasi::create([
            'user_id' => auth()->id(),
            'dokter_id' => $request->dokter_id,
            'jadwal_id' => $request->jadwal_id,
            'tanggal_reservasi' => $request->tanggal_reservasi,
            'keluhan' => $request->keluhan,
            'nomor_antrian' => 'ANT-' . strtoupper(Str::random(6)),
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reservasi berhasil dibuat',
            'data' => $reservasi
        ], 201);
    }

    public function show($id)
    {
        $reservasi = Reservasi::with(['dokter', 'jadwal', 'rekamMedis'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $reservasi
        ]);
    }

    public function update(Request $request, $id)
    {
        $reservasi = Reservasi::where('user_id', auth()->id())->findOrFail($id);
        $reservasi->update($request->only('status'));
        return response()->json([
            'status' => 'success',
            'message' => 'Reservasi berhasil diupdate',
            'data' => $reservasi
        ]);
    }

    public function destroy($id)
    {
        $reservasi = Reservasi::where('user_id', auth()->id())->findOrFail($id);
        $reservasi->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Reservasi berhasil dibatalkan'
        ]);
    }
}