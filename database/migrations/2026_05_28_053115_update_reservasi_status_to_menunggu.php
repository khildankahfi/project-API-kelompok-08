<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Update status reservasi:
 * - Rename 'pending' → 'menunggu'
 * - Hapus 'dikonfirmasi' (tidak dipakai di sistem antrian baru)
 *
 * Alur baru: menunggu → selesai | dibatalkan
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Ubah enum status sementara agar menerima semua nilai (lama & baru)
        Schema::table('reservasis', function (Blueprint $table) {
            $table->enum('status', ['pending', 'dikonfirmasi', 'menunggu', 'selesai', 'dibatalkan'])
                  ->default('pending')
                  ->change();
        });

        // 2. Update data existing
        DB::table('reservasis')
            ->where('status', 'pending')
            ->update(['status' => 'menunggu']);

        DB::table('reservasis')
            ->where('status', 'dikonfirmasi')
            ->update(['status' => 'menunggu']);

        // 3. Ubah enum status final (hanya nilai baru) & set default 'menunggu'
        Schema::table('reservasis', function (Blueprint $table) {
            $table->enum('status', ['menunggu', 'selesai', 'dibatalkan'])
                  ->default('menunggu')
                  ->change();
        });
    }

    public function down(): void
    {
        // 1. Kembalikan enum status sementara agar menerima nilai lama & baru
        Schema::table('reservasis', function (Blueprint $table) {
            $table->enum('status', ['pending', 'dikonfirmasi', 'menunggu', 'selesai', 'dibatalkan'])
                  ->default('menunggu')
                  ->change();
        });

        // 2. Kembalikan data
        DB::table('reservasis')
            ->where('status', 'menunggu')
            ->update(['status' => 'pending']);

        // 3. Kembalikan enum status final lama
        Schema::table('reservasis', function (Blueprint $table) {
            $table->enum('status', ['pending', 'dikonfirmasi', 'selesai', 'dibatalkan'])
                  ->default('pending')
                  ->change();
        });
    }
};