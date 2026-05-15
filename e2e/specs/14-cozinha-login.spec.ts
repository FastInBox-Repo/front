import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("login da fabrica", async ({ page }) => {
  await resetSession(page);
  await page.goto("/cozinha/login");

  await expect(page.getByText(/Acesso Cozinha|produção|producao/i).first()).toBeVisible();
  await page.locator('input').nth(0).fill("cozinha");
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: /entrar|acessar/i }).first().click();
  await page.waitForURL(/\/cozinha\/dashboard/, { timeout: 15_000 });
});
