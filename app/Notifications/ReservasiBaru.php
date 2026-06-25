<?php

namespace App\Notifications;

use App\Models\Reservasi;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Notifikasi ke admin ketika pasien membuat reservasi baru.
 */
class ReservasiBaru extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(private Reservasi $reservasi) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $this->reservasi->loadMissing(['user', 'dokter', 'jadwal']);
        return [
            'reservasi_id'  => $this->reservasi->id,
            'nomor_antrian' => $this->reservasi->nomor_antrian,
            'title'         => 'Reservasi Baru Masuk',
            'message'       => "Pasien {$this->reservasi->user->name} membuat reservasi dengan dr. {$this->reservasi->dokter->nama} pada {$this->reservasi->tanggal_reservasi}.",
            'type'          => 'reservasi_baru',
        ];
    }
}
