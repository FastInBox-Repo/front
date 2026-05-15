import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("home publica e rastreio de pedido", async ({ page }) => {
  await resetSession(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Marmitas personalizadas/i).first()).toBeVisible();

  await page.getByRole("link", { name: /como funciona/i }).first().click().catch(() => undefined);
  await page.waitForTimeout(800);
  await page.getByRole("link", { name: /benefícios|beneficios/i }).first().click().catch(() => undefined);
  await page.waitForTimeout(800);
  await page.getByRole("link", { name: /perguntas frequentes/i }).first().click().catch(() => undefined);
  await page.waitForTimeout(800);

  const faqBtn = page.getByRole("button", { name: /Preciso instalar/i }).first();
  if (await faqBtn.isVisible().catch(() => false)) {
    await faqBtn.click();
    await page.waitForTimeout(500);
  }

  const trackingInput = page.getByPlaceholder(/FIB-/i).first();
  await trackingInput.fill("FIB-2026-001");
  await page.getByRole("button", { name: /abrir status/i }).first().click();
  await page.waitForTimeout(1500);
  await expect(page).toHaveURL(/\/paciente\/pedido\//);
});
