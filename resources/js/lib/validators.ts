// Regex del CURP mexicano: 4 letras + 6 dígitos (fecha) + H/M + 2 letras estado + 3 letras + 2 alfanuméricos
const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;

// 10 dígitos exactos (formato México)
const TELEFONO_REGEX = /^[0-9]{10}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailValido = (email: string) => EMAIL_REGEX.test(email.trim());

export const curpValido = (curp: string) => CURP_REGEX.test(curp.trim().toUpperCase());

export const telefonoValido = (tel: string) => !tel || TELEFONO_REGEX.test(tel.replace(/\s/g, ""));

// Mínimo 12 caracteres, al menos una mayúscula, un número y un símbolo
const PWD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}$/;

export const passwordFuerte = (pwd: string) => PWD_REGEX.test(pwd);

export const passwordsCoinciden = (pwd: string, confirm: string) => pwd === confirm;

export const horaFinMayorQueInicio = (inicio: string, fin: string) => {
  if (!inicio || !fin) return true;
  return inicio < fin;
};

export const fechaNacimientoValida = (fecha: string): boolean => {
  if (!fecha) return false;
  const d = new Date(fecha);
  const hoy = new Date();
  const minFecha = new Date("1900-01-01");
  return d <= hoy && d >= minFecha;
};

export const nombreValido = (nombre: string) => nombre.trim().length >= 2;
