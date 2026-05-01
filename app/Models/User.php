<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'persona_id',
        'name',
        'email',
        'password',
        'role',
        'status',
        'rejection_reason',
        'validated_by',
        'validated_at',
        'must_change_password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'password'             => 'hashed',
            'validated_at'         => 'datetime',
            'must_change_password' => 'boolean',
        ];
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class);
    }

    public function tutorProfile(): BelongsTo
    {
        return $this->belongsTo(Tutor::class, 'persona_id', 'persona_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'profesor_user_id');
    }

    /**
     * @return array<int, string>
     */
    public function permissions(): array
    {
        $dynamicPermissions = $this->roles()
            ->with('permisos:id,nombre')
            ->get()
            ->flatMap(fn (Role $role) => $role->permisos->pluck('nombre'))
            ->all();

        $configPermissions = config('permissions.roles', [])[$this->role] ?? [];

        return array_values(array_unique(array_merge($dynamicPermissions, $configPermissions)));
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
