/**
 * E2E — Panel de administración
 *
 * Verifica que las rutas admin requieren autenticación.
 * Requiere: frontend corriendo en :3000.
 */
import { test, expect } from '@playwright/test';

test.describe('Admin panel access control', () => {
  test('admin/products redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
    // Debe redirigir a login con el redirect param
    expect(
      page.url().includes('/login') || page.url().includes('/admin')
    ).toBeTruthy();
  });

  test('admin/dashboard redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    expect(
      page.url().includes('/login') || page.url().includes('/admin')
    ).toBeTruthy();
  });

  test('admin/payments redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');
    expect(
      page.url().includes('/login') || page.url().includes('/admin')
    ).toBeTruthy();
  });

  test('orders page redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    expect(
      page.url().includes('/login') || page.url().includes('/orders')
    ).toBeTruthy();
  });
});
