<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

/**
 * Middleware: validasi X-API-KEY header.
 * Dipakai untuk endpoint admin (double-layer security: JWT + API Key).
 */
class ApiKeyMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        $apiKey = $request->header('X-API-KEY');

        if (!$apiKey) {
            return response()->json([
                'status'  => 'error',
                'message' => 'X-API-KEY header tidak ditemukan.',
                'hint'    => 'Sertakan header X-API-KEY dengan nilai api_key akun Anda.',
            ], 401);
        }

        $user = User::where('api_key', $apiKey)->first();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'API Key tidak valid atau sudah tidak aktif.',
            ], 401);
        }

        return $next($request);
    }
}
