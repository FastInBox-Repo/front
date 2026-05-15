import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("admin diagnostico de sistema", async ({ page }) => {
  await resetSession(page);
  await page.goto("/admin/diagnostico");
  await page.waitForTimeout(1500);
  await expect(page.getByText(/diagnóstico|diagnostico|saúde|saude|checagem/i).first()).toBeVisible();

  const refresh = page.getByRole("button", { name: /atualizar|verificar|rodar|executar/i }).first();
  if (await refresh.isVisible().catch(() => false)) {
    await refresh.click();
    await page.waitForTimeout(1500);
  }
});
