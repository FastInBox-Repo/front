import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type Role = "nutricionista" | "paciente" | "cozinha" | "admin";

export const credentials: Record<Role, { email: string; password: string }> = {
  nutricionista: { email: "ana@nutritionvida.com.br", password: "123456" },
  cozinha: { email: "fabrica@fastinbox.com.br", password: "123456" },
  admin: { email: "admin@fastinbox.com.br", password: "123456" },
  paciente: { email: "lucas.mendes@email.com", password: "123456" },
};

export const featureDescriptions: Record<string, string> = {
  "01-home-tracking": "Tour pela home pública: hero, fluxo, depoimentos, FAQ e rastreio de pedido por código.",
  "02-auth-login": "Login para três perfis (nutricionista, paciente, cozinha) e mensagem de erro com credencial inválida.",
  "03-auth-register": "Cadastro de novo paciente com validação dos campos obrigatórios.",
  "04-auth-forgot-password": "Solicitação de recuperação de senha e confirmação visual do envio.",
  "05-nutri-dashboard": "Dashboard do nutricionista com indicadores de pacientes, pedidos e produção.",
  "06-nutri-pacientes": "Listagem, busca e cadastro de pacientes no painel da clínica.",
  "07-nutri-novo-pedido": "Criação de novo pedido em wizard de quatro passos (paciente, marmitas, preços, revisão).",
  "08-nutri-pedido-resumo": "Resumo de pedido criado com código de acompanhamento e ações disponíveis.",
  "09-nutri-configuracoes": "Configurações da clínica com marca, perfil e preferências.",
  "10-paciente-landing": "Landing pública do paciente para consulta de pedidos por código.",
  "11-paciente-pedido": "Visualização e confirmação de pedido pelo paciente.",
  "12-paciente-pagamento": "Fluxo de pagamento com escolha entre PIX, cartão e boleto.",
  "13-paciente-status": "Timeline de status do pedido após pagamento.",
  "14-cozinha-login": "Login dedicado da fábrica de produção.",
  "15-cozinha-dashboard": "Painel da cozinha com pedidos por etapa de produção.",
  "16-cozinha-pedido": "Atualização do status de preparo e envio para entrega.",
  "17-admin-dashboard": "Dashboard administrativo com visão global da operação.",
  "18-admin-usuarios": "Gestão de usuários e papéis na plataforma.",
  "19-admin-pedidos": "Auditoria global de pedidos por clínica.",
  "20-admin-auditoria": "Trilha de auditoria com filtros por ator, tipo e período.",
  "21-admin-diagnostico": "Diagnóstico de sistema com checagens automáticas.",
  "22-admin-configuracoes": "Configurações globais e parâmetros operacionais.",
};

export async function resetSession(page: Page) {
  await page.context().clearCookies();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {}
  });
}

export async function loginAs(page: Page, role: Role) {
  if (role === "admin") {
    await page.goto("/admin/dashboard");
    return;
  }
  const { email, password } = credentials[role];
  await page.goto(`/login?role=${role}`);
  await page.waitForLoadState("domcontentloaded");

  const roleLabel = role === "cozinha" ? /fábrica|fabrica/i : new RegExp(role, "i");
  const roleRadio = page.getByRole("radio", { name: roleLabel }).first();
  if (await roleRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await roleRadio.click({ force: true }).catch(() => undefined);
  } else {
    await page.getByRole("button", { name: roleLabel }).first().click({ force: true }).catch(() => undefined);
  }

  await page.getByPlaceholder("seu@email.com.br").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 }).catch(() => undefined),
    page.locator('form button[type="submit"]').first().click(),
  ]);
}

export async function expectVisible(page: Page, ...texts: (string | RegExp)[]) {
  for (const text of texts) {
    await expect(page.getByText(text).first()).toBeVisible({ timeout: 15_000 });
  }
}

