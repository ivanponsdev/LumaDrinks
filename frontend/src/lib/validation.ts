// Expresiones regulares reutilizadas en frontend y DTOs de backend
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateEmail(value: string): string | null {
  if (!value) return 'El email es obligatorio';
  if (!EMAIL_REGEX.test(value)) return 'Introduce un email válido (ej: nombre@dominio.com)';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'La contraseña es obligatoria';
  if (value.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula';
  if (!/[a-z]/.test(value)) return 'Debe incluir al menos una minúscula';
  if (!/\d/.test(value)) return 'Debe incluir al menos un número';
  return null;
}

// Para mostrar los requisitos de la contraseña en tiempo real
export function getPasswordRequirements(value: string) {
  return [
    { label: 'Mínimo 8 caracteres', met: value.length >= 8 },
    { label: 'Una letra mayúscula', met: /[A-Z]/.test(value) },
    { label: 'Una letra minúscula', met: /[a-z]/.test(value) },
    { label: 'Un número',           met: /\d/.test(value) },
  ];
}
