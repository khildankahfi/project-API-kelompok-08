<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DokterController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReservasiController;
use App\Http\Controllers\Api\RekamMedisController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('login',    [AuthController::class, 'login'])->middleware('throttle:login');
});

Route::middleware('throttle:api')->group(function () {
    Route::get('dokters',      [DokterController::class, 'index']);
    Route::get('dokters/{id}', [DokterController::class, 'show']);
    Route::get('jadwals',      [JadwalController::class, 'index']);
    Route::get('jadwals/{id}', [JadwalController::class, 'show']);
});

// ═══════════════════════════════════════════════════════════
// PROTECTED — JWT
// ═══════════════════════════════════════════════════════════
Route::middleware(['auth:api', 'throttle:api'])->group(function () {

    // Auth utilities
    Route::prefix('auth')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::get('me',       [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    // ── Profile pasien ───────────────────────────────────────────────
    Route::get('profile',           [ProfileController::class, 'show']);
    Route::put('profile',           [ProfileController::class, 'update']);
    Route::put('profile/password',  [ProfileController::class, 'updatePassword']);

    // ── Reservasi pasien ─────────────────────────────────────────────
    Route::apiResource('reservasis', ReservasiController::class);

    // ── ADMIN: JWT + API Key + role admin ────────────────────────────
    Route::middleware(['api.key', 'admin'])->group(function () {
        Route::apiResource('dokters', DokterController::class)->except(['index', 'show']);
        Route::apiResource('jadwals', JadwalController::class)->except(['index', 'show']);
        Route::apiResource('rekam-medis', RekamMedisController::class);

        Route::get('admin/reservasis',               [ReservasiController::class, 'indexAdmin']);
        Route::patch('admin/reservasis/{id}/status', [ReservasiController::class, 'updateStatus']);
    });
});