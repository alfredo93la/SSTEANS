<?php

use App\Models\ConfiguracionEscuela;

test('registration screen can be rendered', function () {
    ConfiguracionEscuela::create(['nombre' => 'Escuela Test', 'registro_tutores_activo' => true]);

    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register as tutor', function () {
    ConfiguracionEscuela::create(['nombre' => 'Escuela Test', 'registro_tutores_activo' => true]);

    $response = $this->post('/register', [
        'nombre'    => 'Test',
        'apellidos' => 'Usuario',
        'email'     => 'test@example.com',
        'curp'      => 'TEST900101HMCXXX01',
        'hijos'     => [
            [
                'nombre'           => 'Hijo',
                'apellidos'        => 'Prueba',
                'curp'             => 'HIJO010101HCLRXX01',
                'fecha_nacimiento' => '2012-01-01',
                'sexo'             => 'Masculino',
                'parentesco'       => 'Madre',
            ],
        ],
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('login'));
});
