import { test, expect } from "@playwright/test";
import { loginAs, resetSession } from "../fixtures";

test("resumo de pedido existente", async ({ page }) => {
  await resetSession(page);
  await loginAs(page, "nutricionista");
  await page.goto("/nutricionista/dashboard");

  const pedidoLink = page.getByRole("link", { name: /FIB-/i }).first();
  if (await pedidoLink.isVisible().catch(() => false)) {
    await pedidoLink.click();
    await page.waitForTimeout(1500);
  } else {
    await page.goto("/nutricionista/pedidos/1");
  }
  await page.waitForTimeout(1500);
  await expect(page.getByText(/pedido|resumo|status/i).first()).toBeVisible();
});
