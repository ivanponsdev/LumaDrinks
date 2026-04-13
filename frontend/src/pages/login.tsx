import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../lib/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Errores de cada campo (se muestran tras el primer blur o al hacer submit)
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Capa 1: validación en tiempo real al salir del campo
  function handleEmailBlur() {
    setEmailError(validateEmail(email));
  }
  function handlePasswordBlur() {
    setPasswordError(password ? null : 'La contraseña es obligatoria');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Capa 1: validamos todo antes de enviar
    const eErr = validateEmail(email);
    const pErr = password ? null : 'La contraseña es obligatoria';
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setServerError(null);
    setLoading(true);
    // Capa 2: NestJS valida el DTO y devuelve errores si no pasa
    const { error } = await login(email, password);
    if (error) {
      setServerError(error);
    } else {
      const redirect = (router.query.redirect as string) || '/';
      router.push(redirect);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm bg-brand-surface rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-primary mb-6 text-center">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
              onBlur={handleEmailBlur}
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${emailError ? 'border-red-400' : 'border-brand-muted'}`}
            />
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(e.target.value ? null : 'La contraseña es obligatoria'); }}
              onBlur={handlePasswordBlur}
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${passwordError ? 'border-red-400' : 'border-brand-muted'}`}
            />
            {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
          </div>

          {/* Error del servidor (capa 2) */}
          {serverError && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-brand-accent text-white py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-brand-muted">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-brand-accent font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

