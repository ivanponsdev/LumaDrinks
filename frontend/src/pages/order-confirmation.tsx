import { useRouter } from 'next/router';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { orderId } = router.query;

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Checkmark icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-surface mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-brand-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-editorial text-brand-primary mb-3">¡Pedido confirmado!</h1>
        <p className="text-brand-muted mb-2">
          Gracias por tu compra. Tu pedido está siendo procesado.
        </p>

        {orderId && (
          <p className="text-sm text-brand-muted mb-8">
            Referencia:{' '}
            <span className="font-mono text-brand-primary">{orderId}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-block bg-brand-accent text-brand-bg px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity text-sm uppercase tracking-widest"
          >
            Seguir comprando
          </Link>
          <Link
            href="/orders"
            className="inline-block border-2 border-brand-primary text-brand-primary px-6 py-2.5 rounded-full font-bold hover:bg-brand-primary hover:text-brand-bg transition-all text-sm uppercase tracking-widest"
          >
            Ver mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
