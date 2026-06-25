<?php

namespace App\Notifications;

use App\Models\RekamMedis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Notifikasi ke pasien ketika rekam medis baru dibuat oleh dokter/admin.
 */
class RekamMedisBaru extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(private RekamMedis $rekamMedis) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $this->rekamMedis->loadMissing(['dokter', 'reservasi']);
        return [
            'rekam_medis_id' => $this->rekamMedis->id,
            'reservasi_id'   => $this->rekamMedis->reservasi_id,
            'title'          => 'Rekam Medis Tersedia',
            'message'        => "Dokter {$this->rekamMedis->dokter->nama} telah menginput rekam medis Anda. Diagnosis dan resep obat sudah tersedia.",
            'type'           => 'rekam_medis_baru',
        ];
    }
}
