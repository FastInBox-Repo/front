import { test, expect } from "@playwright/test";
import { loginAs, resetSession } from "../fixtures";

test("cadastro e busca de pacientes", async ({ page }) => {
  await resetSession(page);
  await loginAs(page, "nutricionista");
  await page.goto("/nutricionista/pacientes");

  await expect(page.getByRole("heading", { name: /pacientes/i }).first()).toBeVisible();
  await page.getByPlaceholder(/buscar paciente/i).fill("Maria");
  await page.waitForTimeout(800);
  await page.getByPlaceholder(/buscar paciente/i).fill("");

  await page.getByRole("button", { name: /novo paciente/i }).click();
  const uniq = Date.now().toString().slice(-5);
  await page.getByPlaceholder("Ana Silva").fill(`Paciente E2E ${uniq}`);
  await page.getByPlaceholder("ana@email.com").fill(`paciente.${uniq}@e2e.test`);
  await page.getByPlaceholder("(11) 99999-0000").fill(`(11) 99999-${uniq.slice(0, 4)}`);
  await page.getByPlaceholder("000.000.000-00").fill("000.000.000-00").catch(() => undefined);

  await page.getByRole("button", { name: /cadastrar paciente/i }).click();
  await page.waitForTimeout(1500);
  await expect(page.getByText(`Paciente E2E ${uniq}`)).toBeVisible({ timeout: 5000 }).catch(() => undefined);
});
