import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("recuperacao de senha", async ({ page }) => {
  await resetSession(page);
  await page.goto("/recuperar-senha");

  await expect(page.getByRole("heading", { name: /recuperar senha/i })).toBeVisible();
  await page.getByPlaceholder("seu@email.com.br").fill("ana@nutritionvida.com.br");
  await page.getByRole("button", { name: /enviar link/i }).click();

  await expect(page.getByText(/E-mail enviado/i)).toBeVisible({ timeout: 5000 });
  await page.getByRole("link", { name: /voltar ao login/i }).first().click();
  await expect(page).toHaveURL(/\/login/);
});
