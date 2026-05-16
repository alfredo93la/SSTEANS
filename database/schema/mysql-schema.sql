/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `agenda_evento_destinatarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agenda_evento_destinatarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agenda_evento_id` bigint(20) unsigned NOT NULL,
  `rol` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agenda_evento_destinatarios_agenda_evento_id_rol_unique` (`agenda_evento_id`,`rol`),
  CONSTRAINT `agenda_evento_destinatarios_agenda_evento_id_foreign` FOREIGN KEY (`agenda_evento_id`) REFERENCES `agenda_eventos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `agenda_eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agenda_eventos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `tipo` varchar(255) NOT NULL,
  `grupo_id` bigint(20) unsigned DEFAULT NULL,
  `materia_id` bigint(20) unsigned DEFAULT NULL,
  `circular_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `creado_por_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `agenda_eventos_circular_id_foreign` (`circular_id`),
  KEY `agenda_eventos_creado_por_id_foreign` (`creado_por_id`),
  KEY `agenda_eventos_grupo_id_foreign` (`grupo_id`),
  KEY `agenda_eventos_materia_id_foreign` (`materia_id`),
  CONSTRAINT `agenda_eventos_circular_id_foreign` FOREIGN KEY (`circular_id`) REFERENCES `circulares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agenda_eventos_creado_por_id_foreign` FOREIGN KEY (`creado_por_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `agenda_eventos_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `agenda_eventos_materia_id_foreign` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `persona_id` bigint(20) unsigned NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'Activo',
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alumnos_persona_id_unique` (`persona_id`),
  CONSTRAINT `alumnos_persona_id_foreign` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `asignaciones_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaciones_grupo` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `grupo_id` bigint(20) unsigned NOT NULL,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `fecha_asignacion` date NOT NULL DEFAULT curdate(),
  `estado` enum('activo','baja') NOT NULL DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asignaciones_grupo_alumno_id_ciclo_escolar_id_unique` (`alumno_id`,`ciclo_escolar_id`),
  KEY `asignaciones_grupo_grupo_id_foreign` (`grupo_id`),
  KEY `asignaciones_grupo_ciclo_escolar_id_foreign` (`ciclo_escolar_id`),
  CONSTRAINT `asignaciones_grupo_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_grupo_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_grupo_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asistencias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `clase_id` bigint(20) unsigned NOT NULL,
  `registrado_por` bigint(20) unsigned NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('Presente','Falta','Retardo') NOT NULL DEFAULT 'Presente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asistencia_unica` (`alumno_id`,`clase_id`,`fecha`),
  KEY `asistencias_ciclo_escolar_id_foreign` (`ciclo_escolar_id`),
  KEY `asistencias_registrado_por_foreign` (`registrado_por`),
  KEY `asistencias_alumno_id_index` (`alumno_id`),
  KEY `asistencias_clase_id_foreign` (`clase_id`),
  CONSTRAINT `asistencias_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_clase_id_foreign` FOREIGN KEY (`clase_id`) REFERENCES `clases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_registrado_por_foreign` FOREIGN KEY (`registrado_por`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `calificacion_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificacion_detalle` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `calificacion_id` bigint(20) unsigned NOT NULL,
  `rubro_id` bigint(20) unsigned NOT NULL,
  `valor` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `detalle_unico` (`calificacion_id`,`rubro_id`),
  KEY `calificacion_detalle_rubro_id_foreign` (`rubro_id`),
  CONSTRAINT `calificacion_detalle_calificacion_id_foreign` FOREIGN KEY (`calificacion_id`) REFERENCES `calificaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificacion_detalle_rubro_id_foreign` FOREIGN KEY (`rubro_id`) REFERENCES `rubros_evaluacion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `materia_id` bigint(20) unsigned NOT NULL,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `periodo_evaluacion_id` bigint(20) unsigned NOT NULL,
  `promedio` decimal(5,2) DEFAULT NULL,
  `publicada` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `calificacion_unica` (`alumno_id`,`materia_id`,`periodo_evaluacion_id`),
  KEY `calificaciones_materia_id_foreign` (`materia_id`),
  KEY `calificaciones_ciclo_escolar_id_foreign` (`ciclo_escolar_id`),
  KEY `calificaciones_periodo_evaluacion_id_foreign` (`periodo_evaluacion_id`),
  CONSTRAINT `calificaciones_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_materia_id_foreign` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_periodo_evaluacion_id_foreign` FOREIGN KEY (`periodo_evaluacion_id`) REFERENCES `periodos_evaluacion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ciclos_escolares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ciclos_escolares` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 0,
  `cerrado` tinyint(1) NOT NULL DEFAULT 0,
  `archivado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ciclos_escolares_nombre_unique` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER enforce_single_ciclo_activo_insert
            BEFORE INSERT ON ciclos_escolares
            FOR EACH ROW
            BEGIN
                IF NEW.activo = 1 THEN
                    UPDATE ciclos_escolares SET activo = 0;
                END IF;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER enforce_single_ciclo_activo_update
            BEFORE UPDATE ON ciclos_escolares
            FOR EACH ROW
            BEGIN
                IF NEW.activo = 1 AND OLD.activo = 0 THEN
                    UPDATE ciclos_escolares SET activo = 0 WHERE id != NEW.id;
                END IF;
            END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
DROP TABLE IF EXISTS `circular_destinatarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `circular_destinatarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `circular_id` bigint(20) unsigned NOT NULL,
  `rol` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `circular_destinatarios_circular_id_rol_unique` (`circular_id`,`rol`),
  CONSTRAINT `circular_destinatarios_circular_id_foreign` FOREIGN KEY (`circular_id`) REFERENCES `circulares` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `circular_lecturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `circular_lecturas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `circular_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `leida_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `circular_lecturas_circular_id_user_id_unique` (`circular_id`,`user_id`),
  KEY `circular_lecturas_user_id_foreign` (`user_id`),
  CONSTRAINT `circular_lecturas_circular_id_foreign` FOREIGN KEY (`circular_id`) REFERENCES `circulares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `circular_lecturas_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `circulares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `circulares` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `contenido` text DEFAULT NULL,
  `categoria` varchar(255) NOT NULL,
  `prioridad` varchar(255) NOT NULL,
  `adjuntos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`adjuntos`)),
  `publicado_por` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `circulares_publicado_por_foreign` (`publicado_por`),
  CONSTRAINT `circulares_publicado_por_foreign` FOREIGN KEY (`publicado_por`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `grupo_id` bigint(20) unsigned NOT NULL,
  `materia_id` bigint(20) unsigned NOT NULL,
  `profesor_user_id` bigint(20) unsigned NOT NULL,
  `salon_id` bigint(20) unsigned DEFAULT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clases_ciclo_escolar_id_foreign` (`ciclo_escolar_id`),
  KEY `clases_grupo_id_foreign` (`grupo_id`),
  KEY `clases_materia_id_foreign` (`materia_id`),
  KEY `clases_profesor_user_id_foreign` (`profesor_user_id`),
  KEY `clases_salon_id_foreign` (`salon_id`),
  CONSTRAINT `clases_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `clases_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `clases_materia_id_foreign` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  CONSTRAINT `clases_profesor_user_id_foreign` FOREIGN KEY (`profesor_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `clases_salon_id_foreign` FOREIGN KEY (`salon_id`) REFERENCES `salones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `configuracion_escuela`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `configuracion_escuela` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL DEFAULT '',
  `logo_url` varchar(255) DEFAULT NULL,
  `numero` varchar(255) DEFAULT NULL,
  `cct` varchar(20) DEFAULT NULL,
  `turnos_disponibles` enum('matutino','vespertino','ambos') NOT NULL DEFAULT 'matutino',
  `director` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `nivel_educativo` varchar(255) NOT NULL DEFAULT 'Secundaria',
  `servicio_educativo` varchar(255) NOT NULL DEFAULT 'General',
  `acceso_tutor` tinyint(1) NOT NULL DEFAULT 1,
  `acceso_profesor` tinyint(1) NOT NULL DEFAULT 1,
  `acceso_trab_social` tinyint(1) NOT NULL DEFAULT 1,
  `acceso_administrativo` tinyint(1) NOT NULL DEFAULT 1,
  `registro_tutores_activo` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `grados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grados` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `numero` tinyint(4) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `grados_numero_unique` (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grupos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `grado_id` bigint(20) unsigned NOT NULL,
  `nombre` varchar(5) NOT NULL,
  `turno` enum('matutino','vespertino') NOT NULL,
  `capacidad_maxima` tinyint(4) NOT NULL DEFAULT 40,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `grupos_ciclo_escolar_id_grado_id_nombre_turno_unique` (`ciclo_escolar_id`,`grado_id`,`nombre`,`turno`),
  KEY `grupos_grado_id_foreign` (`grado_id`),
  CONSTRAINT `grupos_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grupos_grado_id_foreign` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_reserved_at_available_at_index` (`queue`,`reserved_at`,`available_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `materias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `grado_id` bigint(20) unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `horas_semanales` tinyint(4) NOT NULL DEFAULT 3,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `materias_grado_id_nombre_unique` (`grado_id`,`nombre`),
  CONSTRAINT `materias_grado_id_foreign` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `remitente_user_id` bigint(20) unsigned NOT NULL,
  `destinatario_user_id` bigint(20) unsigned NOT NULL,
  `alumno_id` bigint(20) unsigned DEFAULT NULL,
  `grupo_id` bigint(20) unsigned DEFAULT NULL,
  `grupo_envio` varchar(36) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('Reporte','Alerta','Recordatorio','Información') NOT NULL DEFAULT 'Información',
  `categoria` enum('Académico','Asistencia','Conducta','Citatorio','Administrativo','Aviso','Orientación','Evento') NOT NULL,
  `prioridad` enum('Alta','Media','Baja') NOT NULL DEFAULT 'Media',
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificaciones_remitente_user_id_foreign` (`remitente_user_id`),
  KEY `notificaciones_destinatario_user_id_foreign` (`destinatario_user_id`),
  KEY `notificaciones_alumno_id_foreign` (`alumno_id`),
  KEY `notificaciones_grupo_id_foreign` (`grupo_id`),
  KEY `notificaciones_grupo_envio_index` (`grupo_envio`),
  CONSTRAINT `notificaciones_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notificaciones_destinatario_user_id_foreign` FOREIGN KEY (`destinatario_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notificaciones_remitente_user_id_foreign` FOREIGN KEY (`remitente_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `periodos_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `periodos_evaluacion` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `captura_abierta` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `periodos_evaluacion_ciclo_escolar_id_foreign` (`ciclo_escolar_id`),
  CONSTRAINT `periodos_evaluacion_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `permiso_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permiso_role` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `permiso_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permiso_role_permiso_id_role_id_unique` (`permiso_id`,`role_id`),
  KEY `permiso_role_role_id_foreign` (`role_id`),
  CONSTRAINT `permiso_role_permiso_id_foreign` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `permiso_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permisos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permisos_nombre_unique` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pers_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pers_admins` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `persona_id` bigint(20) unsigned NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `extension` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pers_admins_persona_id_unique` (`persona_id`),
  CONSTRAINT `pers_admins_persona_id_foreign` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tipo_persona` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellidos` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `curp` varchar(18) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personas_curp_unique` (`curp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `profesores` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `persona_id` bigint(20) unsigned NOT NULL,
  `academia` varchar(100) DEFAULT NULL,
  `cubiculo` varchar(50) DEFAULT NULL,
  `hora_entrada` time DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profesores_persona_id_unique` (`persona_id`),
  CONSTRAINT `profesores_persona_id_foreign` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `reportes_conducta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reportes_conducta` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `reportado_por` bigint(20) unsigned NOT NULL,
  `tipo_reporte` varchar(255) NOT NULL,
  `gravedad` varchar(255) NOT NULL DEFAULT 'Media',
  `descripcion` text NOT NULL,
  `observaciones` text DEFAULT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL,
  `fecha` date NOT NULL,
  `estatus` varchar(255) NOT NULL DEFAULT 'Abierto',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reportes_conducta_alumno_id_foreign` (`alumno_id`),
  KEY `reportes_conducta_reportado_por_foreign` (`reportado_por`),
  CONSTRAINT `reportes_conducta_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reportes_conducta_reportado_por_foreign` FOREIGN KEY (`reportado_por`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `role_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_user_role_id_user_id_unique` (`role_id`,`user_id`),
  KEY `role_user_user_id_foreign` (`user_id`),
  CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nombre_unique` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rubros_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rubros_evaluacion` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `profesor_user_id` bigint(20) unsigned NOT NULL,
  `materia_id` bigint(20) unsigned NOT NULL,
  `grupo_id` bigint(20) unsigned NOT NULL,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `periodo_evaluacion_id` bigint(20) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ponderacion` decimal(5,2) NOT NULL,
  `orden` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rubro_unico` (`profesor_user_id`,`materia_id`,`grupo_id`,`ciclo_escolar_id`,`periodo_evaluacion_id`,`nombre`),
  KEY `rubros_evaluacion_materia_id_foreign` (`materia_id`),
  KEY `rubros_evaluacion_grupo_id_foreign` (`grupo_id`),
  KEY `rubros_evaluacion_ciclo_escolar_id_foreign` (`ciclo_escolar_id`),
  KEY `rubros_evaluacion_periodo_evaluacion_id_foreign` (`periodo_evaluacion_id`),
  CONSTRAINT `rubros_evaluacion_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rubros_evaluacion_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rubros_evaluacion_materia_id_foreign` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rubros_evaluacion_periodo_evaluacion_id_foreign` FOREIGN KEY (`periodo_evaluacion_id`) REFERENCES `periodos_evaluacion` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rubros_evaluacion_profesor_user_id_foreign` FOREIGN KEY (`profesor_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `salones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `edificio` varchar(50) DEFAULT NULL,
  `capacidad` tinyint(4) NOT NULL DEFAULT 40,
  `turno` enum('matutino','vespertino','ambos') NOT NULL DEFAULT 'ambos',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tarea_entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tarea_entregas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tarea_id` bigint(20) unsigned NOT NULL,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `estado` enum('Pendiente','Entregada','Tarde','No Entregada') NOT NULL DEFAULT 'Pendiente',
  `fecha_entrega` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entrega_unica` (`tarea_id`,`alumno_id`),
  KEY `tarea_entregas_alumno_id_foreign` (`alumno_id`),
  CONSTRAINT `tarea_entregas_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tarea_entregas_tarea_id_foreign` FOREIGN KEY (`tarea_id`) REFERENCES `tareas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tareas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `materia_id` bigint(20) unsigned NOT NULL,
  `grupo_id` bigint(20) unsigned NOT NULL,
  `ciclo_escolar_id` bigint(20) unsigned NOT NULL,
  `asignado_por` bigint(20) unsigned NOT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_entrega` date NOT NULL,
  `archivos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`archivos`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tareas_materia_id_foreign` (`materia_id`),
  KEY `tareas_grupo_id_foreign` (`grupo_id`),
  KEY `tareas_ciclo_escolar_id_foreign` (`ciclo_escolar_id`),
  KEY `tareas_asignado_por_foreign` (`asignado_por`),
  CONSTRAINT `tareas_asignado_por_foreign` FOREIGN KEY (`asignado_por`) REFERENCES `users` (`id`),
  CONSTRAINT `tareas_ciclo_escolar_id_foreign` FOREIGN KEY (`ciclo_escolar_id`) REFERENCES `ciclos_escolares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tareas_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tareas_materia_id_foreign` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `trab_sociales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trab_sociales` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `persona_id` bigint(20) unsigned NOT NULL,
  `hora_entrada` time DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `extension` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trab_sociales_persona_id_unique` (`persona_id`),
  CONSTRAINT `trab_sociales_persona_id_foreign` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tutor_alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutor_alumno` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tutor_id` bigint(20) unsigned NOT NULL,
  `alumno_id` bigint(20) unsigned NOT NULL,
  `fecha_vinculacion` date DEFAULT NULL,
  `parentesco` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tutor_alumno_tutor_id_alumno_id_unique` (`tutor_id`,`alumno_id`),
  UNIQUE KEY `tutor_alumno_alumno_id_unique` (`alumno_id`),
  CONSTRAINT `tutor_alumno_alumno_id_foreign` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tutor_alumno_tutor_id_foreign` FOREIGN KEY (`tutor_id`) REFERENCES `tutores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tutores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutores` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `persona_id` bigint(20) unsigned NOT NULL,
  `ocupacion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tutores_persona_id_unique` (`persona_id`),
  CONSTRAINT `tutores_persona_id_foreign` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `persona_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'Tutor',
  `status` varchar(20) NOT NULL DEFAULT 'Activo',
  `rejection_reason` text DEFAULT NULL,
  `validated_by` bigint(20) unsigned DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_persona_id_foreign` (`persona_id`),
  KEY `users_validated_by_foreign` (`validated_by`),
  CONSTRAINT `users_persona_id_foreign` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_validated_by_foreign` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'0001_01_01_000000_create_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2026_03_19_000003_add_role_to_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2026_03_19_000004_create_academic_access_model_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2026_03_20_000005_add_validation_fields_to_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2026_03_23_000006_create_agenda_and_circulares_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2026_03_23_000007_create_agenda_evento_destinatarios_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2026_03_30_000008_create_academic_management_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2026_03_31_163731_update_users_status_values',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2026_03_31_200000_create_academic_activity_tables',2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2026_04_01_000000_add_gravedad_archivo_to_reportes_conducta',3);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2026_04_07_075929_add_no_entregada_to_tarea_entregas_estado',4);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2026_04_08_051724_create_periodos_evaluacion_table',5);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2026_04_08_075132_change_calificaciones_periodo_to_fk',6);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2026_04_09_043555_create_rubros_evaluacion_and_calificacion_detalle_tables',7);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2026_04_09_045003_add_periodo_to_rubros_evaluacion',8);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18,'2026_04_10_000001_create_notificaciones_table',9);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19,'2026_04_10_000002_add_alumno_id_to_notificaciones',10);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20,'2026_04_11_093228_add_acceso_roles_to_configuracion_escuela',11);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21,'2026_04_11_093933_drop_unused_columns_from_configuracion_escuela',12);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22,'2026_04_11_095653_add_unique_alumno_id_to_tutor_alumno_table',13);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23,'2026_04_14_000001_create_role_specific_tables',14);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24,'2026_04_14_000002_move_parentesco_to_tutor_alumno',15);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25,'2026_04_16_052017_add_grupo_materia_to_agenda_eventos_table',16);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26,'2026_04_16_052018_create_circular_lecturas_table',16);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (27,'2026_04_16_052019_add_adjuntos_to_circulares_table',16);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (28,'2026_04_16_060000_add_fecha_fin_to_agenda_eventos_table',17);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (29,'2024_01_01_000000_create_cache_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (30,'2026_04_16_161847_add_publicada_to_calificaciones_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (31,'2026_04_22_000000_add_circular_id_to_agenda_eventos_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (32,'2026_04_22_000001_make_contenido_nullable_in_circulares_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (33,'2026_04_23_022250_add_archivado_to_ciclos_escolares_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (34,'2026_04_24_000000_add_grupo_id_to_notificaciones_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (35,'2026_04_29_000001_add_must_change_password_to_users_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (36,'2026_04_30_060602_add_creado_por_id_to_agenda_eventos_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (37,'2026_04_30_120000_add_registro_tutores_activo_to_configuracion_escuela_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (38,'2026_05_01_000001_normalizar_parentesco_tutor_alumno',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (39,'2026_05_07_004035_add_logo_url_to_configuracion_escuela_table',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (40,'2026_05_09_020321_replace_horario_with_hora_entrada_salida_in_trab_sociales_table',19);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (41,'2026_05_11_041145_update_categoria_enum_in_notificaciones_table',20);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (42,'2026_05_12_062915_add_grupo_envio_to_notificaciones_table',21);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (43,'2026_05_14_043908_add_archivos_to_tareas_table',22);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (44,'2026_05_14_100001_change_hora_columns_to_time_in_profesores_table',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (45,'2026_05_14_100002_add_clase_id_to_asistencias_table',24);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (46,'2026_05_14_100003_add_trigger_single_ciclo_activo',24);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (47,'2026_05_15_072506_make_clase_id_not_null_in_asistencias_table',25);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (48,'2026_05_15_073253_drop_materia_id_from_asistencias_table',26);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (49,'2026_05_15_074340_rename_turnos_disponibles_to_turno_escuela_in_configuracion_escuela_table',27);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (50,'2026_05_15_075640_rename_turno_escuela_back_to_turnos_disponibles_in_configuracion_escuela_table',28);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (51,'2026_05_15_081105_replace_grupo_materia_strings_with_fks_in_agenda_eventos_table',29);
