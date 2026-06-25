<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DokterController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReservasiController;
use App\Http\Controllers\Api\RekamMedisController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

// ── PUBLIC ───────────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:register');
    Route::post('login',    [AuthController::class, 'login'])->middleware('throttle:login');
});

Route::middleware('throttle:api')->group(function () {
    Route::get('dokters',      [DokterController::class, 'index']);
    Route::get('dokters/{id}', [DokterController::class, 'show']);
    Route::get('jadwals',      [JadwalController::class, 'index']);
    Route::get('jadwals/{id}', [JadwalController::class, 'show']);

    // Cek sisa kuota jadwal (butuh tanggal sebagai query param)
    Route::get('jadwals/{id}/kuota', [ReservasiController::class, 'cekKuota']);
});

// ── BASIC AUTH ────────────────────────
Route::middleware('auth.basic')->get('auth/basic-test', function (\Illuminate\Http\Request $request) {
    return response()->json([
        'status'  => 'success',
        'message' => 'Autentikasi Basic Auth Berhasil!',
        'user'    => $request->user()->only(['id', 'name', 'email', 'role']),
    ]);
});


// ── PROTECTED JWT ────────────────────────────────────────────────────────────
Route::middleware(['auth:api', 'throttle:api'])->group(function () {

    // WebSocket channel authentication (untuk Reverb/Pusher private channels)
    Broadcast::routes(['middleware' => ['auth:api']]);

    Route::prefix('auth')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::get('me',       [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    Route::get('profile',          [ProfileController::class, 'show']);
    Route::put('profile',          [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'updatePassword']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    Route::apiResource('reservasis', ReservasiController::class);

    // ── ADMIN ────────────────────────────────────────────────────────────
    Route::middleware(['api.key', 'admin'])->group(function () {
        Route::apiResource('dokters',    DokterController::class)->except(['index', 'show']);
        Route::apiResource('jadwals',    JadwalController::class)->except(['index', 'show']);
        Route::apiResource('rekam-medis', RekamMedisController::class);

        Route::get('admin/reservasis',               [ReservasiController::class, 'indexAdmin']);
        Route::patch('admin/reservasis/{id}/status', [ReservasiController::class, 'updateStatus']);
    });
});