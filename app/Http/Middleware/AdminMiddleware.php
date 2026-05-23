<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Middleware: hanya user dengan role 'admin' yang bisa akses.
 * Harus dipakai setelah middleware auth:api (JWT sudah valid).
 */
class AdminMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak. Hanya admin yang diizinkan.',
            ], 403);
        }

        return $next($request);
    }
}
