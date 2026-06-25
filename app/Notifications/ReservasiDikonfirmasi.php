<?php

namespace App\Notifications;

use App\Models\Reservasi;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

/**
 * Notifikasi email yang dikirim ke pasien ketika admin mengkonfirmasi reservasi.
 * Dipanggil dari ReservasiController::updateStatus() saat status → 'dikonfirmasi'.
 */
class ReservasiDikonfirmasi extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(private Reservasi $reservasi) {}

    /**
     * Kirim via email, database, dan broadcast.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $reservasi = $this->reservasi->load(['dokter', 'jadwal']);

        return (new MailMessage)
            ->subject('✅ Reservasi Anda Telah Dikonfirmasi — Klinik Sehat')
            ->greeting("Halo, {$notifiable->name}!")
            ->line('Reservasi Anda telah **dikonfirmasi** oleh admin klinik.')
            ->line('---')
            ->line("**No. Antrian :** {$reservasi->nomor_antrian}")
            ->line("**Dokter      :** {$reservasi->dokter->nama}")
            ->line("**Spesialisasi:** {$reservasi->dokter->spesialisasi}")
            ->line("**Jadwal      :** {$reservasi->jadwal->hari}, {$reservasi->jadwal->jam_mulai} – {$reservasi->jadwal->jam_selesai}")
            ->line("**Tanggal     :** {$reservasi->tanggal_reservasi}")
            ->line('---')
            ->line('Harap datang **15 menit sebelum** jadwal dan bawa kartu identitas.')
            ->action('Lihat Detail Reservasi', url('/'))
            ->line('Terima kasih telah mempercayakan kesehatan Anda kepada Klinik Sehat.')
            ->salutation('Salam, Tim Klinik Sehat');
    }

    /**
     * Data yang disimpan di tabel notifications dan dibroadcast ke websocket.
     */
    public function toArray(object $notifiable): array
    {
        $this->reservasi->loadMissing(['dokter', 'jadwal']);
        return [
            'reservasi_id' => $this->reservasi->id,
            'nomor_antrian' => $this->reservasi->nomor_antrian,
            'title' => 'Reservasi Dikonfirmasi',
            'message' => "Reservasi Anda dengan dr. {$this->reservasi->dokter->nama} telah dikonfirmasi.",
            'type' => 'dikonfirmasi',
        ];
    }
}