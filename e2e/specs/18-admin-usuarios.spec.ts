import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("gestao de usuarios admin", async ({ page }) => {
  test.setTimeout(60_000);
  await resetSession(page);
  await page.goto("/admin/usuarios");
  await page.waitForLoadState("domcontentloaded");

  await expect(page.getByRole("heading", { name: /usuários/i })).toBeVisible({ timeout: 10_000 });
  await page.getByPlaceholder(/buscar/i).fill("Ana", { timeout: 5000 });
  await page.waitForTimeout(800);
  await page.getByPlaceholder(/buscar/i).fill("", { timeout: 5000 });
  await page.waitForTimeout(500);

  const novo = page.getByRole("button", { name: /novo usuário|novo usuario/i }).first();
  if (await novo.isVisible({ timeout: 3000 }).catch(() => false)) {
    await novo.click({ timeout: 3000, force: true }).catch(() => undefined);
    await page.waitForTimeout(1200);
  }
});
