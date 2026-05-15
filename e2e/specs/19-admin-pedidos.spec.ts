import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("admin auditoria de pedidos", async ({ page }) => {
  await resetSession(page);
  await page.goto("/admin/pedidos");
  await page.waitForTimeout(1500);
  await expect(page.getByText(/pedidos/i).first()).toBeVisible();

  const filtro = page.locator("select, [role='combobox']").first();
  if (await filtro.isVisible().catch(() => false)) {
    await filtro.selectOption({ index: 1 }).catch(() => undefined);
    await page.waitForTimeout(800);
  }
});
