<?php

use App\Models\Circular;
use App\Models\Evento;
use App\Models\User;

test('agenda endpoints enforce permissions and return persisted event payload', function () {
    $viewer = User::factory()->create(['role' => 'Tutor']);
    $manager = User::factory()->create(['role' => 'Profesor']);

    $forbidden = $this->actingAs($viewer)->postJson(route('agenda.eventos.store'), [
        'titulo' => 'Evento sin permiso',
        'fecha' => '2026-03-25',
        'tipo' => 'Junta',
    ]);

    $forbidden->assertForbidden();

    $create = $this->actingAs($manager)->postJson(route('agenda.eventos.store'), [
        'titulo' => 'Reunión docente',
        'descripcion' => 'Planeación semanal',
        'fecha' => '2026-03-25',
        'hora_inicio' => '10:00',
        'hora_fin' => '11:30',
        'tipo' => 'Junta',
        'grupo' => 'General',
        'materia' => '-',
    ]);

    $create->assertCreated();
    $create->assertJsonPath('data.titulo', 'Reunión docente');
    $create->assertJsonPath('data.hora_inicio', '10:00');

    $list = $this->actingAs($viewer)->getJson(route('agenda.eventos.index'));

    $list->assertOk();
    $list->assertJsonPath('data.0.titulo', 'Reunión docente');

    expect(Evento::query()->count())->toBe(1);
});

test('circulares endpoints persist and refresh destinatarios payload', function () {
    $viewer = User::factory()->create(['role' => 'Tutor']);
    $publisher = User::factory()->create(['role' => 'Personal Administrativo']);

    $store = $this->actingAs($publisher)->postJson(route('circulares.store'), [
        'titulo' => 'Circular informativa',
        'descripcion' => 'Resumen de avisos',
        'contenido' => 'Contenido completo de la circular',
        'categoria' => 'General',
        'prioridad' => 'Alta',
        'destinatarios' => ['Tutor', 'Profesor'],
    ]);

    $store->assertCreated();
    $store->assertJsonPath('data.destinatarios.0', 'Tutor');

    $circular = Circular::query()->firstOrFail();

    $update = $this->actingAs($publisher)->putJson(route('circulares.update', $circular), [
        'titulo' => 'Circular actualizada',
        'descripcion' => 'Resumen actualizado',
        'contenido' => 'Contenido actualizado',
        'categoria' => 'Académico',
        'prioridad' => 'Media',
        'destinatarios' => ['Tutor', 'Trabajador Social'],
    ]);

    $update->assertOk();
    $update->assertJsonPath('data.titulo', 'Circular actualizada');
    $update->assertJsonPath('data.destinatarios.1', 'Trabajador Social');

    $list = $this->actingAs($viewer)->getJson(route('circulares.index'));
    $list->assertOk();
    $list->assertJsonPath('data.0.titulo', 'Circular actualizada');

    expect($circular->fresh()->destinatarios()->pluck('rol')->all())
        ->toBe(['Tutor', 'Trabajador Social']);
});
