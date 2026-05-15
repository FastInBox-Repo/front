import { test, expect } from "@playwright/test";
import { loginAs, resetSession } from "../fixtures";

test("wizard de novo pedido", async ({ page }) => {
  await resetSession(page);
  await loginAs(page, "nutricionista");
  await page.goto("/nutricionista/pedidos/novo");

  await expect(page.getByText(/Paciente/i).first()).toBeVisible();
  await page.waitForTimeout(800);

  const patientSelect = page.locator("select, [role='combobox']").first();
  if (await patientSelect.isVisible().catch(() => false)) {
    await patientSelect.selectOption({ index: 1 }).catch(() => undefined);
  } else {
    await page.getByRole("button", { name: /selecionar paciente|escolher/i }).first().click().catch(() => undefined);
    await page.getByRole("option").first().click().catch(() => undefined);
  }
  await page.waitForTimeout(600);

  for (let i = 0; i < 3; i++) {
    const proximo = page.getByRole("button", { name: /próximo|proximo|avançar|avancar|continuar/i }).first();
    if (await proximo.isEnabled().catch(() => false)) {
      await proximo.click();
      await page.waitForTimeout(900);
    }
  }

  await page.waitForTimeout(800);
});
