<?php

namespace App\Notifications;

use App\Models\Reservasi;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

/**
 * Notifikasi email ke pasien saat reservasi dibatalkan (oleh admin atau pasien sendiri).
 */
class ReservasiDibatalkan extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(private Reservasi $reservasi) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $reservasi = $this->reservasi->load(['dokter']);

        return (new MailMessage)
            ->subject('❌ Reservasi Anda Dibatalkan — Klinik Sehat')
            ->greeting("Halo, {$notifiable->name}.")
            ->line('Kami informasikan bahwa reservasi Anda telah **dibatalkan**.')
            ->line('---')
            ->line("**No. Antrian :** {$reservasi->nomor_antrian}")
            ->line("**Dokter      :** {$reservasi->dokter->nama}")
            ->line("**Tanggal     :** {$reservasi->tanggal_reservasi}")
            ->line('---')
            ->line('Jika Anda ingin membuat reservasi baru, silakan kunjungi portal pasien kami.')
            ->action('Buat Reservasi Baru', url('/'))
            ->line('Terima kasih atas pengertian Anda.')
            ->salutation('Salam, Tim Klinik Sehat');
    }

    /**
     * Data yang disimpan di tabel notifications dan dibroadcast ke websocket.
     */
    public function toArray(object $notifiable): array
    {
        $this->reservasi->loadMissing(['dokter']);
        return [
            'reservasi_id' => $this->reservasi->id,
            'nomor_antrian' => $this->reservasi->nomor_antrian,
            'title' => 'Reservasi Dibatalkan',
            'message' => "Reservasi Anda dengan dr. {$this->reservasi->dokter->nama} pada tanggal {$this->reservasi->tanggal_reservasi} telah dibatalkan.",
            'type' => 'dibatalkan',
        ];
    }
}