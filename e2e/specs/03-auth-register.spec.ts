import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("cadastro de novo paciente", async ({ page }) => {
  test.setTimeout(60_000);
  await resetSession(page);
  await page.goto("/login?role=paciente");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  await page.locator('[role="tab"]', { hasText: /^Cadastrar$/ }).click({ force: true, timeout: 8000 });
  await page.waitForTimeout(600);

  await page.locator('[role="radio"]', { hasText: /Paciente/i }).first().click({ force: true }).catch(() => undefined);

  const uniq = Date.now().toString().slice(-6);
  await page.locator('input[placeholder="Seu nome"]').fill(`Paciente Teste ${uniq}`);
  await page.locator('input[placeholder="(11) 99999-0000"]').fill(`(11) 9${uniq}-0000`).catch(() => undefined);
  await page.locator('input[placeholder="Ex: Hipertrofia, emagrecimento"]').fill("Emagrecimento").catch(() => undefined);
  await page.getByPlaceholder("seu@email.com.br").fill(`paciente.${uniq}@fastinbox.com.br`);
  await page.getByPlaceholder("••••••••").fill("123456");

  await page.getByRole("button", { name: /criar conta/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
  await expect(page).toHaveURL(/\/paciente/);
});
