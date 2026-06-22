<?php

namespace Database\Factories;

use App\Models\Dokter;
use Illuminate\Database\Eloquent\Factories\Factory;

class JadwalFactory extends Factory
{
    public function definition(): array
    {
        $jamMulai   = $this->faker->randomElement(['08:00', '09:00', '13:00', '14:00']);
        $jamSelesai = $this->faker->randomElement(['12:00', '17:00', '16:00', '18:00']);

        return [
            'dokter_id'   => Dokter::factory(),
            'hari'        => $this->faker->randomElement(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']),
            'jam_mulai'   => $jamMulai,
            'jam_selesai' => $jamSelesai,
            'kuota'       => $this->faker->numberBetween(5, 20),
            'is_aktif'    => true,
        ];
    }
}
