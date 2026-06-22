<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function makeUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'role'     => 'pasien',
            'api_key'  => Str::random(40),
            'password' => bcrypt('password123'),
        ], $overrides));
    }

    private function jwtToken(User $user): string
    {
        return auth('api')->login($user);
    }

    // ── Register ─────────────────────────────────────────────────────────────

    public function test_register_berhasil(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'     => 'Budi Santoso',
            'email'    => 'budi@example.com',
            'password' => 'password123',
            'no_hp'    => '081234567890',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status', 'message', 'token', 'token_type', 'expires_in', 'api_key', 'data'
            ])
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.role', 'pasien');

        $this->assertDatabaseHas('users', ['email' => 'budi@example.com', 'role' => 'pasien']);
    }

    public function test_register_gagal_email_duplikat(): void
    {
        $this->makeUser(['email' => 'duplikat@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'name'     => 'User Lain',
            'email'    => 'duplikat@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_register_gagal_tanpa_name(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_register_gagal_password_terlalu_pendek(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'     => 'Test User',
            'email'    => 'test@example.com',
            'password' => '123',
        ]);

        $response->assertStatus(422);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function test_login_berhasil(): void
    {
        $user = $this->makeUser(['email' => 'pasien@example.com']);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'pasien@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'token', 'token_type', 'expires_in', 'api_key', 'data'])
            ->assertJsonPath('status', 'success');
    }

    public function test_login_gagal_password_salah(): void
    {
        $this->makeUser(['email' => 'test@example.com']);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'passwordsalah',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('status', 'error');
    }

    public function test_login_gagal_email_tidak_ada(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'tidakada@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    public function test_me_berhasil_dengan_token(): void
    {
        $user  = $this->makeUser();
        $token = $this->jwtToken($user);

        $response = $this->withToken($token)->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_me_gagal_tanpa_token(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public function test_logout_berhasil(): void
    {
        $user  = $this->makeUser();
        $token = $this->jwtToken($user);

        $response = $this->withToken($token)->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    public function test_refresh_token_berhasil(): void
    {
        $user  = $this->makeUser();
        $token = $this->jwtToken($user);

        $response = $this->withToken($token)->postJson('/api/auth/refresh');

        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'token', 'token_type', 'expires_in'])
            ->assertJsonPath('status', 'success');
    }
}
