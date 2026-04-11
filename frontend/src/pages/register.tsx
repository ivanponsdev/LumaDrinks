import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, getPasswordRequirements } from '../lib/validation';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requirements = getPasswordRequirements(password);
  const passwordTouched = password.length > 0;

  function handleEmailBlur() { setEmailError(validateEmail(email)); }
  function handlePasswordBlur() { setPasswordError(validatePassword(password)); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setServerError(null);
    setLoading(true);

    const { error: regError } = await register(email, password);
    if (regError) {
      setServerError(regError);
      setLoading(false);
      return;
    }

    // Login automático tras registro
    const { error: loginError } = await login(email, password);
    if (loginError) {
      setServerError(loginError);
    } else {
      router.push('/');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm bg-brand-surface rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-primary mb-6 text-center">Crear cuenta</h1>

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
              onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(validatePassword(e.target.value)); }}
              onBlur={handlePasswordBlur}
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent ${passwordError ? 'border-red-400' : 'border-brand-muted'}`}
            />
            {/* Checklist de requisitos — visible mientras se escribe */}
            {passwordTouched && (
              <ul className="mt-1 flex flex-col gap-0.5">
                {requirements.map((req) => (
                  <li
                    key={req.label}
                    className={`text-xs flex items-center gap-1 ${req.met ? 'text-green-600' : 'text-brand-muted'}`}
                  >
                    <span>{req.met ? '✓' : '○'}</span>
                    {req.label}
                  </li>
                ))}
              </ul>
            )}
            {passwordError && !passwordTouched && <p className="text-red-500 text-xs">{passwordError}</p>}
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-brand-muted">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand-accent font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
