<?php

namespace Tests\Feature;

use App\Models\Dokter;
use App\Models\Jadwal;
use App\Models\Reservasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReservasiTest extends TestCase
{
    use RefreshDatabase;

    // ─── HARI_MAP sama dengan yang ada di ReservasiController ───────────────
    private const HARI_MAP = [
        'Minggu' => 0, 'Senin' => 1, 'Selasa' => 2,
        'Rabu'   => 3, 'Kamis' => 4, 'Jumat'  => 5, 'Sabtu' => 6,
    ];

    private function pasienUser(): User
    {
        return User::factory()->create([
            'role'     => 'pasien',
            'api_key'  => Str::random(40),
            'password' => bcrypt('password'),
        ]);
    }

    private function adminUser(): User
    {
        return User::factory()->create([
            'role'     => 'admin',
            'api_key'  => Str::random(40),
            'password' => bcrypt('admin123'),
        ]);
    }

    /**
     * Buat jadwal untuk hari tertentu dan kembalikan tanggal berikutnya
     * yang cocok dengan hari tersebut.
     */
    private function jadwalDanTanggal(string $hari = 'Senin'): array
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

        return compact('dokter', 'jadwal', 'tanggal');
    }

    // ── Index (pasien lihat reservasinya sendiri) ─────────────────────────────

    public function test_pasien_bisa_lihat_reservasi_sendiri(): void
    {
        $pasien  = $this->pasienUser();
        $token   = auth('api')->login($pasien);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal();

        Reservasi::factory()->create([
            'user_id'           => $pasien->id,
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'nomor_antrian'     => '260101-J1-01',
            'status'            => 'menunggu',
        ]);

        $response = $this->withToken($token)->getJson('/api/reservasis');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);

        $this->assertCount(1, $response->json('data'));
    }

    public function test_pasien_tidak_bisa_lihat_reservasi_orang_lain(): void
    {
        $pasien1 = $this->pasienUser();
        $pasien2 = $this->pasienUser();
        $token1  = auth('api')->login($pasien1);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal();

        // Buat reservasi untuk pasien2
        Reservasi::factory()->create([
            'user_id'           => $pasien2->id,
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'nomor_antrian'     => '260101-J1-01',
            'status'            => 'menunggu',
        ]);

        // Pasien1 harus melihat list kosong (bukan milik pasien2)
        $response = $this->withToken($token1)->getJson('/api/reservasis');
        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    // ── Store (buat reservasi baru) ────────────────────────────────────────────

    public function test_pasien_bisa_buat_reservasi_valid(): void
    {
        $pasien  = $this->pasienUser();
        $token   = auth('api')->login($pasien);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal('Senin');

        $response = $this->withToken($token)->postJson('/api/reservasis', [
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'keluhan'           => 'Saya mengalami demam dan sakit kepala selama 3 hari.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['data', 'info' => ['nomor_antrian', 'urutan', 'dari_total']]);

        $this->assertDatabaseHas('reservasis', [
            'user_id'   => $pasien->id,
            'dokter_id' => $dokter->id,
            'status'    => 'menunggu',
        ]);
    }

    public function test_buat_reservasi_gagal_hari_tidak_sesuai(): void
    {
        $pasien  = $this->pasienUser();
        $token   = auth('api')->login($pasien);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggalSenin] = $this->jadwalDanTanggal('Senin');

        // Jadwal Senin, tapi kita kirim tanggal Selasa
        $targetDow  = self::HARI_MAP['Selasa'];
        $today      = now();
        $daysAhead  = ($targetDow - $today->dayOfWeek + 7) % 7 ?: 7;
        $tanggalSelasa = $today->copy()->addDays($daysAhead)->toDateString();

        $response = $this->withToken($token)->postJson('/api/reservasis', [
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggalSelasa,
            'keluhan'           => 'Saya mengalami sakit perut yang cukup parah.',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }

    public function test_buat_reservasi_gagal_kuota_penuh(): void
    {
        $pasien  = $this->pasienUser();
        $token   = auth('api')->login($pasien);

        // Jadwal dengan kuota 1
        $dokter = Dokter::factory()->create();
        $jadwal = Jadwal::factory()->create([
            'dokter_id' => $dokter->id,
            'hari'      => 'Senin',
            'kuota'     => 1,
            'is_aktif'  => true,
        ]);
        $targetDow = self::HARI_MAP['Senin'];
        $today     = now();
        $daysAhead = ($targetDow - $today->dayOfWeek + 7) % 7 ?: 7;
        $tanggal   = $today->copy()->addDays($daysAhead)->toDateString();

        // Isi kuota dengan reservasi lain
        Reservasi::factory()->create([
            'user_id'           => $this->pasienUser()->id,
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'nomor_antrian'     => '260101-J99-01',
            'status'            => 'menunggu',
        ]);

        $response = $this->withToken($token)->postJson('/api/reservasis', [
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'keluhan'           => 'Ini adalah keluhan panjang yang minimal 10 karakter.',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }

    public function test_buat_reservasi_gagal_keluhan_terlalu_pendek(): void
    {
        $pasien  = $this->pasienUser();
        $token   = auth('api')->login($pasien);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal('Senin');

        $response = $this->withToken($token)->postJson('/api/reservasis', [
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'keluhan'           => 'Sakit',  // < 10 karakter
        ]);

        $response->assertStatus(422);
    }

    // ── Update / Cancel (pasien batalkan) ─────────────────────────────────────

    public function test_pasien_bisa_batalkan_reservasi_menunggu(): void
    {
        $pasien  = $this->pasienUser();
        $token   = auth('api')->login($pasien);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal();

        $reservasi = Reservasi::factory()->create([
            'user_id'           => $pasien->id,
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'nomor_antrian'     => '260101-J1-01',
            'status'            => 'menunggu',
        ]);

        $response = $this->withToken($token)->putJson("/api/reservasis/{$reservasi->id}", [
            'status' => 'dibatalkan',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('reservasis', ['id' => $reservasi->id, 'status' => 'dibatalkan']);
    }

    public function test_pasien_tidak_bisa_batalkan_reservasi_selesai(): void
    {
        $pasien  = $this->pasienUser();
        $token   = auth('api')->login($pasien);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal();

        $reservasi = Reservasi::factory()->create([
            'user_id'           => $pasien->id,
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'nomor_antrian'     => '260101-J1-01',
            'status'            => 'selesai',
        ]);

        $response = $this->withToken($token)->putJson("/api/reservasis/{$reservasi->id}", [
            'status' => 'dibatalkan',
        ]);

        $response->assertStatus(422);
    }

    // ── Admin Index ─────────────────────────────────────────────────────────────

    public function test_admin_bisa_lihat_semua_reservasi(): void
    {
        $admin   = $this->adminUser();
        $token   = auth('api')->login($admin);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal();

        Reservasi::factory()->count(3)->create([
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
        ]);

        $response = $this->withToken($token)
            ->withHeaders(['X-API-KEY' => $admin->api_key])
            ->getJson('/api/admin/reservasis');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);

        $this->assertGreaterThanOrEqual(3, count($response->json('data')));
    }

    // ── Admin Update Status ───────────────────────────────────────────────────

    public function test_admin_bisa_update_status_reservasi(): void
    {
        $admin   = $this->adminUser();
        $token   = auth('api')->login($admin);
        ['dokter' => $dokter, 'jadwal' => $jadwal, 'tanggal' => $tanggal] = $this->jadwalDanTanggal();

        $reservasi = Reservasi::factory()->create([
            'dokter_id'         => $dokter->id,
            'jadwal_id'         => $jadwal->id,
            'tanggal_reservasi' => $tanggal,
            'status'            => 'menunggu',
        ]);

        $response = $this->withToken($token)
            ->withHeaders(['X-API-KEY' => $admin->api_key])
            ->patchJson("/api/admin/reservasis/{$reservasi->id}/status", [
                'status' => 'selesai',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('reservasis', ['id' => $reservasi->id, 'status' => 'selesai']);
    }

    // ── Unauthenticated ──────────────────────────────────────────────────────

    public function test_reservasi_tanpa_auth_return_401(): void
    {
        $this->getJson('/api/reservasis')->assertStatus(401);
        $this->postJson('/api/reservasis', [])->assertStatus(401);
    }
}
