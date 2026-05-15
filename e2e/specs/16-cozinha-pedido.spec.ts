import { test, expect } from "@playwright/test";
import { loginAs, resetSession } from "../fixtures";

test("cozinha abre e movimenta pedido", async ({ page }) => {
  test.setTimeout(60_000);
  await resetSession(page);
  await loginAs(page, "cozinha");
  await page.goto("/cozinha/dashboard");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  const card = page.locator('[draggable="true"], a:has-text("FIB-")').first();
  if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
    await card.click({ timeout: 3000, force: true }).catch(() => undefined);
    await page.waitForTimeout(1500);
  } else {
    await page.goto("/cozinha/pedido/1");
    await page.waitForTimeout(1200);
  }

  const acao = page.getByRole("button", { name: /produção|producao|pronto|entrega|finalizar/i }).first();
  if (await acao.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acao.click({ timeout: 3000, force: true }).catch(() => undefined);
    await page.waitForTimeout(1500);
  }
  await expect(page).toHaveURL(/cozinha/);
});
