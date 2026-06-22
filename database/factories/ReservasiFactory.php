<?php

namespace Database\Factories;

use App\Models\Dokter;
use App\Models\Jadwal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservasiFactory extends Factory
{
    // Map hari → hari berikutnya (untuk generate tanggal yang sesuai hari jadwal)
    private const HARI_DOW = [
        'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3,
        'Kamis' => 4, 'Jumat'  => 5, 'Sabtu' => 6,
    ];

    public function definition(): array
    {
        $jadwal = Jadwal::factory()->create();

        // Generate tanggal yang sesuai dengan hari jadwal (hari ke depan)
        $targetDow  = self::HARI_DOW[$jadwal->hari] ?? 1;
        $today      = now();
        $daysAhead  = ($targetDow - $today->dayOfWeek + 7) % 7 ?: 7;
        $tanggal    = $today->addDays($daysAhead)->toDateString();

        $nomor = $today->format('ymd') . '-J' . $jadwal->id . '-01';

        return [
            'user_id'           => User::factory(),
            'dokter_id'         => $jadwal->dokter_id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'nomor_antrian'     => $nomor,
            'status'            => 'menunggu',
            'keluhan'           => $this->faker->sentence(12),
        ];
    }
}
