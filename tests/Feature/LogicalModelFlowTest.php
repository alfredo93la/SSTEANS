<?php

use App\Models\Alumno;
use App\Models\Persona;
use App\Models\Role;
use App\Models\Tutor;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

test('tutor can fetch only assigned students', function () {
    $user = User::factory()->create([
        'role' => 'Tutor',
    ]);

    $personaTutor = Persona::query()->create([
        'tipo_persona' => 'TUTOR',
        'nombre' => 'Maria',
        'apellidos' => 'Lopez',
    ]);

    $user->update(['persona_id' => $personaTutor->id]);

    $tutor = Tutor::query()->create([
        'persona_id' => $personaTutor->id,
        'parentesco' => 'Madre',
    ]);

    $personaAlumno = Persona::query()->create([
        'tipo_persona' => 'ALUMNO',
        'nombre' => 'Juan',
        'apellidos' => 'Perez',
    ]);

    $alumno = Alumno::query()->create([
        'persona_id' => $personaAlumno->id,
        'estado' => 'Activo',
    ]);

    $tutor->alumnos()->attach($alumno->id, ['fecha_vinculacion' => '2026-03-01']);

    $response = $this->actingAs($user)->getJson(route('tutor.alumnos.asignados'));

    $response->assertOk();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.nombre', 'Juan Perez');
});

test('admin can update user roles from role management endpoint', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create([
        'role' => 'Administrador',
    ]);

    $targetUser = User::factory()->create([
        'role' => 'Tutor',
    ]);

    $role = Role::query()->where('nombre', 'Profesor')->firstOrFail();

    $response = $this->actingAs($admin)->putJson(route('admin.usuarios.roles.update', $targetUser), [
        'roles' => [$role->id],
    ]);

    $response->assertOk();
    $response->assertJsonPath('user.roles.0.nombre', 'Profesor');

    expect($targetUser->fresh()->roles()->pluck('nombre')->all())->toBe(['Profesor']);
});

test('admin can update role permissions from roles section endpoint', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create([
        'role' => 'Administrador',
    ]);

    $role = Role::query()->where('nombre', 'Tutor')->firstOrFail();
    $permisos = \App\Models\Permiso::query()->inRandomOrder()->limit(2)->pluck('id')->all();

    $response = $this->actingAs($admin)->putJson(route('admin.roles.update', $role), [
        'nombre' => 'Tutor',
        'descripcion' => 'Rol tutor actualizado',
        'permisos' => $permisos,
    ]);

    $response->assertOk();
    $response->assertJsonPath('role.descripcion', 'Rol tutor actualizado');
    $response->assertJsonCount(2, 'role.permisos');
});

test('admin can list and create users through admin usuarios endpoint', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create(['role' => 'Administrador']);
    $role = Role::query()->where('nombre', 'Tutor')->firstOrFail();

    $createResponse = $this->actingAs($admin)->postJson(route('admin.usuarios.store'), [
        'name' => 'Usuario Nuevo',
        'email' => 'nuevo@example.com',
        'password' => 'password123',
        'roles' => [$role->id],
        'status' => 'pending',
    ]);

    $createResponse->assertCreated();

    $listResponse = $this->actingAs($admin)->getJson(route('admin.usuarios.index'));
    $listResponse->assertOk();
    $listResponse->assertJsonFragment(['email' => 'nuevo@example.com']);
});

test('admin can approve and reject users through validar usuarios endpoint', function () {
    $admin = User::factory()->create(['role' => 'Administrador']);
    $pendingUser = User::factory()->create(['role' => 'Tutor', 'status' => 'pending']);

    $approve = $this->actingAs($admin)->postJson(route('admin.validar-usuarios.approve', $pendingUser));
    $approve->assertOk();
    expect($pendingUser->fresh()->status)->toBe('approved');

    $reject = $this->actingAs($admin)->postJson(route('admin.validar-usuarios.reject', $pendingUser), [
        'reason' => 'Falta documento oficial',
    ]);
    $reject->assertOk();
    expect($pendingUser->fresh()->status)->toBe('rejected');
    expect($pendingUser->fresh()->rejection_reason)->toBe('Falta documento oficial');
});

test('admin usuarios endpoint filters by role without breaking query logic', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create(['role' => 'Administrador']);
    User::factory()->create(['name' => 'Profe Uno', 'role' => 'Profesor']);
    User::factory()->create(['name' => 'Tutor Uno', 'role' => 'Tutor']);

    $response = $this->actingAs($admin)->getJson(route('admin.usuarios.index', ['role' => 'Profesor']));

    $response->assertOk();
    $response->assertJsonMissing(['name' => 'Tutor Uno']);
    $response->assertJsonFragment(['name' => 'Profe Uno']);
});
