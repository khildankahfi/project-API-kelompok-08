<?php

namespace Database\Seeders;

use App\Models\Dokter;
use App\Models\Jadwal;
use Illuminate\Database\Seeder;

class DokterSeeder extends Seeder
{
    public function run(): void
    {
        $dokters = [
            [
                'dokter' => [
                    'nama'             => 'dr. Siti Nurhaliza, Sp.PD',
                    'spesialisasi'     => 'Penyakit Dalam',
                    'no_str'           => 'STR-2024-001',
                    'biaya_konsultasi' => 150000,
                    'bio'              => 'Spesialis penyakit dalam dengan pengalaman 10 tahun di bidang diabetes, hipertensi, dan gangguan metabolik.',
                ],
                'jadwals' => [
                    ['hari' => 'Senin',  'jam_mulai' => '08:00', 'jam_selesai' => '12:00', 'kuota' => 10],
                    ['hari' => 'Rabu',   'jam_mulai' => '13:00', 'jam_selesai' => '16:00', 'kuota' => 8],
                    ['hari' => 'Jumat',  'jam_mulai' => '08:00', 'jam_selesai' => '11:00', 'kuota' => 8],
                ],
            ],
            [
                'dokter' => [
                    'nama'             => 'dr. Budi Hartanto, Sp.A',
                    'spesialisasi'     => 'Spesialis Anak',
                    'no_str'           => 'STR-2024-002',
                    'biaya_konsultasi' => 175000,
                    'bio'              => 'Dokter spesialis anak berpengalaman dalam penanganan tumbuh kembang, imunisasi, dan penyakit infeksi anak.',
                ],
                'jadwals' => [
                    ['hari' => 'Selasa', 'jam_mulai' => '09:00', 'jam_selesai' => '13:00', 'kuota' => 12],
                    ['hari' => 'Kamis',  'jam_mulai' => '09:00', 'jam_selesai' => '13:00', 'kuota' => 12],
                    ['hari' => 'Sabtu',  'jam_mulai' => '08:00', 'jam_selesai' => '12:00', 'kuota' => 15],
                ],
            ],
            [
                'dokter' => [
                    'nama'             => 'dr. Rina Kusuma, Sp.OG',
                    'spesialisasi'     => 'Kandungan & Kebidanan',
                    'no_str'           => 'STR-2024-003',
                    'biaya_konsultasi' => 200000,
                    'bio'              => 'Spesialis kandungan dengan keahlian dalam kehamilan risiko tinggi, USG 4D, dan laparoskopi ginekologi.',
                ],
                'jadwals' => [
                    ['hari' => 'Senin',  'jam_mulai' => '13:00', 'jam_selesai' => '17:00', 'kuota' => 8],
                    ['hari' => 'Kamis',  'jam_mulai' => '13:00', 'jam_selesai' => '17:00', 'kuota' => 8],
                ],
            ],
            [
                'dokter' => [
                    'nama'             => 'dr. Ahmad Fauzi, Sp.JP',
                    'spesialisasi'     => 'Jantung & Pembuluh Darah',
                    'no_str'           => 'STR-2024-004',
                    'biaya_konsultasi' => 250000,
                    'bio'              => 'Kardiolog berpengalaman dalam penanganan penyakit jantung koroner, gagal jantung, dan aritmia.',
                ],
                'jadwals' => [
                    ['hari' => 'Selasa', 'jam_mulai' => '08:00', 'jam_selesai' => '12:00', 'kuota' => 8],
                    ['hari' => 'Jumat',  'jam_mulai' => '13:00', 'jam_selesai' => '16:00', 'kuota' => 6],
                ],
            ],
            [
                'dokter' => [
                    'nama'             => 'dr. Maya Indraswari',
                    'spesialisasi'     => 'Dokter Umum',
                    'no_str'           => 'STR-2024-005',
                    'biaya_konsultasi' => 75000,
                    'bio'              => 'Dokter umum untuk pemeriksaan rutin, surat keterangan sehat, dan penanganan keluhan umum.',
                ],
                'jadwals' => [
                    ['hari' => 'Senin',  'jam_mulai' => '07:00', 'jam_selesai' => '14:00', 'kuota' => 20],
                    ['hari' => 'Selasa', 'jam_mulai' => '07:00', 'jam_selesai' => '14:00', 'kuota' => 20],
                    ['hari' => 'Rabu',   'jam_mulai' => '07:00', 'jam_selesai' => '14:00', 'kuota' => 20],
                    ['hari' => 'Kamis',  'jam_mulai' => '07:00', 'jam_selesai' => '14:00', 'kuota' => 20],
                    ['hari' => 'Jumat',  'jam_mulai' => '07:00', 'jam_selesai' => '14:00', 'kuota' => 20],
                    ['hari' => 'Sabtu',  'jam_mulai' => '07:00', 'jam_selesai' => '12:00', 'kuota' => 15],
                ],
            ],
        ];

        foreach ($dokters as $item) {
            // updateOrCreate → aman dijalankan berkali-kali (idempotent)
            $dokter = Dokter::updateOrCreate(
                ['no_str' => $item['dokter']['no_str']],
                $item['dokter']
            );

            foreach ($item['jadwals'] as $jadwal) {
                Jadwal::updateOrCreate(
                    [
                        'dokter_id' => $dokter->id,
                        'hari'      => $jadwal['hari'],
                        'jam_mulai' => $jadwal['jam_mulai'],
                    ],
                    [
                        ...$jadwal,
                        'dokter_id' => $dokter->id,
                        'is_aktif'  => true,
                    ]
                );
            }

            $this->command->line("  ✓ {$dokter->nama} ({$dokter->spesialisasi}) — {$dokter->jadwals()->count()} jadwal");
        }
    }
}