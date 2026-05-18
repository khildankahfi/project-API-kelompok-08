<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RekamMedis;
use Illuminate\Http\Request;

class RekamMedisController extends Controller
{
    public function index()
    {
        $rekamMedis = RekamMedis::with(['user', 'dokter', 'reservasi'])->get();
        return response()->json([
            'status' => 'success',
            'data' => $rekamMedis
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'reservasi_id' => 'required|exists:reservasis,id',
            'user_id' => 'required|exists:users,id',
            'dokter_id' => 'required|exists:dokters,id',
            'tanggal_periksa' => 'required|date',
            'diagnosis' => 'required|string',
            'resep_obat' => 'required|string',
            'catatan_dokter' => 'nullable|string',
        ]);

        $rekamMedis = RekamMedis::create($request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Rekam medis berhasil ditambahkan',
            'data' => $rekamMedis
        ], 201);
    }

    public function show($id)
    {
        $rekamMedis = RekamMedis::with(['user', 'dokter', 'reservasi'])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $rekamMedis
        ]);
    }

    public function update(Request $request, $id)
    {
        $rekamMedis = RekamMedis::findOrFail($id);
        $rekamMedis->update($request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Rekam medis berhasil diupdate',
            'data' => $rekamMedis
        ]);
    }

    public function destroy($id)
    {
        RekamMedis::findOrFail($id)->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Rekam medis berhasil dihapus'
        ]);
    }
}