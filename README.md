# SSTEANS

Sistema de seguimiento escolar para secundaria. Permite gestionar alumnos, calificaciones, asistencias, tareas, reportes de conducta, horarios y comunicación entre la escuela y tutores.

## Stack

- **Backend**: Laravel 12, PHP 8.2+, Inertia.js v2, Laravel Reverb (WebSockets), Laravel Sanctum
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, shadcn/ui (Radix UI), Vite 7
- **Tests**: Pest PHP v3
- **Code style**: Laravel Pint

## Requisitos

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL / MariaDB (o cualquier BD compatible con Laravel)

## Instalación

```bash
git clone <repo>
cd SSTEANS
composer setup
```

`composer setup` ejecuta: `composer install` → copia `.env` → genera app key → migra la BD → `npm install` → `npm run build`.

Configura tu base de datos en `.env` antes de ejecutar el setup.

## Desarrollo

```bash
composer dev
```

Levanta en paralelo: servidor PHP, queue listener, y Vite (hot reload).

## Roles del sistema

| Rol | Permisos principales |
|-----|----------------------|
| **Administrador** | Usuarios, roles, ciclos escolares, periodos, configuración, grupos, salones, materias |
| **Personal Administrativo** | Alumnos, tutores, grupos, horarios, circulares, agenda |
| **Profesor** | Calificaciones, asistencia, tareas, exámenes, notificaciones |
| **Trabajador Social** | Ver alumnos, reportes de conducta, notificaciones |
| **Tutor** | Ver calificaciones, asistencia, tareas, horario y reportes de sus hijos |

## Comandos útiles

```bash
composer test              # Ejecuta la suite de tests con Pest
./vendor/bin/pint          # Aplica el estilo de código PHP
php artisan migrate        # Corre las migraciones pendientes
php artisan db:seed        # Puebla grados, materias y roles base
npm run build              # Compila TypeScript + assets para producción
```
