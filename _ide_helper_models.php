<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $fecha
 * @property string|null $fecha_fin
 * @property string $titulo
 * @property string|null $descripcion
 * @property string|null $hora_inicio
 * @property string|null $hora_fin
 * @property string $tipo
 * @property int|null $grupo_id
 * @property int|null $materia_id
 * @property int|null $circular_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int|null $creado_por_id
 * @property-read \App\Models\Circular|null $circular
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AgendaEventoDestinatario> $destinatarios
 * @property-read int|null $destinatarios_count
 * @property-read \App\Models\Grupo|null $grupo
 * @property-read \App\Models\Materia|null $materia
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereCircularId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereCreadoPorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereFecha($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereFechaFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereGrupoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereHoraFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereHoraInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereMateriaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereTipo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereTitulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEvento whereUpdatedAt($value)
 */
	class AgendaEvento extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $agenda_evento_id
 * @property string $rol
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\AgendaEvento $evento
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario whereAgendaEventoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario whereRol($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AgendaEventoDestinatario whereUpdatedAt($value)
 */
	class AgendaEventoDestinatario extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $persona_id
 * @property string $estado
 * @property string|null $fecha_nacimiento
 * @property string|null $sexo
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AsignacionGrupo> $asignaciones
 * @property-read int|null $asignaciones_count
 * @property-read \App\Models\Persona $persona
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tutor> $tutores
 * @property-read int|null $tutores_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno whereEstado($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno whereFechaNacimiento($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno wherePersonaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno whereSexo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Alumno whereUpdatedAt($value)
 */
	class Alumno extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $alumno_id
 * @property int $grupo_id
 * @property int $ciclo_escolar_id
 * @property \Illuminate\Support\Carbon $fecha_asignacion
 * @property string $estado
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Alumno $alumno
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @property-read \App\Models\Grupo $grupo
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereAlumnoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereEstado($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereFechaAsignacion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereGrupoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AsignacionGrupo whereUpdatedAt($value)
 */
	class AsignacionGrupo extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $alumno_id
 * @property int $ciclo_escolar_id
 * @property int $clase_id
 * @property int $registrado_por
 * @property \Illuminate\Support\Carbon $fecha
 * @property string $estado
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Alumno $alumno
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @property-read \App\Models\Clase $clase
 * @property-read \App\Models\User $registradoPor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereAlumnoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereClaseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereEstado($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereFecha($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereRegistradoPor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Asistencia whereUpdatedAt($value)
 */
	class Asistencia extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $alumno_id
 * @property int $materia_id
 * @property int $ciclo_escolar_id
 * @property int $periodo_evaluacion_id
 * @property float|null $promedio
 * @property bool $publicada
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Alumno $alumno
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CalificacionDetalle> $detalles
 * @property-read int|null $detalles_count
 * @property-read \App\Models\Materia $materia
 * @property-read \App\Models\PeriodoEvaluacion $periodoEvaluacion
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion whereAlumnoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion whereMateriaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion wherePeriodoEvaluacionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion wherePromedio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion wherePublicada($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Calificacion whereUpdatedAt($value)
 */
	class Calificacion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $calificacion_id
 * @property int $rubro_id
 * @property float|null $valor
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Calificacion $calificacion
 * @property-read \App\Models\RubroEvaluacion $rubro
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle whereCalificacionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle whereRubroId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CalificacionDetalle whereValor($value)
 */
	class CalificacionDetalle extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nombre
 * @property \Illuminate\Support\Carbon $fecha_inicio
 * @property \Illuminate\Support\Carbon $fecha_fin
 * @property bool $activo
 * @property bool $cerrado
 * @property bool $archivado
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AsignacionGrupo> $asignaciones
 * @property-read int|null $asignaciones_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Clase> $clases
 * @property-read int|null $clases_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Grupo> $grupos
 * @property-read int|null $grupos_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PeriodoEvaluacion> $periodos
 * @property-read int|null $periodos_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereActivo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereArchivado($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereCerrado($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereFechaFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereFechaInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CicloEscolar whereUpdatedAt($value)
 */
	class CicloEscolar extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $titulo
 * @property string $descripcion
 * @property string|null $contenido
 * @property string $categoria
 * @property string $prioridad
 * @property array<array-key, mixed>|null $adjuntos
 * @property int|null $publicado_por
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $autor
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CircularDestinatario> $destinatarios
 * @property-read int|null $destinatarios_count
 * @property-read \App\Models\AgendaEvento|null $evento
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CircularLectura> $lecturas
 * @property-read int|null $lecturas_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereAdjuntos($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereCategoria($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereContenido($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular wherePrioridad($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular wherePublicadoPor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereTitulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Circular whereUpdatedAt($value)
 */
	class Circular extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $circular_id
 * @property string $rol
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Circular $circular
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario whereCircularId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario whereRol($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularDestinatario whereUpdatedAt($value)
 */
	class CircularDestinatario extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $circular_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $leida_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularLectura newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularLectura newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularLectura query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularLectura whereCircularId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularLectura whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularLectura whereLeidaAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CircularLectura whereUserId($value)
 */
	class CircularLectura extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $ciclo_escolar_id
 * @property int $grupo_id
 * @property int $materia_id
 * @property int $profesor_user_id
 * @property int|null $salon_id
 * @property string $dia_semana
 * @property string $hora_inicio
 * @property string $hora_fin
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @property-read \App\Models\Grupo $grupo
 * @property-read \App\Models\Materia $materia
 * @property-read \App\Models\User $profesor
 * @property-read \App\Models\Salon|null $salon
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereDiaSemana($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereGrupoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereHoraFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereHoraInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereMateriaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereProfesorUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereSalonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Clase whereUpdatedAt($value)
 */
	class Clase extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nombre
 * @property string|null $logo_url
 * @property string|null $numero
 * @property string|null $cct
 * @property string $turnos_disponibles
 * @property string|null $director
 * @property string|null $telefono
 * @property string|null $correo
 * @property string|null $direccion
 * @property string $nivel_educativo
 * @property string $servicio_educativo
 * @property bool $acceso_tutor
 * @property bool $acceso_profesor
 * @property bool $acceso_trab_social
 * @property bool $acceso_administrativo
 * @property bool $registro_tutores_activo
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereAccesoAdministrativo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereAccesoProfesor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereAccesoTrabSocial($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereAccesoTutor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereCct($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereCorreo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereDireccion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereDirector($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereLogoUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereNivelEducativo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereNumero($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereRegistroTutoresActivo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereServicioEducativo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereTelefono($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereTurnosDisponibles($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ConfiguracionEscuela whereUpdatedAt($value)
 */
	class ConfiguracionEscuela extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $numero
 * @property string $descripcion
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Grupo> $grupos
 * @property-read int|null $grupos_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Materia> $materias
 * @property-read int|null $materias_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado whereNumero($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grado whereUpdatedAt($value)
 */
	class Grado extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $ciclo_escolar_id
 * @property int $grado_id
 * @property string $nombre
 * @property string $turno
 * @property int $capacidad_maxima
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AsignacionGrupo> $asignaciones
 * @property-read int|null $asignaciones_count
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Clase> $clases
 * @property-read int|null $clases_count
 * @property-read \App\Models\Grado $grado
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereCapacidadMaxima($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereGradoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereTurno($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Grupo whereUpdatedAt($value)
 */
	class Grupo extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $grado_id
 * @property string $nombre
 * @property string|null $descripcion
 * @property int $horas_semanales
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Clase> $clases
 * @property-read int|null $clases_count
 * @property-read \App\Models\Grado $grado
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia whereGradoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia whereHorasSemanales($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Materia whereUpdatedAt($value)
 */
	class Materia extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $remitente_user_id
 * @property int $destinatario_user_id
 * @property int|null $alumno_id
 * @property int|null $grupo_id
 * @property string|null $grupo_envio
 * @property string $titulo
 * @property string $mensaje
 * @property string $tipo
 * @property string $categoria
 * @property string $prioridad
 * @property bool $leida
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Alumno|null $alumno
 * @property-read \App\Models\User $destinatario
 * @property-read \App\Models\Grupo|null $grupo
 * @property-read \App\Models\User $remitente
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereAlumnoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereCategoria($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereDestinatarioUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereGrupoEnvio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereGrupoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereLeida($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereMensaje($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion wherePrioridad($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereRemitenteUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereTipo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereTitulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notificacion whereUpdatedAt($value)
 */
	class Notificacion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $ciclo_escolar_id
 * @property string $nombre
 * @property \Illuminate\Support\Carbon $fecha_inicio
 * @property \Illuminate\Support\Carbon $fecha_fin
 * @property bool $captura_abierta
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereCapturaAbierta($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereFechaFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereFechaInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PeriodoEvaluacion whereUpdatedAt($value)
 */
	class PeriodoEvaluacion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nombre
 * @property string|null $descripcion
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permiso whereUpdatedAt($value)
 */
	class Permiso extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $persona_id
 * @property string|null $cargo
 * @property string|null $departamento
 * @property string|null $extension
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Persona $persona
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin whereCargo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin whereDepartamento($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin whereExtension($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin wherePersonaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PersAdmin whereUpdatedAt($value)
 */
	class PersAdmin extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $tipo_persona
 * @property string $nombre
 * @property string|null $apellidos
 * @property string|null $direccion
 * @property string|null $telefono
 * @property string|null $curp
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Alumno|null $alumno
 * @property-read \App\Models\PersAdmin|null $persAdmin
 * @property-read \App\Models\Profesor|null $profesor
 * @property-read \App\Models\TrabSocial|null $trabSocial
 * @property-read \App\Models\Tutor|null $tutor
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereApellidos($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereCurp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereDireccion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereTelefono($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereTipoPersona($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Persona whereUpdatedAt($value)
 */
	class Persona extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $persona_id
 * @property string|null $academia
 * @property string|null $cubiculo
 * @property string|null $hora_entrada
 * @property string|null $hora_salida
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Persona $persona
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor whereAcademia($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor whereCubiculo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor whereHoraEntrada($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor whereHoraSalida($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor wherePersonaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Profesor whereUpdatedAt($value)
 */
	class Profesor extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $alumno_id
 * @property int $reportado_por
 * @property string $tipo_reporte
 * @property string $gravedad
 * @property string $descripcion
 * @property string|null $observaciones
 * @property string|null $archivo_adjunto
 * @property \Illuminate\Support\Carbon $fecha
 * @property string $estatus
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Alumno $alumno
 * @property-read \App\Models\User $reportadoPor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereAlumnoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereArchivoAdjunto($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereEstatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereFecha($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereGravedad($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereObservaciones($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereReportadoPor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereTipoReporte($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReporteConducta whereUpdatedAt($value)
 */
	class ReporteConducta extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nombre
 * @property string|null $descripcion
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permiso> $permisos
 * @property-read int|null $permisos_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Role whereUpdatedAt($value)
 */
	class Role extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $profesor_user_id
 * @property int $materia_id
 * @property int $grupo_id
 * @property int $ciclo_escolar_id
 * @property int $periodo_evaluacion_id
 * @property string $nombre
 * @property float $ponderacion
 * @property int $orden
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CalificacionDetalle> $detalles
 * @property-read int|null $detalles_count
 * @property-read \App\Models\Grupo $grupo
 * @property-read \App\Models\Materia $materia
 * @property-read \App\Models\User $profesor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereGrupoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereMateriaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereOrden($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion wherePeriodoEvaluacionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion wherePonderacion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereProfesorUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RubroEvaluacion whereUpdatedAt($value)
 */
	class RubroEvaluacion extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nombre
 * @property string|null $edificio
 * @property int $capacidad
 * @property string $turno
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Clase> $clases
 * @property-read int|null $clases_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon whereCapacidad($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon whereEdificio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon whereNombre($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon whereTurno($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salon whereUpdatedAt($value)
 */
	class Salon extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $titulo
 * @property string|null $descripcion
 * @property int $materia_id
 * @property int $grupo_id
 * @property int $ciclo_escolar_id
 * @property int $asignado_por
 * @property \Illuminate\Support\Carbon $fecha_asignacion
 * @property \Illuminate\Support\Carbon $fecha_entrega
 * @property array<array-key, mixed>|null $archivos
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $asignadoPor
 * @property-read \App\Models\CicloEscolar $cicloEscolar
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TareaEntrega> $entregas
 * @property-read int|null $entregas_count
 * @property-read \App\Models\Grupo $grupo
 * @property-read \App\Models\Materia $materia
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereArchivos($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereAsignadoPor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereCicloEscolarId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereDescripcion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereFechaAsignacion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereFechaEntrega($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereGrupoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereMateriaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereTitulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tarea whereUpdatedAt($value)
 */
	class Tarea extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $tarea_id
 * @property int $alumno_id
 * @property string $estado
 * @property \Illuminate\Support\Carbon|null $fecha_entrega
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Alumno $alumno
 * @property-read \App\Models\Tarea $tarea
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega whereAlumnoId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega whereEstado($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega whereFechaEntrega($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega whereTareaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TareaEntrega whereUpdatedAt($value)
 */
	class TareaEntrega extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $persona_id
 * @property string|null $hora_entrada
 * @property string|null $hora_salida
 * @property string|null $extension
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Persona $persona
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial whereExtension($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial whereHoraEntrada($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial whereHoraSalida($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial wherePersonaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TrabSocial whereUpdatedAt($value)
 */
	class TrabSocial extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $persona_id
 * @property string|null $ocupacion
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Alumno> $alumnos
 * @property-read int|null $alumnos_count
 * @property-read \App\Models\Persona $persona
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor whereOcupacion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor wherePersonaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Tutor whereUpdatedAt($value)
 */
	class Tutor extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $persona_id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string $role
 * @property string $status
 * @property string|null $rejection_reason
 * @property int|null $validated_by
 * @property \Illuminate\Support\Carbon|null $validated_at
 * @property bool $must_change_password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Clase> $clases
 * @property-read int|null $clases_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\Persona|null $persona
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property-read \App\Models\Tutor|null $tutorProfile
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMustChangePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePersonaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRejectionReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereValidatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereValidatedBy($value)
 */
	class User extends \Eloquent {}
}

