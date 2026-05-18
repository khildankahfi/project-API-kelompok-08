<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DokterController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\ReservasiController;
use App\Http\Controllers\Api\RekamMedisController;
use Illuminate\Support\Facades\Route;

// PUBLIC ROUTES
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

Route::get('dokters',      [DokterController::class, 'index']);
Route::get('dokters/{id}', [DokterController::class, 'show']);
Route::get('jadwals',      [JadwalController::class, 'index']);

// PROTECTED BY JWT
Route::middleware('auth:api')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    Route::apiResource('reservasis', ReservasiController::class);

    // PROTECTED BY JWT + API KEY
    Route::middleware('api.key')->group(function () {
        Route::apiResource('dokters',     DokterController::class)->except(['index','show']);
        Route::apiResource('jadwals',     JadwalController::class)->except(['index']);
        Route::apiResource('rekam-medis', RekamMedisController::class);
    });
});