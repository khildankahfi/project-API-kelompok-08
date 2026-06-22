<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DokterFactory extends Factory
{
    public function definition(): array
    {
        $spesialisasi = $this->faker->randomElement([
            'Umum', 'Penyakit Dalam', 'Anak', 'Kandungan',
            'Bedah', 'Jantung', 'Mata', 'THT', 'Kulit',
        ]);

        return [
            'nama'              => 'dr. ' . $this->faker->name(),
            'spesialisasi'      => $spesialisasi,
            'no_str'            => 'STR-' . $this->faker->numerify('####-####'),
            'bio'               => $this->faker->sentence(10),
            'biaya_konsultasi'  => $this->faker->randomElement([75000, 100000, 150000, 200000]),
        ];
    }
}
