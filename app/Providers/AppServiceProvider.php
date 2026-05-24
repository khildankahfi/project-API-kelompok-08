<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Definisi rate limiter untuk semua API endpoint.
     * Ditempatkan di boot() karena Facade baru bisa dipakai setelah app selesai boot.
     */
    protected function configureRateLimiting(): void
    {
        // Login: 5 percobaan/menit per IP — cegah brute force password
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(fn() => response()->json([
                    'status'  => 'error',
                    'message' => 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.',
                ], 429));
        });

        // Register: 10 percobaan/menit per IP — cegah spam akun
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(fn() => response()->json([
                    'status'  => 'error',
                    'message' => 'Terlalu banyak percobaan registrasi. Coba lagi dalam 1 menit.',
                ], 429));
        });

        // API umum: 60 req/menit untuk user login, 30 untuk publik
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(60)->by($request->user()->id)
                : Limit::perMinute(30)->by($request->ip());
        });
    }
}