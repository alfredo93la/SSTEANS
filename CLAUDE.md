# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Full dev environment (Laravel + queue + Vite concurrently)
composer dev

# Frontend only
npm run dev

# Build (runs tsc then vite build)
npm run build

# Run tests
composer test
# or
php artisan test

# Single test file
php artisan test tests/Feature/ExampleTest.php

# PHP code style
./vendor/bin/pint

# Migrations and seeding
php artisan migrate
php artisan db:seed   # seeds GradosYMaterias + RolesAndPermissions

# First-time setup
composer setup
```

## Architecture

### SPA with Hash Routing

The entire application is served as a single Inertia page at `/` (rendered by `resources/views/app.blade.php`). All navigation is hash-based (`#/dashboard`, `#/alumnos`, etc.) handled inside `resources/js/Pages/App.tsx`. **There are no separate Inertia page routes beyond `/`** — the Laravel routes are purely API endpoints returning JSON.

`App.tsx` acts as the top-level router: it reads `window.location.hash`, checks permissions via `canAccessRoute()`, and conditionally renders the matching page component. The same hash route can render different components depending on the user's permissions (e.g., `#/calificaciones` renders `CalificacionesTutor` for tutors and `RegistroCalificaciones` for professors).

### Permission System (Two Layers)

Permissions are merged from two sources in `User::permissions()`:

1. **Static config** (`config/permissions.php`) — role → permissions map for the five built-in roles: `Tutor`, `Profesor`, `Trabajador Social`, `Administrador`, `Personal Administrativo`.
2. **Dynamic DB roles** — additional `roles` and `permisos` tables for custom roles assignable per user.

On the frontend, `resources/js/data/auth.ts` builds the `ROUTE_PERMISSIONS` map automatically from `allMenuItems` in `Sidebar.tsx` — adding a menu item with a permission is sufficient to protect that route. The shared Inertia props (`HandleInertiaRequests`) inject the full permission array into every page load.

Backend routes use the `permission:` middleware (e.g., `permission:alumnos.manage`), which supports pipe-separated OR logic (`permission:grupos.manage|horarios.manage`).

### Data Model: Persona as Central Entity

`Persona` is the shared identity record. All person types extend it via a `persona_id` foreign key:

- `Alumno` (student) — linked to `Persona`, belongs to many `Tutor`s via `tutor_alumno` pivot (with `parentesco` field)
- `Tutor` (parent/guardian) — linked to `Persona`, belongs to many `Alumno`s
- `Profesor` (teacher) — linked to `Persona`, owns `Clase` records as `profesor_user_id`
- `TrabSocial` (social worker) — linked to `Persona`
- `PersAdmin` (admin staff) — linked to `Persona`
- `User` — linked to `Persona` via `persona_id`; also links to `Tutor` profile via `tutorProfile()` relationship

### Academic Structure

- `CicloEscolar` — school year; exactly one is `activo = true` at a time; others can be `archivado`
- `Grado` + `Materia` — static curriculum structure (seeded by `GradosYMateriasSeeder`)
- `Grupo` — a class group (e.g., "2°B") belonging to a `Grado`
- `Salon` — physical classroom
- `Clase` — the scheduling unit: `CicloEscolar` + `Grupo` + `Materia` + `Profesor` (User) + `Salon` + day/time
- `AsignacionGrupo` — assigns an `Alumno` to a `Grupo` within a `CicloEscolar`
- `PeriodoEvaluacion` — grading period within a cycle; has a `captura_activa` flag

### Shared Inertia Props

`HandleInertiaRequests` injects into every page:
- `auth.user` — full user object with nested `persona`, `tutor_profile`, `profesor_profile`, `trab_social_profile`, `pers_admin_profile`, and `permissions[]`
- `escuela` — school configuration (name, logo, `registro_tutores_activo` toggle)
- `cicloActivo` — the currently active school year (or `null`)

The TypeScript shape is in `resources/js/types/index.d.ts`.

### Frontend Structure

- `resources/js/Pages/` — pages organized by role (`Admin/`, `Administrativo/`, `Profesor/`, `Tutor/`, `TrabSocial/`, `Auth/`, `Dashboards/`)
- `resources/js/Components/ui/` — shadcn/ui components (Radix UI + Tailwind), do not edit these manually
- `resources/js/Layouts/` — `ResponsiveLayout.tsx` (shell) and `Sidebar.tsx` (navigation + permission filtering)
- `resources/js/data/mockData.ts` — centralized mock data still active in many components; real API calls are an ongoing migration

### Mock Data Status

Several page components still import from `resources/js/data/mockData.ts` instead of calling the backend. When adding features, check whether the component uses mock data and wire up the real API endpoint if needed.

### Real-time (Reverb)

Laravel Reverb is installed for WebSocket support (`laravel/reverb`). The queue listener runs alongside the dev server (`composer dev`).

### Tutor Registration Flow

When `registro_tutores_activo` is enabled (configurable via Admin), new tutors can self-register. Their accounts start in a pending `status` and must be approved via `Admin/ValidacionUsuarios`. The flag is exposed in the shared `escuela` prop and checked in `Login.tsx` to show/hide the registration link.
