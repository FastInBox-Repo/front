import { test, expect } from "@playwright/test";
import { loginAs, resetSession } from "../fixtures";

test("dashboard do nutricionista", async ({ page }) => {
  await resetSession(page);
  await loginAs(page, "nutricionista");
  await page.waitForURL(/\/nutricionista/, { timeout: 20_000 });

  await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  await expect(page.getByText(/Total de pacientes|Pacientes/i).first()).toBeVisible();
  await expect(page.getByText(/Faturamento|Pagos/i).first()).toBeVisible();

  await page.waitForTimeout(1200);
  await page.getByRole("link", { name: /pacientes/i }).first().click().catch(() => undefined);
  await page.waitForTimeout(1000);
  await page.goBack().catch(() => undefined);
});
