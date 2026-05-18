<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DokterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $dokters = [
        ['nama'=>'dr. Andi Pratama', 
        'spesialisasi'=>'Umum', 
        'no_str'=>'STR001', 
        'biaya_konsultasi'=>150000],

        ['nama'=>'dr. Siti Rahayu', 
        'spesialisasi'=>'Anak', 
        'no_str'=>'STR002', 
        'biaya_konsultasi'=>200000],

        ['nama'=>'dr. Budi Santoso', 
        'spesialisasi'=>'Jantung', 
        'no_str'=>'STR003', 
        'biaya_konsultasi'=>350000],
    ];

        foreach ($dokters as $d) {
            \App\Models\Dokter::create($d);
    }
}
}
