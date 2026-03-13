// Datos de ejemplo centralizados para todo el sistema

export const alumnos = [
  {
    id: 1,
    nombre: "Juan Pérez",
    curp: "PEJU080515HDFRRL01",
    grupo: "2°B",
    grado: 2,
    ciclo: "2025-2026",
    tutorId: 2,
    fotoPerfil: null
  },
  {
    id: 2,
    nombre: "María Pérez",
    curp: "LOMA090312MDFPRL09",
    grupo: "3°A",
    grado: 3,
    ciclo: "2025-2026",
    tutorId: 2,
    fotoPerfil: null
  },
  {
    id: 3,
    nombre: "Carlos Ramírez",
    curp: "RAMC091021HDFMRL03",
    grupo: "2°B",
    grado: 2,
    ciclo: "2025-2026",
    tutorId: 3,
    fotoPerfil: null
  },
  {
    id: 4,
    nombre: "Ana Martínez",
    curp: "MAAN100208MDFRTL07",
    grupo: "3°A",
    grado: 3,
    ciclo: "2025-2026",
    tutorId: 4,
    fotoPerfil: null
  }
];

export const grupos = [
  { id: 1, nombre: "1°A", grado: 1, seccion: "A", ciclo: "2025-2026", profesorId: 1 },
  { id: 2, nombre: "2°B", grado: 2, seccion: "B", ciclo: "2025-2026", profesorId: 1 },
  { id: 3, nombre: "3°A", grado: 3, seccion: "A", ciclo: "2025-2026", profesorId: 5 },
];

export const materias = [
  { id: 1, nombre: "Matemáticas", clave: "MAT", grado: [1, 2, 3] },
  { id: 2, nombre: "Español", clave: "ESP", grado: [1, 2, 3] },
  { id: 3, nombre: "Historia", clave: "HIS", grado: [1, 2, 3] },
  { id: 4, nombre: "Ciencias", clave: "CIE", grado: [1, 2, 3] },
  { id: 5, nombre: "Inglés", clave: "ING", grado: [1, 2, 3] },
  { id: 6, nombre: "Educación Física", clave: "EDF", grado: [1, 2, 3] },
];

export const horarios = [
  // Horario para Juan Pérez (2°B)
  { id: 1, alumnoId: 1, grupoId: 2, materiaId: 1, diaSemana: "Lunes", horaInicio: "08:00", horaFin: "09:00", salon: "201" },
  { id: 2, alumnoId: 1, grupoId: 2, materiaId: 2, diaSemana: "Lunes", horaInicio: "09:00", horaFin: "10:00", salon: "201" },
  { id: 3, alumnoId: 1, grupoId: 2, materiaId: 3, diaSemana: "Martes", horaInicio: "08:00", horaFin: "09:00", salon: "201" },
  { id: 4, alumnoId: 1, grupoId: 2, materiaId: 4, diaSemana: "Miércoles", horaInicio: "08:00", horaFin: "09:00", salon: "Lab 1" },
  { id: 5, alumnoId: 1, grupoId: 2, materiaId: 5, diaSemana: "Jueves", horaInicio: "08:00", horaFin: "09:00", salon: "201" },
  { id: 6, alumnoId: 1, grupoId: 2, materiaId: 6, diaSemana: "Viernes", horaInicio: "08:00", horaFin: "09:00", salon: "Gimnasio" },
  // Horario para María López (3°A)
  { id: 7, alumnoId: 2, grupoId: 3, materiaId: 1, diaSemana: "Lunes", horaInicio: "08:00", horaFin: "09:00", salon: "301" },
  { id: 8, alumnoId: 2, grupoId: 3, materiaId: 2, diaSemana: "Lunes", horaInicio: "09:00", horaFin: "10:00", salon: "301" },
  { id: 9, alumnoId: 2, grupoId: 3, materiaId: 4, diaSemana: "Martes", horaInicio: "08:00", horaFin: "09:00", salon: "Lab 2" },
  { id: 10, alumnoId: 2, grupoId: 3, materiaId: 3, diaSemana: "Miércoles", horaInicio: "08:00", horaFin: "09:00", salon: "301" },
  { id: 11, alumnoId: 2, grupoId: 3, materiaId: 5, diaSemana: "Jueves", horaInicio: "08:00", horaFin: "09:00", salon: "301" },
  { id: 12, alumnoId: 2, grupoId: 3, materiaId: 6, diaSemana: "Viernes", horaInicio: "08:00", horaFin: "09:00", salon: "Gimnasio" },
];

export const calificaciones = [
  { id: 1, alumnoId: 1, materiaId: 1, periodo: "Trimestre 1", parcial: 8.5, proyecto: 9.0, examen: 8.0, promedio: 8.5 },
  { id: 2, alumnoId: 1, materiaId: 2, periodo: "Trimestre 1", parcial: 9.0, proyecto: 9.2, examen: 8.8, promedio: 9.0 },
  { id: 3, alumnoId: 1, materiaId: 3, periodo: "Trimestre 1", parcial: 8.0, proyecto: 8.5, examen: 8.0, promedio: 8.2 },
  { id: 4, alumnoId: 1, materiaId: 4, periodo: "Trimestre 1", parcial: 7.5, proyecto: 8.0, examen: 7.8, promedio: 7.8 },
  { id: 5, alumnoId: 1, materiaId: 5, periodo: "Trimestre 1", parcial: 8.8, proyecto: 9.0, examen: 8.5, promedio: 8.8 },
  { id: 6, alumnoId: 2, materiaId: 1, periodo: "Trimestre 1", parcial: 9.5, proyecto: 9.0, examen: 9.2, promedio: 9.2 },
  { id: 7, alumnoId: 2, materiaId: 2, periodo: "Trimestre 1", parcial: 9.0, proyecto: 9.5, examen: 9.0, promedio: 9.2 },
  { id: 8, alumnoId: 2, materiaId: 3, periodo: "Trimestre 1", parcial: 9.3, proyecto: 9.0, examen: 9.5, promedio: 9.3 },
  { id: 9, alumnoId: 2, materiaId: 4, periodo: "Trimestre 1", parcial: 8.8, proyecto: 9.2, examen: 9.0, promedio: 9.0 },
  { id: 10, alumnoId: 2, materiaId: 5, periodo: "Trimestre 1", parcial: 9.6, proyecto: 9.8, examen: 9.4, promedio: 9.6 },
];

export const asistencias = [
  // Juan Pérez (alumnoId: 1) - 2°B - Asistencias por materia
  { id: 1, alumnoId: 1, materiaId: 1, fecha: "02/02/2026", estado: "Presente" },
  { id: 2, alumnoId: 1, materiaId: 2, fecha: "02/02/2026", estado: "Presente" },
  { id: 3, alumnoId: 1, materiaId: 1, fecha: "03/02/2026", estado: "Retardo" },
  { id: 4, alumnoId: 1, materiaId: 3, fecha: "03/02/2026", estado: "Presente" },
  { id: 5, alumnoId: 1, materiaId: 4, fecha: "04/02/2026", estado: "Presente" },
  { id: 6, alumnoId: 1, materiaId: 2, fecha: "04/02/2026", estado: "Falta" },
  { id: 7, alumnoId: 1, materiaId: 5, fecha: "05/02/2026", estado: "Presente" },
  { id: 8, alumnoId: 1, materiaId: 1, fecha: "09/02/2026", estado: "Presente" },
  { id: 9, alumnoId: 1, materiaId: 2, fecha: "09/02/2026", estado: "Presente" },
  { id: 10, alumnoId: 1, materiaId: 6, fecha: "06/02/2026", estado: "Presente" },
  { id: 11, alumnoId: 1, materiaId: 3, fecha: "10/02/2026", estado: "Presente" },
  { id: 12, alumnoId: 1, materiaId: 4, fecha: "11/02/2026", estado: "Retardo" },
  
  // María Pérez (alumnoId: 2) - 3°A - Asistencias por materia
  { id: 13, alumnoId: 2, materiaId: 1, fecha: "02/02/2026", estado: "Presente" },
  { id: 14, alumnoId: 2, materiaId: 2, fecha: "02/02/2026", estado: "Presente" },
  { id: 15, alumnoId: 2, materiaId: 4, fecha: "03/02/2026", estado: "Presente" },
  { id: 16, alumnoId: 2, materiaId: 3, fecha: "04/02/2026", estado: "Presente" },
  { id: 17, alumnoId: 2, materiaId: 5, fecha: "05/02/2026", estado: "Presente" },
  { id: 18, alumnoId: 2, materiaId: 6, fecha: "06/02/2026", estado: "Presente" },
  { id: 19, alumnoId: 2, materiaId: 1, fecha: "09/02/2026", estado: "Presente" },
  { id: 20, alumnoId: 2, materiaId: 2, fecha: "09/02/2026", estado: "Presente" },
  { id: 21, alumnoId: 2, materiaId: 4, fecha: "10/02/2026", estado: "Presente" },
  { id: 22, alumnoId: 2, materiaId: 3, fecha: "11/02/2026", estado: "Presente" },
];

export const tareas = [
  {
    id: 1,
    titulo: "Lectura capítulo 3",
    descripcion: "Leer y resumir el capítulo 3 del libro de texto",
    materiaId: 2,
    grupoId: 2,
    fechaAsignacion: "05/01/2026",
    fechaEntrega: "12/01/2026",
    profesorId: 1,
    entregas: [
      { alumnoId: 1, estado: "Pendiente", fechaEntrega: null },
      { alumnoId: 3, estado: "Entregada", fechaEntrega: "10/01/2026" }
    ]
  },
  {
    id: 2,
    titulo: "Guía ejercicios 5–7",
    descripcion: "Resolver los ejercicios 5, 6 y 7 de la página 45",
    materiaId: 1,
    grupoId: 2,
    fechaAsignacion: "03/02/2026",
    fechaEntrega: "10/02/2026",
    profesorId: 1,
    entregas: [
      { alumnoId: 1, estado: "Entregada", fechaEntrega: "09/02/2026" },
      { alumnoId: 3, estado: "Entregada", fechaEntrega: "10/02/2026" }
    ]
  },
  {
    id: 3,
    titulo: "Proyecto de Historia",
    descripcion: "Elaborar una línea del tiempo sobre la Independencia de México",
    materiaId: 3,
    grupoId: 2,
    fechaAsignacion: "01/02/2026",
    fechaEntrega: "15/02/2026",
    profesorId: 1,
    entregas: [
      { alumnoId: 1, estado: "Pendiente", fechaEntrega: null }
    ]
  },
  {
    id: 4,
    titulo: "Ensayo sobre el método científico",
    descripcion: "Redactar un ensayo de 2 páginas sobre el método científico y sus aplicaciones",
    materiaId: 2,
    grupoId: 3,
    fechaAsignacion: "05/02/2026",
    fechaEntrega: "18/02/2026",
    profesorId: 5,
    entregas: [
      { alumnoId: 2, estado: "Entregada", fechaEntrega: "12/02/2026" }
    ]
  },
  {
    id: 5,
    titulo: "Ejercicios de álgebra",
    descripcion: "Resolver los problemas 1-15 del capítulo 4",
    materiaId: 1,
    grupoId: 3,
    fechaAsignacion: "06/02/2026",
    fechaEntrega: "13/02/2026",
    profesorId: 5,
    entregas: [
      { alumnoId: 2, estado: "Entregada", fechaEntrega: "11/02/2026" }
    ]
  }
];

export const reportesConducta = [
  {
    id: 1,
    fecha: "05/02/2026",
    alumnoId: 1,
    descripcion: "Interrupciones constantes en clase.",
    observaciones: "Se habló con el alumno y se comprometió a mejorar su comportamiento.",
    estatus: "En seguimiento",
    reportadoPor: 6,
    tipoReporte: "Disciplina"
  },
  {
    id: 2,
    fecha: "28/01/2026",
    alumnoId: 2,
    descripcion: "Olvidó material por tercera ocasión.",
    observaciones: "Se notificó al tutor. El alumno mostró mejora en las siguientes clases.",
    estatus: "Cerrado",
    reportadoPor: 6,
    tipoReporte: "Material"
  }
];

export const observaciones = [
  {
    id: 1,
    alumnoId: 1,
    fecha: "10/02/2026",
    profesorId: 1,
    materia: "Matemáticas",
    observacion: "Alumno muestra gran interés en álgebra. Recomendar actividades extras.",
    tipo: "Positiva"
  },
  {
    id: 2,
    alumnoId: 1,
    fecha: "08/02/2026",
    profesorId: 1,
    materia: "Español",
    observacion: "Necesita reforzar ortografía. Se sugiere práctica adicional.",
    tipo: "Mejora"
  }
];

// Eventos académicos (reuniones, juntas, eventos escolares)
export const eventosAcademicos = [
  {
    id: 1,
    titulo: "Reunión con tutores",
    descripcion: "Reunión general para informar sobre el avance del trimestre",
    fecha: "25/02/2026",
    horaInicio: "16:00",
    horaFin: "18:00",
    lugar: "Auditorio principal",
    tipo: "Reunión",
    grupoIds: [1, 2, 3], // Todos los grupos
    destinatarios: ["Tutor", "Profesor"] // Quiénes deben verlo
  },
  {
    id: 2,
    titulo: "Junta de evaluación",
    descripcion: "Junta de evaluación del primer trimestre",
    fecha: "30/01/2026",
    horaInicio: "09:00",
    horaFin: "13:00",
    lugar: "Sala de profesores",
    tipo: "Junta",
    grupoIds: [1, 2, 3],
    destinatarios: ["Profesor", "Trabajador Social", "Administrador"]
  },
  {
    id: 3,
    titulo: "Festival de fin de año",
    descripcion: "Celebración y presentaciones artísticas de los alumnos",
    fecha: "15/12/2025",
    horaInicio: "10:00",
    horaFin: "14:00",
    lugar: "Patio principal",
    tipo: "Evento",
    grupoIds: [1, 2, 3],
    destinatarios: ["Tutor", "Profesor", "Trabajador Social", "Administrador"]
  },
  {
    id: 4,
    titulo: "Día de puertas abiertas",
    descripcion: "Visita de padres y futuros alumnos",
    fecha: "05/02/2026",
    horaInicio: "08:00",
    horaFin: "13:00",
    lugar: "Toda la escuela",
    tipo: "Evento",
    grupoIds: [1, 2, 3],
    destinatarios: ["Tutor", "Profesor", "Trabajador Social", "Administrador"]
  }
];

// Exámenes programados
export const examenes = [
  {
    id: 1,
    titulo: "Examen Matemáticas",
    descripcion: "Evaluación del trimestre 1 - Unidades 1-4",
    materiaId: 1,
    grupoId: 2,
    fecha: "20/03/2026",
    horaInicio: "08:00",
    horaFin: "10:00",
    profesorId: 1,
    tipo: "Parcial",
    valor: 30 // Porcentaje de la calificación
  },
  {
    id: 2,
    titulo: "Examen Español",
    descripcion: "Evaluación de comprensión lectora y gramática",
    materiaId: 2,
    grupoId: 2,
    fecha: "21/03/2026",
    horaInicio: "08:00",
    horaFin: "09:30",
    profesorId: 1,
    tipo: "Parcial",
    valor: 30
  },
  {
    id: 3,
    titulo: "Examen Historia",
    descripcion: "Evaluación sobre la Independencia de México",
    materiaId: 3,
    grupoId: 2,
    fecha: "22/03/2026",
    horaInicio: "09:00",
    horaFin: "10:30",
    profesorId: 1,
    tipo: "Parcial",
    valor: 30
  },
  {
    id: 4,
    titulo: "Examen Ciencias",
    descripcion: "Evaluación del método científico y laboratorio",
    materiaId: 4,
    grupoId: 3,
    fecha: "23/03/2026",
    horaInicio: "08:00",
    horaFin: "10:00",
    profesorId: 5,
    tipo: "Parcial",
    valor: 30
  },
  {
    id: 5,
    titulo: "Examen Matemáticas",
    descripcion: "Evaluación de álgebra - Trimestre 1",
    materiaId: 1,
    grupoId: 3,
    fecha: "24/02/2026",
    horaInicio: "08:00",
    horaFin: "10:00",
    profesorId: 5,
    tipo: "Parcial",
    valor: 30
  }
];

export const ciclosEscolares = [
  { id: 1, nombre: "2025-2026", fechaInicio: "01/09/2025", fechaFin: "30/06/2026", activo: true },
  { id: 2, nombre: "2024-2025", fechaInicio: "01/09/2024", fechaFin: "30/06/2025", activo: false },
];

export const usuarios = [
  { id: 1, usuario: "profesor", nombre: "Prof. García", rol: "Profesor", correo: "jgarcia@esc.edu.mx", estatus: "Activo" },
  { id: 2, usuario: "tutor", nombre: "María López", rol: "Tutor", correo: "mlopez@esc.edu.mx", estatus: "Activo" },
  { id: 3, usuario: "tutor2", nombre: "Roberto Sánchez", rol: "Tutor", correo: "rsanchez@esc.edu.mx", estatus: "Activo" },
  { id: 4, usuario: "tutor3", nombre: "Laura García", rol: "Tutor", correo: "lgarcia@esc.edu.mx", estatus: "Activo" },
  { id: 5, usuario: "profesor2", nombre: "Prof. Ortega", rol: "Profesor", correo: "portega@esc.edu.mx", estatus: "Activo" },
  { id: 6, usuario: "social", nombre: "Lic. Martínez", rol: "Trabajador Social", correo: "lmartinez@esc.edu.mx", estatus: "Activo" },
  { id: 7, usuario: "admin", nombre: "Admin Escolar", rol: "Administrador", correo: "admin@esc.edu.mx", estatus: "Activo" },
];

// Circulares escolares
export const circulares = [
  {
    id: 1,
    titulo: "Calendario de Exámenes del Segundo Trimestre",
    descripcion: "Se adjunta el calendario oficial de exámenes del segundo trimestre. Por favor revisen las fechas y horarios con sus hijos.",
    contenido: "Estimados padres de familia:\n\nPor medio de la presente, les informamos que el periodo de exámenes del segundo trimestre se llevará a cabo del 20 al 24 de marzo de 2026.\n\nLes pedimos estar al pendiente del desempeño académico de sus hijos y apoyarlos en su preparación.\n\nAtentamente,\nDirección Académica",
    fechaPublicacion: "10/02/2026",
    prioridad: "Alta",
    categoria: "Académico",
    destinatarios: ["Tutor", "Profesor"],
    adjuntos: ["calendario-examenes-trim2.pdf"],
    publicadoPor: 7,
    leida: false
  },
  {
    id: 2,
    titulo: "Suspensión de Actividades por Día Festivo",
    descripcion: "Les informamos que el lunes 21 de marzo no habrá clases por conmemoración del natalicio de Benito Juárez.",
    contenido: "Estimada comunidad escolar:\n\nDe acuerdo al calendario oficial de la SEP, les recordamos que el lunes 21 de marzo de 2026 no habrá actividades escolares por ser día festivo oficial.\n\nLas actividades se reanudarán normalmente el martes 22 de marzo.\n\nAtentamente,\nDirección General",
    fechaPublicacion: "08/02/2026",
    prioridad: "Media",
    categoria: "General",
    destinatarios: ["Tutor", "Profesor", "Trabajador Social", "Administrador"],
    adjuntos: [],
    publicadoPor: 7,
    leida: true
  },
  {
    id: 3,
    titulo: "Actualización del Protocolo de Seguridad Escolar",
    descripcion: "Se ha actualizado el protocolo de seguridad y emergencias de la institución. Es importante que todos los miembros de la comunidad escolar lo revisen.",
    contenido: "Estimada comunidad:\n\nEn nuestro compromiso por garantizar la seguridad de todos los alumnos y personal, hemos actualizado nuestro protocolo de seguridad y emergencias.\n\nLos puntos principales incluyen:\n- Rutas de evacuación actualizadas\n- Puntos de reunión en caso de emergencia\n- Procedimientos en caso de sismo\n- Contactos de emergencia\n\nLes pedimos revisar el documento adjunto y comentarlo con sus familias.\n\nAtentamente,\nComité de Seguridad Escolar",
    fechaPublicacion: "05/02/2026",
    prioridad: "Alta",
    categoria: "Seguridad",
    destinatarios: ["Tutor", "Profesor", "Trabajador Social", "Administrador"],
    adjuntos: ["protocolo-seguridad-2026.pdf", "mapa-evacuacion.pdf"],
    publicadoPor: 7,
    leida: false
  },
  {
    id: 4,
    titulo: "Convocatoria para Festival de Primavera",
    descripcion: "Invitamos a todos los alumnos a participar en nuestro tradicional Festival de Primavera que se realizará el próximo mes.",
    contenido: "Querida comunidad escolar:\n\n¡Los invitamos a participar en nuestro Festival de Primavera 2026!\n\nFecha: 20 de marzo de 2026\nHora: 10:00 - 14:00 hrs\nLugar: Patio principal\n\nCategorías de participación:\n- Danza folklórica\n- Teatro\n- Música\n- Artes plásticas\n- Declamación\n\nLa inscripción está abierta hasta el 28 de febrero. Para más información, contactar a la coordinación de actividades culturales.\n\nAtentamente,\nCoordinación Cultural",
    fechaPublicacion: "03/02/2026",
    prioridad: "Baja",
    categoria: "Cultural",
    destinatarios: ["Tutor", "Profesor"],
    adjuntos: ["bases-festival-primavera.pdf"],
    publicadoPor: 7,
    leida: true
  },
  {
    id: 5,
    titulo: "Proceso de Reinscripción Ciclo 2026-2027",
    descripcion: "Información importante sobre el proceso de reinscripción para el próximo ciclo escolar. Fechas límite y requisitos.",
    contenido: "Estimados padres de familia:\n\nLes informamos que el proceso de reinscripción para el ciclo escolar 2026-2027 iniciará el 1 de marzo de 2026.\n\nRequisitos:\n- Boleta de calificaciones del ciclo actual\n- Comprobante de domicilio actualizado\n- Fotografías tamaño infantil\n- Pago de reinscripción\n\nFechas importantes:\n- Inscripción anticipada: 1-15 de marzo\n- Inscripción regular: 16-31 de marzo\n\nLa inscripción anticipada tiene un descuento del 10%.\n\nPara más información, favor de pasar a la oficina administrativa.\n\nAtentamente,\nControl Escolar",
    fechaPublicacion: "01/02/2026",
    prioridad: "Alta",
    categoria: "Administrativo",
    destinatarios: ["Tutor", "Administrador"],
    adjuntos: ["requisitos-reinscripcion.pdf", "formato-inscripcion.pdf"],
    publicadoPor: 7,
    leida: false
  },
  {
    id: 6,
    titulo: "Taller de Orientación Vocacional para 3° Grado",
    descripcion: "Se impartirá un taller de orientación vocacional para alumnos de tercer grado como preparación para la educación media superior.",
    contenido: "Estimados tutores de alumnos de 3er grado:\n\nNos complace informarles que se impartirá un Taller de Orientación Vocacional para apoyar a sus hijos en la elección de su siguiente nivel educativo.\n\nDetalles:\nFechas: 25, 26 y 27 de febrero\nHorario: 14:00 - 16:00 hrs\nLugar: Sala de usos múltiples\n\nTemas a tratar:\n- Test de aptitudes e intereses\n- Opciones de bachillerato\n- Proceso de preinscripción a media superior\n- Becas y apoyos disponibles\n\nLa asistencia es obligatoria para todos los alumnos de 3er grado.\n\nAtentamente,\nDepartamento de Orientación Educativa",
    fechaPublicacion: "30/01/2026",
    prioridad: "Media",
    categoria: "Académico",
    destinatarios: ["Tutor"],
    adjuntos: ["programa-orientacion-vocacional.pdf"],
    publicadoPor: 6,
    leida: true
  }
];

// Funciones auxiliares
export const getMateriaById = (id: number) => materias.find(m => m.id === id);
export const getAlumnoById = (id: number) => alumnos.find(a => a.id === id);
export const getGrupoById = (id: number) => grupos.find(g => g.id === id);
export const getUsuarioById = (id: number) => usuarios.find(u => u.id === id);