<?php

namespace Tests\Feature;

use App\Models\Dokter;
use App\Models\Jadwal;
use App\Models\RekamMedis;
use App\Models\Reservasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class RekamMedisTest extends TestCase
{
    use RefreshDatabase;

    private const HARI_MAP = [
        'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3,
        'Kamis' => 4, 'Jumat'  => 5, 'Sabtu' => 6,
    ];

    private function adminUser(): User
    {
        return User::factory()->create([
            'role'     => 'admin',
            'api_key'  => Str::random(40),
            'password' => bcrypt('admin123'),
        ]);
    }

    private function pasienUser(): User
    {
        return User::factory()->create([
            'role'    => 'pasien',
            'api_key' => Str::random(40),
            'password' => bcrypt('password'),
        ]);
    }

    private function adminHeaders(User $admin): array
    {
        $token = auth('api')->login($admin);
        return [
            'Authorization' => "Bearer {$token}",
            'X-API-KEY'     => $admin->api_key,
        ];
    }

    /** Buat reservasi dengan status menunggu */
    private function buatReservasi(User $pasien, string $hari = 'Senin'): Reservasi
    {
        $dokter = Dokter::factory()->create();
        $jadwal = Jadwal::factory()->create([
            'dokter_id' => $dokter->id,
            'hari'      => $hari,
            'kuota'     => 10,
            'is_aktif'  => true,
        ]);

        $targetDow = self::HARI_MAP[$hari];
        $today     = now();
        $daysAhead = ($targetDow - $today->dayOfWeek + 7) % 7 ?: 7;
        $tanggal   = $today->copy()->addDays($daysAhead)->toDateString();

        return Reservasi::factory()->create([
            'user_id'           => $pasien->id,
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'nomor_antrian'     => '260101-J1-01',
            'status'            => 'menunggu',
        ]);
    }

    // ── Index (admin only) ────────────────────────────────────────────────────

    public function test_admin_bisa_lihat_semua_rekam_medis(): void
    {
        $admin    = $this->adminUser();
        $pasien   = $this->pasienUser();
        $headers  = $this->adminHeaders($admin);
        $reservasi = $this->buatReservasi($pasien);

        RekamMedis::create([
            'reservasi_id'    => $reservasi->id,
            'user_id'         => $pasien->id,
            'dokter_id'       => $reservasi->dokter_id,
            'tanggal_periksa' => now()->toDateString(),
            'diagnosis'       => 'Infeksi Saluran Pernapasan Atas',
            'resep_obat'      => 'Paracetamol 500mg 3x1',
            'catatan_dokter'  => 'Istirahat 3 hari.',
        ]);

        $response = $this->withHeaders($headers)->getJson('/api/rekam-medis');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);

        $this->assertCount(1, $response->json('data'));
    }

    public function test_pasien_tidak_bisa_akses_rekam_medis_admin(): void
    {
        $pasien = $this->pasienUser();
        $token  = auth('api')->login($pasien);

        $this->withToken($token)->withHeaders(['X-API-KEY' => $pasien->api_key])->getJson('/api/rekam-medis')->assertStatus(403);
    }

    // ── Store (admin only) ────────────────────────────────────────────────────

    public function test_admin_bisa_buat_rekam_medis(): void
    {
        $admin     = $this->adminUser();
        $pasien    = $this->pasienUser();
        $headers   = $this->adminHeaders($admin);
        $reservasi = $this->buatReservasi($pasien);

        $response = $this->withHeaders($headers)->postJson('/api/rekam-medis', [
            'reservasi_id'    => $reservasi->id,
            'tanggal_periksa' => now()->toDateString(),
            'diagnosis'       => 'Infeksi Saluran Pernapasan Atas (ISPA)',
            'resep_obat'      => 'Paracetamol 500mg 3x1, Vitamin C 1x1',
            'catatan_dokter'  => 'Istirahat total selama 3 hari.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success');

        // Status reservasi harus otomatis berubah ke selesai
        $this->assertDatabaseHas('reservasis', [
            'id'     => $reservasi->id,
            'status' => 'selesai',
        ]);

        $this->assertDatabaseHas('rekam_medis', [
            'reservasi_id' => $reservasi->id,
            'user_id'      => $pasien->id,
        ]);
    }

    public function test_rekam_medis_validasi_diagnosis_wajib(): void
    {
        $admin     = $this->adminUser();
        $pasien    = $this->pasienUser();
        $headers   = $this->adminHeaders($admin);
        $reservasi = $this->buatReservasi($pasien);

        $response = $this->withHeaders($headers)->postJson('/api/rekam-medis', [
            'reservasi_id'    => $reservasi->id,
            'tanggal_periksa' => now()->toDateString(),
            // diagnosis tidak diisi
            'resep_obat'      => 'Paracetamol 500mg',
        ]);

        $response->assertStatus(422);
    }

    public function test_tidak_bisa_buat_rekam_medis_duplikat_satu_reservasi(): void
    {
        $admin     = $this->adminUser();
        $pasien    = $this->pasienUser();
        $headers   = $this->adminHeaders($admin);
        $reservasi = $this->buatReservasi($pasien);

        // Buat pertama
        $this->withHeaders($headers)->postJson('/api/rekam-medis', [
            'reservasi_id'    => $reservasi->id,
            'tanggal_periksa' => now()->toDateString(),
            'diagnosis'       => 'Demam berdarah dengue stadium 1',
            'resep_obat'      => 'Paracetamol 500mg 3x1',
        ])->assertStatus(201);

        // Buat kedua dengan reservasi yang sama — harus gagal
        $response = $this->withHeaders($headers)->postJson('/api/rekam-medis', [
            'reservasi_id'    => $reservasi->id,
            'tanggal_periksa' => now()->toDateString(),
            'diagnosis'       => 'Diagnosis duplikat percobaan',
            'resep_obat'      => 'Resep duplikat percobaan',
        ]);

        $response->assertStatus(422);
    }

    // ── Update (admin only) ───────────────────────────────────────────────────

    public function test_admin_bisa_update_rekam_medis(): void
    {
        $admin     = $this->adminUser();
        $pasien    = $this->pasienUser();
        $headers   = $this->adminHeaders($admin);
        $reservasi = $this->buatReservasi($pasien);

        $rm = RekamMedis::create([
            'reservasi_id'    => $reservasi->id,
            'user_id'         => $pasien->id,
            'dokter_id'       => $reservasi->dokter_id,
            'tanggal_periksa' => now()->toDateString(),
            'diagnosis'       => 'Diagnosis Awal',
            'resep_obat'      => 'Resep Awal',
        ]);

        $response = $this->withHeaders($headers)->putJson("/api/rekam-medis/{$rm->id}", [
            'diagnosis'  => 'Diagnosis Diperbarui setelah evaluasi lanjutan',
            'resep_obat' => 'Amoxicillin 500mg 3x1',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('rekam_medis', [
            'id'        => $rm->id,
            'diagnosis' => 'Diagnosis Diperbarui setelah evaluasi lanjutan',
        ]);
    }

    // ── Delete (admin only) ───────────────────────────────────────────────────

    public function test_admin_bisa_hapus_rekam_medis(): void
    {
        $admin     = $this->adminUser();
        $pasien    = $this->pasienUser();
        $headers   = $this->adminHeaders($admin);
        $reservasi = $this->buatReservasi($pasien);

        $rm = RekamMedis::create([
            'reservasi_id'    => $reservasi->id,
            'user_id'         => $pasien->id,
            'dokter_id'       => $reservasi->dokter_id,
            'tanggal_periksa' => now()->toDateString(),
            'diagnosis'       => 'Diagnosis yang akan dihapus',
            'resep_obat'      => 'Resep yang akan dihapus',
        ]);

        $this->withHeaders($headers)->deleteJson("/api/rekam-medis/{$rm->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('rekam_medis', ['id' => $rm->id]);
    }

    public function test_pasien_tidak_bisa_hapus_rekam_medis(): void
    {
        $admin     = $this->adminUser();
        $pasien    = $this->pasienUser();
        $pasienTok = auth('api')->login($pasien);
        $reservasi = $this->buatReservasi($pasien);

        $rm = RekamMedis::create([
            'reservasi_id'    => $reservasi->id,
            'user_id'         => $pasien->id,
            'dokter_id'       => $reservasi->dokter_id,
            'tanggal_periksa' => now()->toDateString(),
            'diagnosis'       => 'Diagnosis Test',
            'resep_obat'      => 'Resep Test',
        ]);

        $this->withToken($pasienTok)->withHeaders(['X-API-KEY' => $pasien->api_key])->deleteJson("/api/rekam-medis/{$rm->id}")
            ->assertStatus(403);
    }
}
