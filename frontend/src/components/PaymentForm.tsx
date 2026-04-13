import { useState, ChangeEvent, FormEvent } from 'react';
import { simulatePayment, PaymentResult } from '../services/api';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  accessToken: string;
  onSuccess: (result: PaymentResult) => void;
  onBack: () => void;
}

interface Fields {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

interface FieldErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
}

export function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  if (digits.length === 2 && raw.endsWith('/')) {
    return raw;
  }
  return digits;
}

export function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.cardholderName.trim()) errors.cardholderName = 'El nombre no puede estar vacío.';
  const digits = fields.cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.';
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.expiry)) errors.expiry = 'Formato MM/AA requerido.';
  if (!/^\d{3,4}$/.test(fields.cvc)) errors.cvc = 'El CVC debe tener 3 o 4 dígitos.';
  return errors;
}

export default function PaymentForm({ orderId, amount, accessToken, onSuccess, onBack }: PaymentFormProps) {
  const [fields, setFields] = useState<Fields>({
    cardholderName: '',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/34',
    cvc: '123',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = validate(fields);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'cardNumber') formatted = formatCardNumber(value);
    if (name === 'expiry') formatted = formatExpiry(value);
    if (name === 'cvc') formatted = value.replace(/\D/g, '').slice(0, 4);
    setFields((prev) => ({ ...prev, [name]: formatted }));
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ cardholderName: true, cardNumber: true, expiry: true, cvc: true });
    if (!isValid) return;

    setLoading(true);
    setServerError(null);

    // Artificial 1.5 s delay for realism
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const result = await simulatePayment(
        {
          cardholderName: fields.cardholderName,
          cardNumber: fields.cardNumber.replace(/\s/g, ''),
          expiry: fields.expiry,
          cvc: fields.cvc,
          amount,
          orderId,
        },
        accessToken,
      );
      onSuccess(result);
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function fieldClass(name: keyof Fields) {
    const hasError = touched[name] && errors[name];
    return `w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-brand-primary focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? 'border-red-400 focus:ring-red-300'
        : 'border-brand-surface focus:ring-brand-accent'
    }`;
  }

  return (
    <div className="space-y-5">
      {/* Simulator banner */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span>
          <strong>Pago simulado</strong> — no se realizará ningún cargo real.
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Cardholder name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">
            Titular de la tarjeta
          </label>
          <input
            type="text"
            name="cardholderName"
            value={fields.cardholderName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nombre tal como aparece en la tarjeta"
            autoComplete="cc-name"
            className={fieldClass('cardholderName')}
          />
          {touched.cardholderName && errors.cardholderName && (
            <p className="text-xs text-red-600 mt-1">{errors.cardholderName}</p>
          )}
        </div>

        {/* Card number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">
            Número de tarjeta
          </label>
          <input
            type="text"
            name="cardNumber"
            value={fields.cardNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            autoComplete="cc-number"
            className={`${fieldClass('cardNumber')} font-mono tracking-widest`}
          />
          {touched.cardNumber && errors.cardNumber && (
            <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">
              Caducidad
            </label>
            <input
              type="text"
              name="expiry"
              value={fields.expiry}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="MM/AA"
              inputMode="numeric"
              autoComplete="cc-exp"
              className={fieldClass('expiry')}
            />
            {touched.expiry && errors.expiry && (
              <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-brand-muted mb-1">
              CVC
            </label>
            <input
              type="text"
              name="cvc"
              value={fields.cvc}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
              className={fieldClass('cvc')}
            />
            {touched.cvc && errors.cvc && (
              <p className="text-xs text-red-600 mt-1">{errors.cvc}</p>
            )}
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {serverError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-shrink-0 border-2 border-brand-primary text-brand-primary px-5 py-3 rounded-full font-bold hover:bg-brand-primary hover:text-brand-bg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Volver
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-accent text-brand-bg py-3 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Procesando...
              </span>
            ) : (
              `Pagar ${amount.toFixed(2)} €`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
