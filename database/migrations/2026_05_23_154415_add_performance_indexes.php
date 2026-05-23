<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah index pada kolom yang sering dipakai di WHERE / ORDER BY.
 *
 * Tanpa index → Laravel full-scan tiap query (lambat meski data sedikit).
 * foreignId() sudah otomatis bikin index, tapi kolom biasa tidak.
 */
return new class extends Migration
{
    public function up(): void
    {
        // jadwals: filter by is_aktif sering dipakai
        Schema::table('jadwals', function (Blueprint $table) {
            $table->index('is_aktif', 'idx_jadwals_is_aktif');
        });

        // reservasis: filter by status & order by tanggal
        Schema::table('reservasis', function (Blueprint $table) {
            $table->index('status',            'idx_reservasis_status');
            $table->index('tanggal_reservasi', 'idx_reservasis_tanggal');
        });

        // rekam_medis: order by tanggal_periksa
        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->index('tanggal_periksa', 'idx_rekam_medis_tanggal');
        });

        // users: lookup by api_key (dipakai ApiKeyMiddleware setiap request admin)
        Schema::table('users', function (Blueprint $table) {
            $table->index('api_key', 'idx_users_api_key');
        });
    }

    public function down(): void
    {
        Schema::table('jadwals',    fn($t) => $t->dropIndex('idx_jadwals_is_aktif'));
        Schema::table('reservasis', fn($t) => $t->dropIndex('idx_reservasis_status'));
        Schema::table('reservasis', fn($t) => $t->dropIndex('idx_reservasis_tanggal'));
        Schema::table('rekam_medis',fn($t) => $t->dropIndex('idx_rekam_medis_tanggal'));
        Schema::table('users',      fn($t) => $t->dropIndex('idx_users_api_key'));
    }
};