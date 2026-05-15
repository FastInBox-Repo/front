import { test, expect } from "@playwright/test";
import { credentials, resetSession } from "../fixtures";

test("login para tres perfis distintos", async ({ page }) => {
  for (const role of ["nutricionista", "paciente", "cozinha"] as const) {
    await resetSession(page);
    await page.goto(`/login?role=${role}`);

    const roleLabel = role === "cozinha" ? /fábrica|fabrica/i : new RegExp(role, "i");
    const radio = page.getByRole("radio", { name: roleLabel }).first();
    if (await radio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await radio.click({ force: true }).catch(() => undefined);
    } else {
      await page.getByRole("button", { name: roleLabel }).first().click({ force: true }).catch(() => undefined);
    }

    await page.getByPlaceholder("seu@email.com.br").fill(credentials[role].email);
    await page.getByPlaceholder("••••••••").fill(credentials[role].password);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
    await page.waitForTimeout(800);
  }

  await resetSession(page);
  await page.goto("/login?role=nutricionista");
  await page.getByPlaceholder("seu@email.com.br").fill("ninguem@fastinbox.com.br");
  await page.getByPlaceholder("••••••••").fill("senha-errada");
  await page.locator('form button[type="submit"]').first().click();
  await page.waitForTimeout(1800);
  await expect(page).toHaveURL(/\/login/);
});
