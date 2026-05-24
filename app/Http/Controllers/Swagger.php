<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Klinik Sehat API",
 *     version="1.0.0",
 *     description="REST API untuk aplikasi manajemen klinik. Mencakup manajemen dokter, jadwal, reservasi pasien, dan rekam medis.",
 *     @OA\Contact(
 *         email="admin@klinik.com",
 *         name="Klinik Sehat Dev Team"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://127.0.0.1:8000/api",
 *     description="Local Development Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Masukkan JWT token dari response login. Format: Bearer {token}"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="apiKeyAuth",
 *     type="apiKey",
 *     in="header",
 *     name="X-API-KEY",
 *     description="API Key dari response login/register. Wajib untuk endpoint admin."
 * )
 *
 * @OA\Tag(name="Auth",        description="Autentikasi & manajemen token JWT")
 * @OA\Tag(name="Dokter",      description="Data dokter — GET public, CUD admin only")
 * @OA\Tag(name="Jadwal",      description="Jadwal praktik — GET public, CUD admin only")
 * @OA\Tag(name="Reservasi",   description="Reservasi pasien — JWT required")
 * @OA\Tag(name="Admin",       description="Endpoint khusus admin — JWT + API Key + role admin")
 * @OA\Tag(name="Rekam Medis", description="Rekam medis — admin only")
 */
class Swagger
{
}
