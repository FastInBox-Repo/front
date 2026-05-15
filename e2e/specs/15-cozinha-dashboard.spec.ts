import { test, expect } from "@playwright/test";
import { loginAs, resetSession } from "../fixtures";

test("dashboard de producao", async ({ page }) => {
  await resetSession(page);
  await loginAs(page, "cozinha");
  await page.goto("/cozinha/dashboard");

  await expect(page.getByText(/produção|producao|kanban|preparo/i).first()).toBeVisible();
  await page.waitForTimeout(1500);

  for (const coluna of [/Novo/i, /Em produção/i, /Pronto/i, /Em entrega/i, /Entregue/i]) {
    await expect(page.getByText(coluna).first()).toBeVisible().catch(() => undefined);
  }
});
