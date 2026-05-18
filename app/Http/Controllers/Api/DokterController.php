<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use Illuminate\Http\Request;

class DokterController extends Controller
{
    public function index()
    {
        $dokters = Dokter::with('jadwals')->get();
        return response()->json([
            'status' => 'success',
            'data' => $dokters
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string',
            'spesialisasi' => 'required|string',
            'no_str' => 'required|string',
            'biaya_konsultasi' => 'required|integer',
        ]);

        $dokter = Dokter::create($request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Dokter berhasil ditambahkan',
            'data' => $dokter
        ], 201);
    }

    public function show($id)
    {
        $dokter = Dokter::with(['jadwals', 'reservasis'])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $dokter
        ]);
    }

    public function update(Request $request, $id)
    {
        $dokter = Dokter::findOrFail($id);
        $dokter->update($request->all());
        return response()->json([
            'status' => 'success',
            'message' => 'Dokter berhasil diupdate',
            'data' => $dokter
        ]);
    }

    public function destroy($id)
    {
        Dokter::findOrFail($id)->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Dokter berhasil dihapus'
        ]);
    }
}