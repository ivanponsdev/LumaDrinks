/* pages/admin/products.tsx — Gestión de catálogo */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../../services/api';
import { ApiProduct } from '../../hooks/useProducts';

// El producto tal como lo devuelve la API (incluye ingredients que no está en ApiProduct)
interface Product extends ApiProduct {
  ingredients?: string[];
}

// Estado del formulario: todos los campos como string para los inputs
interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  benefits: string;    // una por línea
  ingredients: string; // uno por línea
  stock: string;
  image_url: string;
}

const EMPTY_FORM: ProductForm = {
  name: '', description: '', price: '', category: 'Enfoque',
  benefits: '', ingredients: '', stock: '', image_url: '',
};

const CATEGORIES = ['Enfoque', 'Claridad', 'Zen', 'Social'];

const CATEGORY_LABEL: Record<string, string> = {
  Enfoque: 'Focus', Claridad: 'Clarity', Zen: 'Zen', Social: 'Social',
};

// ── Estilos compartidos ───────────────────────────────────────
const INPUT_CLS = [
  'w-full border border-brand-surface rounded-lg px-3 py-2 text-sm text-brand-primary',
  'focus:outline-none focus:ring-2 focus:ring-brand-accent/40 bg-white',
].join(' ');

// ── Sub-componentes ───────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────
export default function AdminProductsPage() {
  const { session, role, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Estado del modal de creación / edición
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Estado de la confirmación de borrado
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!session) { router.replace('/login?redirect=/admin/products'); return; }
    if (role !== null && role !== 'admin') { router.replace('/'); return; }
    loadProducts();
  }, [session, authLoading, role]);

  // ── Carga de productos ────────────────────────────────────
  async function loadProducts() {
    setLoading(true);
    setPageError(null);
    try {
      const data = await getProducts();
      setProducts(data as Product[]);
    } catch {
      setPageError('No se pudieron cargar los productos. Comprueba que el backend está activo.');
    } finally {
      setLoading(false);
    }
  }

  // ── Abrir modal ───────────────────────────────────────────
  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      benefits: Array.isArray(product.benefits) ? product.benefits.join('\n') : '',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join('\n') : '',
      stock: product.stock != null ? String(product.stock) : '',
      image_url: product.image_url ?? '',
    });
    setFormError(null);
    setShowModal(true);
  }

  // ── Guardar (crear o actualizar) ──────────────────────────
  async function handleSave() {
    if (!form.name.trim() || !form.description.trim() || !form.price) {
      setFormError('Nombre, descripción y precio son obligatorios.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        benefits: form.benefits.split('\n').map((s) => s.trim()).filter(Boolean),
        ingredients: form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean),
        stock: form.stock ? parseInt(form.stock, 10) : 0,
        image_url: form.image_url.trim() || null,
      };
      if (editing) {
        await adminUpdateProduct(String(editing.id), payload, session!.access_token);
      } else {
        await adminCreateProduct(payload, session!.access_token);
      }
      setShowModal(false);
      await loadProducts();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg[0] : (msg ?? 'Error al guardar el producto.'));
    } finally {
      setSaving(false);
    }
  }

  // ── Eliminar ──────────────────────────────────────────────
  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(String(pendingDelete.id), session!.access_token);
      setPendingDelete(null);
      await loadProducts();
    } catch {
      setPageError('No se pudo eliminar el producto.');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  // ── Render: loading / error ───────────────────────────────
  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-4 border-brand-surface border-t-brand-accent animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* ── Cabecera de página ── */}
      <div className="bg-white border-b border-brand-surface px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">
            Gestión de catálogo
          </p>
          <h1 className="text-2xl font-editorial text-brand-primary">Productos</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-accent text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo producto
        </button>
      </div>

      <div className="px-8 py-6">
        {pageError && (
          <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{pageError}</p>
        )}

        {/* ── Tabla de productos ── */}
        <div className="bg-white rounded-2xl border border-brand-surface shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-brand-surface bg-brand-bg">
                {['Producto', 'Categoría', 'Precio', 'Stock', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-brand-surface/50 hover:bg-brand-bg/50 transition-colors"
                >
                  <td className="px-5 py-3 max-w-[260px]">
                    <p className="font-medium text-brand-primary truncate">{p.name}</p>
                    <p className="text-xs text-brand-muted line-clamp-1 mt-0.5">{p.description}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-surface text-brand-muted px-2.5 py-1 rounded-full">
                      {CATEGORY_LABEL[p.category] ?? p.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-brand-primary whitespace-nowrap">
                    {Number(p.price).toFixed(2)} €
                  </td>
                  <td className="px-5 py-3 text-brand-muted">
                    {p.stock != null ? p.stock : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setPendingDelete(p)}
                        className="text-xs px-3 py-1.5 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-brand-surface transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-brand-muted text-sm">
                    No hay productos. Crea el primero con el botón de arriba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: crear / editar producto ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-brand-surface flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-editorial text-brand-primary">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-muted hover:text-brand-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Campos */}
            <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
              {formError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{formError}</p>
              )}

              <Field label="Nombre *">
                <input
                  className={INPUT_CLS}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Pack Focus Luma"
                />
              </Field>

              <Field label="Descripción *">
                <textarea
                  className={`${INPUT_CLS} resize-none`}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción del producto..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio (€) *">
                  <input
                    className={INPUT_CLS}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="29.99"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    className={INPUT_CLS}
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="100"
                  />
                </Field>
              </div>

              <Field label="Categoría">
                <select
                  className={INPUT_CLS}
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Beneficios (uno por línea)">
                <textarea
                  className={`${INPUT_CLS} resize-none`}
                  rows={3}
                  value={form.benefits}
                  onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))}
                  placeholder={'Mejora el foco\nSin bajones\n4-6h energía'}
                />
              </Field>

              <Field label="Ingredientes (uno por línea)">
                <textarea
                  className={`${INPUT_CLS} resize-none`}
                  rows={3}
                  value={form.ingredients}
                  onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
                  placeholder={'L-Teanina 200mg\nCafeína 100mg'}
                />
              </Field>

              <Field label="URL de imagen">
                <input
                  className={INPUT_CLS}
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-brand-surface flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-brand-muted hover:text-brand-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold bg-brand-accent text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: confirmar eliminación ── */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-editorial text-brand-primary mb-2">
              ¿Eliminar producto?
            </h3>
            <p className="text-sm text-brand-muted mb-6">
              <span className="font-medium text-brand-primary">{pendingDelete.name}</span>{' '}
              se eliminará de forma permanente. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-brand-muted hover:text-brand-primary transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
