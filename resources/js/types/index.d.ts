import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    persona_id?: number | null;
    status?: string | null;
    persona?: {
        tipo_persona?: string | null;
        nombre?: string | null;
        apellidos?: string | null;
        direccion?: string | null;
        telefono?: string | null;
        curp?: string | null;
    } | null;
    tutor_profile?: {
        ocupacion?: string | null;
        alumnos_count?: number;
        alumnos?: Array<{
            id: number;
            nombre: string;
            sexo?: string | null;
            parentesco?: string | null;
        }>;
    } | null;
    profesor_profile?: {
        academia?: string | null;
        cubiculo?: string | null;
        hora_entrada?: string | null;
        hora_salida?: string | null;
    } | null;
    trab_social_profile?: {
        hora_entrada?: string | null;
        hora_salida?: string | null;
        extension?: string | null;
    } | null;
    pers_admin_profile?: {
        cargo?: string | null;
        departamento?: string | null;
        extension?: string | null;
    } | null;
    permissions: string[];
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    escuela: {
        nombre: string;
        servicio_educativo: string;
        numero: string;
        logo_url: string | null;
        registro_tutores_activo: boolean;
    };
    cicloActivo?: {
        id: number;
        nombre: string;
        fecha_inicio: string;
        fecha_fin: string;
    } | null;
    ziggy: Config & { location: string };
};
