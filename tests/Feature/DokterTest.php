<?php

namespace Tests\Feature;

use App\Models\Dokter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DokterTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create([
            'role'    => 'admin',
            'api_key' => Str::random(40),
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

    // ── Public Read ────────────────────────────────────────────────────────────

    public function test_index_dokter_bisa_diakses_publik(): void
    {
        Dokter::factory()->count(3)->create();

        $response = $this->getJson('/api/dokters');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_show_dokter_bisa_diakses_publik(): void
    {
        $dokter = Dokter::factory()->create();

        $response = $this->getJson("/api/dokters/{$dokter->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $dokter->id)
            ->assertJsonPath('data.nama', $dokter->nama);
    }

    public function test_show_dokter_tidak_ada_return_404(): void
    {
        $this->getJson('/api/dokters/9999')->assertStatus(404);
    }

    // ── Admin Write ────────────────────────────────────────────────────────────

    public function test_admin_bisa_tambah_dokter(): void
    {
        $admin   = $this->adminUser();
        $headers = $this->adminHeaders($admin);

        $response = $this->withHeaders($headers)->postJson('/api/dokters', [
            'nama'             => 'dr. Test Baru, Sp.A',
            'spesialisasi'     => 'Anak',
            'no_str'           => 'STR-2024-0001',
            'biaya_konsultasi' => 150000,
            'bio'              => 'Dokter spesialis anak berpengalaman 10 tahun.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.nama', 'dr. Test Baru, Sp.A');

        $this->assertDatabaseHas('dokters', ['nama' => 'dr. Test Baru, Sp.A']);
    }

    public function test_admin_bisa_edit_dokter(): void
    {
        $admin   = $this->adminUser();
        $dokter  = Dokter::factory()->create();
        $headers = $this->adminHeaders($admin);

        $response = $this->withHeaders($headers)->putJson("/api/dokters/{$dokter->id}", [
            'nama'             => 'dr. Nama Diperbarui, Sp.B',
            'spesialisasi'     => $dokter->spesialisasi,
            'no_str'           => $dokter->no_str,
            'biaya_konsultasi' => 200000,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.nama', 'dr. Nama Diperbarui, Sp.B');
    }

    public function test_admin_bisa_hapus_dokter(): void
    {
        $admin   = $this->adminUser();
        $dokter  = Dokter::factory()->create();
        $headers = $this->adminHeaders($admin);

        $this->withHeaders($headers)->deleteJson("/api/dokters/{$dokter->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('dokters', ['id' => $dokter->id]);
    }

    public function test_pasien_tidak_bisa_tambah_dokter(): void
    {
        $pasien = $this->pasienUser();
        $token  = auth('api')->login($pasien);

        $this->withToken($token)->postJson('/api/dokters', [
            'nama'             => 'dr. Tidak Boleh',
            'spesialisasi'     => 'Umum',
            'no_str'           => 'STR-0000',
            'biaya_konsultasi' => 50000,
        ])->assertStatus(403);
    }

    public function test_tambah_dokter_tanpa_auth_return_401(): void
    {
        $this->postJson('/api/dokters', [
            'nama'             => 'dr. Tanpa Auth',
            'spesialisasi'     => 'Umum',
            'no_str'           => 'STR-0001',
            'biaya_konsultasi' => 50000,
        ])->assertStatus(401);
    }

    public function test_tambah_dokter_validasi_nama_wajib(): void
    {
        $admin   = $this->adminUser();
        $headers = $this->adminHeaders($admin);

        $this->withHeaders($headers)->postJson('/api/dokters', [
            'spesialisasi'     => 'Umum',
            'no_str'           => 'STR-0001',
            'biaya_konsultasi' => 50000,
        ])->assertStatus(422);
    }
}
