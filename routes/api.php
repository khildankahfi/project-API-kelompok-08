<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DokterController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\ReservasiController;
use App\Http\Controllers\Api\RekamMedisController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Klinik Sehat
|--------------------------------------------------------------------------
| Rate Limiting:
|   POST /auth/login    → max 5 req/menit per IP     (throttle:login)
|   POST /auth/register → max 10 req/menit per IP    (throttle:register)
|   Semua endpoint lain → max 60 req/menit per user  (throttle:api)
*/

// ═══════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════
Route::prefix('auth')->group(function () {
    // Rate limit ketat untuk auth endpoint — mencegah brute force
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('login',    [AuthController::class, 'login'])->middleware('throttle:login');
});

// Endpoint publik — rate limit standar
Route::middleware('throttle:api')->group(function () {
    Route::get('dokters',       [DokterController::class, 'index']);
    Route::get('dokters/{id}',  [DokterController::class, 'show']);
    Route::get('jadwals',       [JadwalController::class, 'index']);
    Route::get('jadwals/{id}',  [JadwalController::class, 'show']);
});

// ═══════════════════════════════════════════════════════════
// PROTECTED — JWT + rate limit
// ═══════════════════════════════════════════════════════════
Route::middleware(['auth:api', 'throttle:api'])->group(function () {

    // Auth utilities
    Route::prefix('auth')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::get('me',       [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    // Pasien: kelola reservasi milik sendiri
    Route::apiResource('reservasis', ReservasiController::class);

    // ─── ADMIN: JWT + API Key + role admin ──────────────────────────────
    Route::middleware(['api.key', 'admin'])->group(function () {

        Route::apiResource('dokters', DokterController::class)
             ->except(['index', 'show']);

        Route::apiResource('jadwals', JadwalController::class)
             ->except(['index', 'show']);

        Route::apiResource('rekam-medis', RekamMedisController::class);

        Route::get('admin/reservasis',               [ReservasiController::class, 'indexAdmin']);
        Route::patch('admin/reservasis/{id}/status', [ReservasiController::class, 'updateStatus']);
    });
});