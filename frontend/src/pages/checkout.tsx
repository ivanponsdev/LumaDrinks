import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, ShippingAddress } from '../services/api';
import PaymentForm from '../components/PaymentForm';
import type { PaymentResult } from '../services/api';

type Step = 'details' | 'payment';

interface AddressFields {
  street: string;
  floor: string;
  city: string;
  postalCode: string;
  province: string;
}

interface AddressErrors {
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
}

function validateAddress(fields: AddressFields): AddressErrors {
  const errors: AddressErrors = {};
  if (!fields.street.trim()) errors.street = 'La calle y número son obligatorios.';
  if (!fields.city.trim()) errors.city = 'La ciudad es obligatoria.';
  if (!/^\d{5}$/.test(fields.postalCode)) errors.postalCode = 'El código postal debe tener 5 dígitos.';
  if (!fields.province.trim()) errors.province = 'La provincia es obligatoria.';
  return errors;
}

export default function CheckoutPage() {
  const { user, session } = useAuth();
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>('details');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const [name, setName] = useState(user?.user_metadata?.name ?? '');
  const [address, setAddress] = useState<AddressFields>({
    street: '',
    floor: '',
    city: '',
    postalCode: '',
    province: '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof AddressFields, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const addressErrors = validateAddress(address);

  if (!session) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Debes iniciar sesión para realizar tu pedido.</p>
          <Link href="/login" className="inline-block bg-brand-accent text-brand-bg px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step === 'details') {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-brand-muted mb-4">Tu carrito está vacío.</p>
          <Link href="/products" className="inline-block bg-brand-accent text-brand-bg px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  function handleAddressChange(field: keyof AddressFields, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur(field: keyof AddressFields) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function inputClass(field: keyof AddressErrors) {
    const hasError = touched[field] && addressErrors[field];
    return `w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-brand-primary focus:outline-none focus:ring-2 transition-colors ${
      hasError ? 'border-red-400 focus:ring-red-300' : 'border-brand-surface focus:ring-brand-accent'
    }`;
  }

  async function handleDetailsSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ street: true, city: true, postalCode: true, province: true });
    if (Object.keys(addressErrors).length > 0) return;

    setServerError(null);
    setLoading(true);

    const shippingAddress: ShippingAddress = {
      street: address.street.trim(),
      floor: address.floor.trim() || undefined,
      city: address.city.trim(),
      postalCode: address.postalCode.trim(),
      province: address.province.trim(),
    };

    try {
      const order = await createOrder(items, totalPrice, session!.access_token, shippingAddress);
      setPendingOrderId(order.id);
      setStep('payment');
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess(result: PaymentResult) {
    clear();
    router.push(`/order-confirmation?orderId=${pendingOrderId}&paymentId=${result.paymentId}`);
  }

  const steps = ['Datos de envío', 'Pago'];
  const currentStepIndex = step === 'details' ? 0 : 1;

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-editorial text-brand-primary mb-6">Finalizar pedido</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border-2 transition-colors ${
                i <= currentStepIndex
                  ? 'bg-brand-accent border-brand-accent text-brand-bg'
                  : 'bg-white border-brand-surface text-brand-muted'
              }`}>
                {i < currentStepIndex ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-sm font-medium ${i <= currentStepIndex ? 'text-brand-primary' : 'text-brand-muted'}`}>
                {label}
              </span>
              {i < steps.length - 1 && <div className="w-10 h-px bg-brand-surface mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {/* ── Left panel ── */}
          <div className="md:col-span-3">
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} noValidate className="space-y-5">
                {/* Personal */}
                <fieldset className="space-y-4">
                  <legend className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                    Datos personales
                  </legend>

                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1">Nombre completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full border border-brand-surface rounded-xl px-4 py-2.5 text-sm bg-white text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      readOnly
                      className="w-full border border-brand-surface rounded-xl px-4 py-2.5 text-sm bg-brand-surface text-brand-muted cursor-not-allowed"
                    />
                  </div>
                </fieldset>

                {/* Shipping address */}
                <fieldset className="space-y-4 pt-2">
                  <legend className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                    Dirección de envío
                  </legend>

                  {/* Street */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1">
                      Calle y número <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      onBlur={() => handleBlur('street')}
                      placeholder="Ej. Calle Mayor, 12"
                      autoComplete="address-line1"
                      className={inputClass('street')}
                    />
                    {touched.street && addressErrors.street && (
                      <p className="text-xs text-red-600 mt-1">{addressErrors.street}</p>
                    )}
                  </div>

                  {/* Floor (optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1">
                      Piso / Puerta <span className="text-brand-muted font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={address.floor}
                      onChange={(e) => handleAddressChange('floor', e.target.value)}
                      placeholder="Ej. 3º B"
                      autoComplete="address-line2"
                      className="w-full border border-brand-surface rounded-xl px-4 py-2.5 text-sm bg-white text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>

                  {/* City + Postal code */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-brand-muted mb-1">
                        Ciudad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
                        placeholder="Madrid"
                        autoComplete="address-level2"
                        className={inputClass('city')}
                      />
                      {touched.city && addressErrors.city && (
                        <p className="text-xs text-red-600 mt-1">{addressErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">
                        C.P. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                        onBlur={() => handleBlur('postalCode')}
                        placeholder="28001"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        className={inputClass('postalCode')}
                      />
                      {touched.postalCode && addressErrors.postalCode && (
                        <p className="text-xs text-red-600 mt-1">{addressErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted mb-1">
                      Provincia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.province}
                      onChange={(e) => handleAddressChange('province', e.target.value)}
                      onBlur={() => handleBlur('province')}
                      placeholder="Madrid"
                      autoComplete="address-level1"
                      className={inputClass('province')}
                    />
                    {touched.province && addressErrors.province && (
                      <p className="text-xs text-red-600 mt-1">{addressErrors.province}</p>
                    )}
                  </div>
                </fieldset>

                {serverError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-accent text-brand-bg py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                >
                  {loading ? 'Guardando...' : 'Continuar al pago →'}
                </button>
              </form>
            )}

            {step === 'payment' && pendingOrderId && (
              <PaymentForm
                orderId={pendingOrderId}
                amount={totalPrice}
                accessToken={session!.access_token}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep('details')}
              />
            )}
          </div>

          {/* ── Order summary ── */}
          <div className="md:col-span-2">
            <div className="bg-brand-surface rounded-2xl border border-brand-muted/20 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Resumen</h2>
              <ul className="space-y-3 text-sm text-brand-primary">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.name}{' '}
                      <span className="text-brand-muted">×{item.quantity}</span>
                    </span>
                    <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-brand-muted/20 mt-4 pt-4 flex justify-between font-bold text-brand-primary">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
            </div>

            {/* Info de envío y confianza */}
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 text-sm text-brand-muted">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <div>
                  <p className="font-medium text-brand-primary">Entrega en 3–5 días hábiles</p>
                  <p className="text-xs mt-0.5">Envío estándar a toda la península. Recibirás un email con el número de seguimiento.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-brand-muted">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <div>
                  <p className="font-medium text-brand-primary">Pago 100% seguro</p>
                  <p className="text-xs mt-0.5">Tus datos están protegidos en todo momento.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-brand-muted">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-accent" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <div>
                  <p className="font-medium text-brand-primary">Devolución sin preguntas</p>
                  <p className="text-xs mt-0.5">30 días para devolver si no estás satisfecho.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

