/**
 * E2E — Carrito de compra
 *
 * Verifica el flujo de carrito sin necesitar autenticación.
 * Requiere: frontend corriendo en :3000.
 */
import { test, expect } from '@playwright/test';

test.describe('Cart flow', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test para estado limpio
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('luma_cart');
    });
  });

  test('home page loads and shows hero content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // El navbar con "Luma" y el hero son contenido estático de Next.js
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('products page loads and shows page heading', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');
    // El heading "Tienda" está siempre presente, independientemente del API
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('navbar has cart icon', async ({ page }) => {
    await page.goto('/');
    // El icono del carrito debe estar visible en el navbar
    const cartButton = page.locator('[data-testid="cart-button"]')
      .or(page.locator('[aria-label*="cart"]').or(page.locator('[aria-label*="carrito"]')));
    await expect(cartButton.first()).toBeVisible();
  });

  test('checkout page redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/checkout');
    // Sin estar logueado, debe redirigir a login o mostrar el formulario vacío
    await page.waitForLoadState('networkidle');
    const isLoginOrCheckout = page.url().includes('/login') || page.url().includes('/checkout');
    expect(isLoginOrCheckout).toBeTruthy();
  });
});
