<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Dapatkan daftar notifikasi (belum dibaca & sudah dibaca).
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(10);
        return response()->json([
            'status' => 'success',
            'data' => $notifications,
        ]);
    }

    /**
     * Dapatkan jumlah notifikasi belum dibaca.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'count' => $request->user()->unreadNotifications()->count()
            ]
        ]);
    }

    /**
     * Tandai notifikasi sebagai telah dibaca.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'status' => 'success',
            'message' => 'Notifikasi telah ditandai dibaca.'
        ]);
    }

    /**
     * Tandai semua notifikasi sebagai telah dibaca.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'status' => 'success',
            'message' => 'Semua notifikasi telah ditandai dibaca.'
        ]);
    }
}
