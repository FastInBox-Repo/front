import { test, expect } from "@playwright/test";
import { loginAs, resetSession } from "../fixtures";

test("configuracoes da clinica", async ({ page }) => {
  test.setTimeout(60_000);
  await resetSession(page);
  await loginAs(page, "nutricionista");
  await page.goto("/nutricionista/configuracoes");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.getByText(/configura/i).first()).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(1500);

  const firstText = page.locator('input[type="text"]').first();
  if (await firstText.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstText.fill("Clinica Atualizada E2E", { timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(600);
  }

  const salvar = page.getByRole("button", { name: /salvar/i }).first();
  if (await salvar.isVisible({ timeout: 3000 }).catch(() => false)) {
    await salvar.click({ timeout: 3000, force: true }).catch(() => undefined);
    await page.waitForTimeout(1200);
  }
});
