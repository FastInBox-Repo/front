import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("paciente escolhe metodo de pagamento", async ({ page }) => {
  await resetSession(page);
  await page.goto("/paciente/pedido/FIB-2026-001/pagamento");

  await page.waitForTimeout(1500);
  await expect(page.getByText(/pagamento|PIX|cartão|cartao|boleto/i).first()).toBeVisible();

  for (const metodo of [/PIX/i, /cartão|cartao/i, /boleto/i]) {
    const btn = page.getByRole("button", { name: metodo }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => undefined);
      await page.waitForTimeout(900);
    }
  }

  const pagar = page.getByRole("button", { name: /pagar|finalizar|confirmar/i }).first();
  if (await pagar.isVisible().catch(() => false)) {
    await pagar.click().catch(() => undefined);
    await page.waitForTimeout(2000);
  }
});
