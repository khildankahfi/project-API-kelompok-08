<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiKeyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('X-API-KEY');

        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'API Key tidak ditemukan'
            ], 401);
        }

        $user = \App\Models\User::where('api_key', $apiKey)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'API Key tidak valid'
            ], 401);
        }

        return $next($request);
    }
}