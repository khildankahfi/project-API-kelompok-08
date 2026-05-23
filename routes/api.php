<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DokterController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\ReservasiController;
use App\Http\Controllers\Api\RekamMedisController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════════
// PUBLIC ROUTES (tidak perlu token)
// ═══════════════════════════════════════════════════════════
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// Endpoint publik: lihat daftar dokter & jadwal
Route::get('dokters',       [DokterController::class, 'index']);
Route::get('dokters/{id}',  [DokterController::class, 'show']);
Route::get('jadwals',       [JadwalController::class, 'index']);
Route::get('jadwals/{id}',  [JadwalController::class, 'show']);

// ═══════════════════════════════════════════════════════════
// PROTECTED BY JWT (auth:api)
// ═══════════════════════════════════════════════════════════
Route::middleware('auth:api')->group(function () {

    // ── Auth Utilities ───────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::get('me',       [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']); // ← baru: refresh JWT
    });

    // ── Pasien: Reservasi (user hanya lihat/buat milik sendiri) ──
    Route::apiResource('reservasis', ReservasiController::class);

    // ════════════════════════════════════════════════════════
    // PROTECTED BY JWT + API KEY + ADMIN ROLE
    // ════════════════════════════════════════════════════════
    Route::middleware(['api.key', 'admin'])->group(function () {

        // CRUD dokter (kecuali index & show yang sudah public)
        Route::apiResource('dokters', DokterController::class)
             ->except(['index', 'show']);

        // CRUD jadwal (kecuali index & show yang sudah public)
        Route::apiResource('jadwals', JadwalController::class)
             ->except(['index', 'show']);

        // CRUD rekam medis
        Route::apiResource('rekam-medis', RekamMedisController::class);

        // Admin: lihat SEMUA reservasi & update status
        Route::get('admin/reservasis',               [ReservasiController::class, 'indexAdmin']);
        Route::patch('admin/reservasis/{id}/status', [ReservasiController::class, 'updateStatus']);
    });
});
