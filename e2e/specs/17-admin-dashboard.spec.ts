import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("dashboard administrativo", async ({ page }) => {
  await resetSession(page);
  await page.goto("/admin/dashboard");
  await expect(page.getByText(/Administração|Admin/i).first()).toBeVisible();
  await expect(page.getByText(/Faturamento|Pedidos|Pacientes/i).first()).toBeVisible();
  await page.waitForTimeout(2000);
});
