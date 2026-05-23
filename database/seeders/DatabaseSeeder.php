<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account 
        User::updateOrCreate(
            ['email' => 'admin@klinik.com'],
            [
                'name'     => 'Administrator',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
                'no_hp'    => '08100000000',
                'api_key'  => Str::random(40),
            ]
        );

        // Demo pasien 
        $pasiens = [
            ['name' => 'Budi Santoso',  'email' => 'budi@example.com'],
            ['name' => 'Siti Rahayu',   'email' => 'siti@example.com'],
        ];

        foreach ($pasiens as $p) {
            User::updateOrCreate(
                ['email' => $p['email']],
                [
                    'name'     => $p['name'],
                    'password' => Hash::make('password'),
                    'role'     => 'pasien',
                    'no_hp'    => '0812' . rand(10000000, 99999999),
                    'api_key'  => Str::random(40),
                ]
            );
        }

        // Seeder lainnya
        $this->call([
            DokterSeeder::class,
        ]);

        $this->command->info('✅ Seeder selesai.');
        $this->command->info('   Admin   → admin@klinik.com  / admin123');
        $this->command->info('   Pasien  → budi@example.com  / password');
    }
}
