import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("landing do paciente", async ({ page }) => {
  await resetSession(page);
  await page.goto("/paciente");

  await expect(page.getByText(/pedido|FastInBox/i).first()).toBeVisible();
  const codeInput = page.locator('input').first();
  await codeInput.fill("FIB-2026-001");
  const submitBtn = page.getByRole("button").filter({ hasText: /buscar|consultar|abrir|enviar|continuar/i }).first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
  } else {
    await codeInput.press("Enter");
  }
  await page.waitForTimeout(1500);
});
