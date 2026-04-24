/**
 * Script de captura de evidências - Sprint 2
 *
 * Executa o fluxo E2E via chrome-remote-protocol + Chrome headless e gera
 * screenshots PNG para o documento de evidências do GitHub Pages.
 *
 * Requer: Google Chrome instalado em /Applications/Google Chrome.app
 *
 * Uso:
 *   node scripts/capture-evidencias.mjs
 *
 * Pressupõe o dev server rodando em http://localhost:3001.
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import net from "node:net";
import http from "node:http";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEBUG_PORT = 9222;
const BASE_URL = "http://localhost:3001";
const OUTPUT_DIR = resolve(
  process.cwd(),
  "../docs/documents/evidencias-sprint-2",
);

const VIEWPORT_WIDE = { width: 1440, height: 900 };
const VIEWPORT_MOBILE = { width: 420, height: 820 };

const SPRINT_STATE_KEY = "fastinbox-sprint1-state-v1";
const AUDIT_KEY = "fastinbox-sprint2-audit-v1";

const _nowIso = () => new Date().toISOString();

const seedAudit = [
  {
    id: "evt-seed-1",
    type: "login",
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    actorId: "nut-1",
    actorName: "Dra. Ana Carvalho",
    actorRole: "nutricionista",
    description: "Dra. Ana Carvalho entrou na plataforma",
  },
  {
    id: "evt-seed-2",
    type: "patient_created",
    createdAt: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
    actorId: "nut-1",
    actorName: "Dra. Ana Carvalho",
    actorRole: "nutricionista",
    targetId: "p-seed-1",
    description: "Paciente Carla Menezes cadastrado",
    metadata: { goal: "Hipertrofia", restrictions: "Nenhuma" },
  },
  {
    id: "evt-seed-3",
    type: "order_created",
    createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    actorId: "nut-1",
    actorName: "Dra. Ana Carvalho",
    actorRole: "nutricionista",
    targetId: "ord-seed-1",
    targetCode: "FIB-2026-118",
    description: "Pedido FIB-2026-118 criado para Carla Menezes",
    metadata: { total: 24800, items: 5 },
  },
  {
    id: "evt-seed-4",
    type: "order_paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    actorId: "pat-seed-1",
    actorName: "Carla Menezes",
    actorRole: "paciente",
    targetId: "ord-seed-1",
    targetCode: "FIB-2026-118",
    description: "FIB-2026-118 pago via PIX",
    metadata: { total: 24800, method: "pix" },
  },
  {
    id: "evt-seed-5",
    type: "order_status_changed",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actorId: "fac-1",
    actorName: "Fabrica Central FastInBox",
    actorRole: "cozinha",
    targetId: "ord-seed-1",
    targetCode: "FIB-2026-118",
    description: "FIB-2026-118: Pago -> Em Produção",
    metadata: { from: "pago", to: "em_producao" },
  },
  {
    id: "evt-seed-6",
    type: "order_status_changed",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    actorId: "fac-1",
    actorName: "Fabrica Central FastInBox",
    actorRole: "cozinha",
    targetId: "ord-seed-1",
    targetCode: "FIB-2026-118",
    description: "FIB-2026-118: Em Produção -> Pronto",
    metadata: { from: "em_producao", to: "pronto" },
  },
  {
    id: "evt-seed-7",
    type: "login_failed",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    actorId: null,
    actorName: "visitante@exemplo.com",
    actorRole: "nutricionista",
    description: "Tentativa de login sem sucesso (perfil nutricionista)",
  },
];

async function waitForPort(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolveCheck, reject) => {
        const socket = net.connect({ port }, () => {
          socket.end();
          resolveCheck();
        });
        socket.on("error", reject);
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw new Error(`Timeout esperando Chrome debug port ${port}`);
}

async function cdpFetch(path) {
  return new Promise((resolveFetch, reject) => {
    http
      .get(`http://127.0.0.1:${DEBUG_PORT}${path}`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolveFetch(JSON.parse(body));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

async function _cdpPut(path) {
  return new Promise((resolveFetch, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port: DEBUG_PORT, path, method: "PUT" },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolveFetch(body ? JSON.parse(body) : {});
          } catch {
            resolveFetch({});
          }
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

class CdpSession {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve: res, reject: rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
      } else if (msg.method) {
        const subs = this.listeners.get(msg.method);
        if (subs) subs.forEach((cb) => cb(msg.params));
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((res, rej) => {
      this.pending.set(id, { resolve: res, reject: rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, cb) {
    const subs = this.listeners.get(method) ?? new Set();
    subs.add(cb);
    this.listeners.set(method, subs);
    return () => subs.delete(cb);
  }

  async waitFor(method) {
    return new Promise((res) => {
      const unsubscribe = this.on(method, (params) => {
        unsubscribe();
        res(params);
      });
    });
  }

  close() {
    this.ws.close();
  }
}

async function openCdpSession(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", () => res(), { once: true });
    ws.addEventListener("error", (err) => rej(err), { once: true });
  });
  return new CdpSession(ws);
}

async function ensureDataSeed(session) {
  const statePayload = {
    clinic: {
      id: "clinic-1",
      name: "Clínica Nutrition Vida",
      logoUrl: "",
      primaryColor: "#0a0a0a",
      nutritionistName: "Dra. Ana Carvalho",
      nutritionistCRN: "CRN-3 12345",
      email: "ana@nutritionvida.com.br",
      phone: "(11) 99999-0000",
      address: "Av. Paulista, 1000 — São Paulo, SP",
    },
    users: [
      {
        id: "nut-1",
        role: "nutricionista",
        name: "Dra. Ana Carvalho",
        email: "ana@nutritionvida.com.br",
        password: "123456",
        clinicName: "Clínica Nutrition Vida",
        nutritionistCRN: "CRN-3 12345",
      },
      {
        id: "fac-1",
        role: "cozinha",
        name: "Fabrica Central FastInBox",
        email: "fabrica@fastinbox.com.br",
        password: "123456",
        factoryName: "Fabrica Central FastInBox",
      },
      {
        id: "admin-1",
        role: "admin",
        name: "Admin FastInBox",
        email: "admin@fastinbox.com.br",
        password: "123456",
      },
      {
        id: "pat-seed-1",
        role: "paciente",
        name: "Carla Menezes",
        email: "carla.menezes@email.com",
        password: "123456",
        linkedPatientId: "p-seed-1",
      },
    ],
    patients: [
      {
        id: "p-seed-1",
        name: "Carla Menezes",
        email: "carla.menezes@email.com",
        phone: "(11) 98888-7777",
        cpf: "111.222.333-44",
        birthDate: "1992-06-10",
        goal: "Hipertrofia",
        restrictions: "Nenhuma",
        createdAt: "2026-04-10",
        ordersCount: 1,
      },
      {
        id: "p-seed-2",
        name: "Rafael Souza",
        email: "rafael.souza@email.com",
        phone: "(11) 97654-3210",
        cpf: "456.789.123-00",
        birthDate: "1988-03-30",
        goal: "Manutenção e saúde",
        restrictions: "Nenhuma",
        createdAt: "2026-03-15",
        ordersCount: 2,
      },
    ],
    orders: [
      {
        id: "ord-seed-1",
        code: "FIB-2026-118",
        patientId: "p-seed-1",
        patientName: "Carla Menezes",
        nutritionistId: "nut-1",
        nutritionistName: "Dra. Ana Carvalho",
        clinicName: "Clínica Nutrition Vida",
        items: [
          {
            id: "item-seed-1",
            name: "Marmita Hipertrofia",
            ingredients: [
              { id: "ing-1", name: "Frango grelhado", category: "proteina", quantity: "180g" },
              { id: "ing-2", name: "Arroz integral", category: "carboidrato", quantity: "100g" },
              { id: "ing-3", name: "Brócolis", category: "vegetal", quantity: "80g" },
            ],
            packaging: "Embalagem 1000ml",
            observations: "Sem sal adicional.",
            quantity: 5,
          },
        ],
        basePrice: 20000,
        finalPrice: 24800,
        margin: 4800,
        status: "pronto",
        nutritionalObservations: "Ganho de massa muscular.",
        deliveryDate: "2026-04-26",
        paymentMethod: "pix",
        createdAt: "2026-04-22",
        paidAt: "2026-04-22",
        allowEditing: false,
        factoryId: "fac-1",
        factoryName: "Fabrica Central FastInBox",
        patientUserId: "pat-seed-1",
      },
      {
        id: "ord-seed-2",
        code: "FIB-2026-119",
        patientId: "p-seed-2",
        patientName: "Rafael Souza",
        nutritionistId: "nut-1",
        nutritionistName: "Dra. Ana Carvalho",
        clinicName: "Clínica Nutrition Vida",
        items: [
          {
            id: "item-seed-2",
            name: "Marmita Equilíbrio",
            ingredients: [
              { id: "ing-4", name: "Salmão assado", category: "proteina", quantity: "160g" },
              { id: "ing-5", name: "Batata-doce", category: "carboidrato", quantity: "120g" },
            ],
            packaging: "Embalagem 900ml",
            observations: "Temperos naturais apenas.",
            quantity: 7,
          },
        ],
        basePrice: 22000,
        finalPrice: 27300,
        margin: 5300,
        status: "em_producao",
        nutritionalObservations: "Cardápio balanceado.",
        deliveryDate: "2026-04-28",
        paymentMethod: "pix",
        createdAt: "2026-04-23",
        paidAt: "2026-04-23",
        allowEditing: false,
        factoryId: "fac-1",
        factoryName: "Fabrica Central FastInBox",
      },
      {
        id: "ord-seed-3",
        code: "FIB-2026-120",
        patientId: "p-seed-2",
        patientName: "Rafael Souza",
        nutritionistId: "nut-1",
        nutritionistName: "Dra. Ana Carvalho",
        clinicName: "Clínica Nutrition Vida",
        items: [
          {
            id: "item-seed-3",
            name: "Marmita Low Carb",
            ingredients: [
              { id: "ing-6", name: "Peito de peru", category: "proteina", quantity: "140g" },
              { id: "ing-7", name: "Abobrinha grelhada", category: "vegetal", quantity: "90g" },
            ],
            packaging: "Embalagem 800ml",
            observations: "Sem amido.",
            quantity: 4,
          },
        ],
        basePrice: 15200,
        finalPrice: 18900,
        margin: 3700,
        status: "pago",
        nutritionalObservations: "Sem carboidratos complexos.",
        deliveryDate: "2026-04-29",
        paymentMethod: "pix",
        createdAt: "2026-04-24",
        paidAt: "2026-04-24",
        allowEditing: false,
        factoryId: "fac-1",
        factoryName: "Fabrica Central FastInBox",
      },
      {
        id: "ord-seed-4",
        code: "FIB-2026-121",
        patientId: "p-seed-1",
        patientName: "Carla Menezes",
        nutritionistId: "nut-1",
        nutritionistName: "Dra. Ana Carvalho",
        clinicName: "Clínica Nutrition Vida",
        items: [
          {
            id: "item-seed-4",
            name: "Marmita Performance",
            ingredients: [
              { id: "ing-8", name: "Filé mignon", category: "proteina", quantity: "180g" },
              { id: "ing-9", name: "Arroz basmati", category: "carboidrato", quantity: "110g" },
            ],
            packaging: "Embalagem 1100ml",
            observations: "Proteína extra.",
            quantity: 6,
          },
        ],
        basePrice: 28800,
        finalPrice: 34600,
        margin: 5800,
        status: "em_entrega",
        nutritionalObservations: "Pós-treino calórico.",
        deliveryDate: "2026-04-25",
        paymentMethod: "pix",
        createdAt: "2026-04-21",
        paidAt: "2026-04-21",
        allowEditing: false,
        factoryId: "fac-1",
        factoryName: "Fabrica Central FastInBox",
        patientUserId: "pat-seed-1",
      },
    ],
    currentUserId: null,
  };

  const seedScript = `
    localStorage.setItem(${JSON.stringify(SPRINT_STATE_KEY)}, ${JSON.stringify(JSON.stringify(statePayload))});
    localStorage.setItem(${JSON.stringify(AUDIT_KEY)}, ${JSON.stringify(JSON.stringify(seedAudit))});
    true;
  `;

  await session.send("Runtime.evaluate", {
    expression: seedScript,
    awaitPromise: true,
  });
}

async function setViewport(session, viewport) {
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 2,
    mobile: viewport.width < 600,
  });
}

async function navigate(session, url) {
  const done = session.waitFor("Page.loadEventFired");
  await session.send("Page.navigate", { url });
  await done;
  await new Promise((r) => setTimeout(r, 1200));
}

async function runScript(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? "Erro script");
  }
  return result.result?.value;
}

async function screenshot(session, filename, viewport) {
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 2,
    mobile: viewport.width < 600,
  });
  await new Promise((r) => setTimeout(r, 400));
  const { data } = await session.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const buffer = Buffer.from(data, "base64");
  const outPath = resolve(OUTPUT_DIR, filename);
  await writeFile(outPath, buffer);
  console.log(` ✓ ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const userDataDir = resolve("/tmp/fastinbox-cdp-profile");

  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--headless=new",
      "--disable-features=Translate",
      "--hide-scrollbars",
    ],
    { stdio: "ignore" },
  );

  const cleanup = () => {
    chrome.kill("SIGTERM");
  };
  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);

  try {
    await waitForPort(DEBUG_PORT);
    const targets = await cdpFetch("/json/list");
    const target = targets.find((t) => t.type === "page") ?? targets[0];
    const session = await openCdpSession(target.webSocketDebuggerUrl);

    await session.send("Page.enable");
    await session.send("Runtime.enable");

    // Seed inicial no host
    await navigate(session, `${BASE_URL}/`);
    await ensureDataSeed(session);

    // Capturas desktop
    await setViewport(session, VIEWPORT_WIDE);

    // 1. Home pública
    await navigate(session, `${BASE_URL}/`);
    await screenshot(session, "01-home-public.png", VIEWPORT_WIDE);

    // 2. Login
    await navigate(session, `${BASE_URL}/login?role=nutricionista`);
    await screenshot(session, "02-login.png", VIEWPORT_WIDE);

    // Faz login como nutricionista via store (usa a API exposta via localStorage)
    await runScript(
      session,
      `(() => {
        const state = JSON.parse(localStorage.getItem(${JSON.stringify(SPRINT_STATE_KEY)}));
        state.currentUserId = 'nut-1';
        localStorage.setItem(${JSON.stringify(SPRINT_STATE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );

    // 3. Dashboard nutricionista
    await navigate(session, `${BASE_URL}/nutricionista/dashboard`);
    await screenshot(session, "03-nutricionista-dashboard.png", VIEWPORT_WIDE);

    // 4. Lista de pacientes
    await navigate(session, `${BASE_URL}/nutricionista/pacientes`);
    await screenshot(session, "04-nutricionista-pacientes.png", VIEWPORT_WIDE);

    // Agora vai para cozinha
    await runScript(
      session,
      `(() => {
        const state = JSON.parse(localStorage.getItem(${JSON.stringify(SPRINT_STATE_KEY)}));
        state.currentUserId = 'fac-1';
        localStorage.setItem(${JSON.stringify(SPRINT_STATE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );

    // 5. Kanban cozinha
    await navigate(session, `${BASE_URL}/cozinha/dashboard`);
    await screenshot(session, "05-cozinha-kanban.png", VIEWPORT_WIDE);

    // Agora admin
    await runScript(
      session,
      `(() => {
        const state = JSON.parse(localStorage.getItem(${JSON.stringify(SPRINT_STATE_KEY)}));
        state.currentUserId = 'admin-1';
        localStorage.setItem(${JSON.stringify(SPRINT_STATE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );

    // 6. Admin dashboard
    await navigate(session, `${BASE_URL}/admin/dashboard`);
    await screenshot(session, "06-admin-dashboard.png", VIEWPORT_WIDE);

    // 7. Admin auditoria
    await navigate(session, `${BASE_URL}/admin/auditoria`);
    await screenshot(session, "07-admin-auditoria.png", VIEWPORT_WIDE);

    // 8. Admin diagnóstico
    await navigate(session, `${BASE_URL}/admin/diagnostico`);
    await screenshot(session, "08-admin-diagnostico-inicial.png", VIEWPORT_WIDE);

    // Roda o smoke test clicando no botão
    await runScript(
      session,
      `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Rodar smoke test'));
        if (btn) btn.click();
        return true;
      })()`,
    );
    // Espera para o teste completar (soma dos delays ~ 4s + margem)
    await new Promise((r) => setTimeout(r, 6500));
    await screenshot(session, "09-admin-diagnostico-final.png", VIEWPORT_WIDE);

    // Agora captura views mobile do paciente
    // Login como paciente
    await runScript(
      session,
      `(() => {
        const state = JSON.parse(localStorage.getItem(${JSON.stringify(SPRINT_STATE_KEY)}));
        state.currentUserId = 'pat-seed-1';
        localStorage.setItem(${JSON.stringify(SPRINT_STATE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );

    await setViewport(session, VIEWPORT_MOBILE);

    // 10. Landing paciente
    await navigate(session, `${BASE_URL}/paciente`);
    await screenshot(session, "10-paciente-landing.png", VIEWPORT_MOBILE);

    // 11. Status do pedido (timeline)
    await navigate(session, `${BASE_URL}/paciente/pedido/FIB-2026-121/status`);
    await screenshot(session, "11-paciente-status.png", VIEWPORT_MOBILE);

    // 12. Pagamento - capturar em estado loading
    await navigate(session, `${BASE_URL}/paciente/pedido/FIB-2026-120/pagamento`);
    await screenshot(session, "12-paciente-pagamento.png", VIEWPORT_MOBILE);

    session.close();
    console.log("\nCaptura concluida. Arquivos em:", OUTPUT_DIR);
  } finally {
    chrome.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Falha na captura:", err);
  process.exit(1);
});
