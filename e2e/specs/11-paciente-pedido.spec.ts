import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("paciente visualiza pedido", async ({ page }) => {
  await resetSession(page);
  await page.goto("/paciente/pedido/FIB-2026-001");

  await page.waitForTimeout(1500);
  await expect(page.getByText(/pedido|FIB-|marmita/i).first()).toBeVisible();

  const confirmar = page.getByRole("button", { name: /confirmar|prosseguir|pagar|continuar/i }).first();
  if (await confirmar.isVisible().catch(() => false)) {
    await confirmar.click();
    await page.waitForTimeout(1500);
  }
});
