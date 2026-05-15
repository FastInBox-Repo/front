import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("timeline de status do pedido", async ({ page }) => {
  await resetSession(page);
  await page.goto("/paciente/pedido/FIB-2026-001/status");
  await page.waitForTimeout(1500);
  await expect(page.getByText(/status|produção|producao|entrega|preparo/i).first()).toBeVisible();
  await page.waitForTimeout(2000);
});
