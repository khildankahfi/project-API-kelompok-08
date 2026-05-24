<?php

namespace App\Http\Traits;

use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Trait PaginationHelper
 *
 * Standardisasi format response pagination di semua controller.
 * Pakai: use PaginationHelper; di dalam class Controller.
 */
trait PaginationHelper
{
    /**
     * Ubah LengthAwarePaginator menjadi array response yang konsisten.
     *
     * Contoh response:
     * {
     *   "status": "success",
     *   "data": [...],
     *   "meta": {
     *     "current_page": 1,
     *     "per_page": 10,
     *     "total": 47,
     *     "last_page": 5,
     *     "from": 1,
     *     "to": 10,
     *     "has_more": true
     *   },
     *   "links": {
     *     "first": "http://.../api/dokters?page=1",
     *     "last":  "http://.../api/dokters?page=5",
     *     "prev":  null,
     *     "next":  "http://.../api/dokters?page=2"
     *   }
     * }
     */
    protected function paginatedResponse(LengthAwarePaginator $paginator, int $status = 200): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $paginator->items(),
            'meta'   => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),  // nomor item pertama di halaman ini
                'to'           => $paginator->lastItem(),   // nomor item terakhir di halaman ini
                'has_more'     => $paginator->hasMorePages(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
        ], $status);
    }

    /**
     * Ambil nilai per_page dari query string dengan batas aman.
     * Mencegah user kirim ?per_page=99999 yang membebani database.
     *
     * @param int $default  Default items per halaman
     * @param int $max      Maksimum items per halaman
     */
    protected function getPerPage(int $default = 10, int $max = 50): int
    {
        $perPage = (int) request()->query('per_page', $default);
        return max(1, min($perPage, $max));
    }
}