# FastInBox E2E

Playwright suite covering every feature of the FastInBox platform. Each spec records a single MP4/WEBM video that is later assembled into a static site published on GitHub Pages.

## Stack

- `@playwright/test` running headed Chromium 1280x720
- Backend NestJS (in-memory) + Next.js front are booted automatically via `webServer`
- Custom reporter `e2e/reporter/site-reporter.ts` collects all videos and produces a publishable static report under `e2e/.report-site/`

## Running

```bash
# from front/
npm install
npx playwright install chromium

# full suite (boots back + front automatically)
npx playwright test

# only one feature
npx playwright test e2e/specs/02-auth-login.spec.ts

# headed, slow-motion debug
E2E_SLOWMO=200 npx playwright test --headed

# skip backend (front works standalone with local sprintStore)
E2E_SKIP_BACKEND=true npx playwright test
```

## Output

- `e2e/.artifacts/` — Playwright raw artefacts (videos, traces, screenshots)
- `e2e/.report-html/` — Playwright HTML report
- `e2e/.report-site/` — Static site ready for GitHub Pages (used by the publish workflow)

## Publishing

The static report is pushed into the existing `docs` repository under `documents/e2e-report/`, which is already served by GitHub Pages via `.github/workflows/deploy-pages.yml`.

Local manual publish:

```bash
node e2e/reporter/publish-to-docs.mjs /Users/<you>/Documents/Code/FastInBox/docs
```

CI: `.github/workflows/e2e.yml` runs the suite on every push to `main` and opens a PR on the docs repo using `DOCS_DEPLOY_TOKEN`.

## Coverage

| Area | Spec | Feature |
|------|------|---------|
| Público | `01-home-tracking.spec.ts` | Home pública + rastreio de pedido |
| Público | `02-auth-login.spec.ts` | Login multi-perfil (nutricionista, paciente, cozinha) |
| Público | `03-auth-register.spec.ts` | Cadastro de novo perfil |
| Público | `04-auth-forgot-password.spec.ts` | Recuperação de senha |
| Nutricionista | `05-nutri-dashboard.spec.ts` | Dashboard com indicadores e atividade |
| Nutricionista | `06-nutri-pacientes.spec.ts` | Listar e cadastrar pacientes |
| Nutricionista | `07-nutri-novo-pedido.spec.ts` | Criar pedido personalizado |
| Nutricionista | `08-nutri-pedido-resumo.spec.ts` | Resumo + envio do pedido |
| Nutricionista | `09-nutri-configuracoes.spec.ts` | Configurações da clínica |
| Paciente | `10-paciente-landing.spec.ts` | Área do paciente |
| Paciente | `11-paciente-pedido.spec.ts` | Visualizar e confirmar pedido |
| Paciente | `12-paciente-pagamento.spec.ts` | Fluxo de pagamento (PIX/cartão/boleto) |
| Paciente | `13-paciente-status.spec.ts` | Acompanhar status / timeline |
| Cozinha | `14-cozinha-login.spec.ts` | Login da fábrica |
| Cozinha | `15-cozinha-dashboard.spec.ts` | Painel de produção |
| Cozinha | `16-cozinha-pedido.spec.ts` | Atualizar status de preparo |
| Admin | `17-admin-dashboard.spec.ts` | Dashboard administrativo |
| Admin | `18-admin-usuarios.spec.ts` | Usuários e papéis |
| Admin | `19-admin-pedidos.spec.ts` | Auditoria de pedidos |
| Admin | `20-admin-auditoria.spec.ts` | Trilha de auditoria |
| Admin | `21-admin-diagnostico.spec.ts` | Diagnóstico de sistema |
| Admin | `22-admin-configuracoes.spec.ts` | Configurações globais |
