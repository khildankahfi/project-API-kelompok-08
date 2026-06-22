<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dokter extends Model
{
    use HasFactory;
    protected $fillable = [
        'nama', 'spesialisasi', 'no_str', 'foto', 'bio', 'biaya_konsultasi'
    ];

    public function jadwals()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function reservasis()
    {
        return $this->hasMany(Reservasi::class);
    }

    public function rekamMedis()
    {
        return $this->hasMany(RekamMedis::class);
    }
}