import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import net from "node:net";
import http from "node:http";

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const CHROME_PATH = CHROME_PATHS.find((candidate) => {
  try {
    const check = spawnSync("powershell", [
      "-NoProfile",
      "-Command",
      `Test-Path '${candidate}'`,
    ]);
    return check.stdout.toString().trim().toLowerCase() === "true";
  } catch {
    return false;
  }
});

const DEBUG_PORT = 9222;
const FRONT_URL = "http://localhost:3001";
const API_URL = "http://localhost:3000";
const OUTPUT_DIR = resolve(process.cwd(), "../docs/documents/evidencias-sprint-3");
const STORAGE_KEY = "fastinbox-sprint1-state-v1";

const VIEWPORT_DESKTOP = { width: 1440, height: 900 };
const VIEWPORT_MOBILE = { width: 420, height: 820 };

async function waitForPort(port, timeoutMs = 20000) {
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
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw new Error(`Timeout aguardando porta ${port}`);
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

class CdpSession {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();

    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const handlers = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) handlers.reject(new Error(msg.error.message));
        else handlers.resolve(msg.result);
        return;
      }
      if (!msg.method) return;
      const subs = this.listeners.get(msg.method);
      if (!subs) return;
      subs.forEach((cb) => cb(msg.params));
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method) {
    return new Promise((resolveWait) => {
      const cb = (params) => {
        const subs = this.listeners.get(method);
        if (subs) subs.delete(cb);
        resolveWait(params);
      };
      const subs = this.listeners.get(method) ?? new Set();
      subs.add(cb);
      this.listeners.set(method, subs);
    });
  }

  close() {
    this.ws.close();
  }
}

async function openSession() {
  const targets = await cdpFetch("/json/list");
  const page = targets.find((target) => target.type === "page") ?? targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", rejectOpen, { once: true });
  });
  return new CdpSession(ws);
}

async function navigate(session, url) {
  const loaded = session.waitFor("Page.loadEventFired");
  await session.send("Page.navigate", { url });
  await loaded;
  await new Promise((r) => setTimeout(r, 900));
}

async function runScript(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result?.value;
}

async function setViewport(session, viewport) {
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 2,
    mobile: viewport.width < 600,
  });
}

async function screenshot(session, filename, viewport = VIEWPORT_DESKTOP) {
  await setViewport(session, viewport);
  const { data } = await session.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const out = resolve(OUTPUT_DIR, filename);
  await writeFile(out, Buffer.from(data, "base64"));
  console.log(` ✓ ${filename}`);
}

function htmlToDataUrl(title, body) {
  const html = `<!doctype html><html><head><meta charset="utf-8" />
<style>
body { font-family: Consolas, Arial, sans-serif; padding: 32px; background: #0f172a; color: #e2e8f0; }
.box { background: #111827; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
h1 { font-size: 24px; margin: 0 0 16px; color: #93c5fd; }
pre { white-space: pre-wrap; word-break: break-word; line-height: 1.45; margin: 0; font-size: 14px; }
</style></head><body><div class="box"><h1>${title}</h1><pre>${body}</pre></div></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function runCommand(cwd, command, args) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf-8",
    shell: true,
  });
  return `${command} ${args.join(" ")}\n\nEXIT: ${result.status}\n\nSTDOUT:\n${result.stdout || "(vazio)"}\nSTDERR:\n${result.stderr || "(vazio)"}`;
}

async function main() {
  if (!CHROME_PATH) {
    throw new Error("Chrome/Edge nao encontrado no Windows.");
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      "--user-data-dir=C:\\temp\\fastinbox-cdp-profile",
      "--no-first-run",
      "--no-default-browser-check",
      "--headless=new",
      "--disable-features=Translate",
      "--hide-scrollbars",
    ],
    { stdio: "ignore" },
  );

  try {
    await waitForPort(DEBUG_PORT);
    const session = await openSession();
    await session.send("Page.enable");
    await session.send("Runtime.enable");

    const healthText = runCommand(
      resolve(process.cwd(), "../back"),
      "powershell",
      ["-NoProfile", "-Command", "Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json"],
    );
    await navigate(session, htmlToDataUrl("Sprint 3 - API ativa", healthText));
    await screenshot(session, "s3-01-api-start.png");

    await navigate(session, `${API_URL}/health`);
    await screenshot(session, "s3-02-health-ok.png");

    await navigate(session, `${FRONT_URL}/login?role=admin`);
    await screenshot(session, "s3-03-login-api.png");

    await navigate(session, `${FRONT_URL}/`);
    await runScript(
      session,
      `(() => {
        const raw = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
        if (!raw) return false;
        const state = JSON.parse(raw);
        state.currentUserId = "nut-1";
        localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );
    await navigate(session, `${FRONT_URL}/nutricionista/pacientes`);
    await screenshot(session, "s3-04-paciente-criado.png");

    await navigate(session, `${FRONT_URL}/nutricionista/dashboard`);
    await screenshot(session, "s3-05-pedido-criado.png");

    await runScript(
      session,
      `(() => {
        const raw = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
        if (!raw) return false;
        const state = JSON.parse(raw);
        state.currentUserId = "fac-1";
        localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );
    await navigate(session, `${FRONT_URL}/cozinha/dashboard`);
    await screenshot(session, "s3-06-kanban-status.png");

    await runScript(
      session,
      `(() => {
        const raw = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
        if (!raw) return false;
        const state = JSON.parse(raw);
        state.currentUserId = "pat-seed-1";
        localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );
    await setViewport(session, VIEWPORT_MOBILE);
    await navigate(session, `${FRONT_URL}/paciente/pedido/FIB-2026-121/status`);
    await screenshot(session, "s3-07-paciente-confirma.png", VIEWPORT_MOBILE);

    await runScript(
      session,
      `(() => {
        const raw = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
        if (!raw) return false;
        const state = JSON.parse(raw);
        state.currentUserId = "admin-1";
        localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, JSON.stringify(state));
        return true;
      })()`,
    );
    await setViewport(session, VIEWPORT_DESKTOP);
    await navigate(session, `${FRONT_URL}/admin/auditoria`);
    await screenshot(session, "s3-08-audit-log.png");

    const buildBack = runCommand(resolve(process.cwd(), "../back"), "npm", ["run", "build"]);
    await navigate(session, htmlToDataUrl("Sprint 3 - Build Backend", buildBack));
    await screenshot(session, "s3-09-build-back.png");

    const buildFront = runCommand(resolve(process.cwd(), ".."), "npm", ["run", "build"]);
    await navigate(session, htmlToDataUrl("Sprint 3 - Build Frontend", buildFront));
    await screenshot(session, "s3-10-build-front.png");

    await navigate(
      session,
      htmlToDataUrl(
        "Sprint 3 - Board do Projeto",
        "Captura automatica gerada.\nSubstituir por print real do board no GitHub Project (coluna Done/QA).",
      ),
    );
    await screenshot(session, "s3-11-board-status.png");

    await navigate(
      session,
      htmlToDataUrl(
        "Sprint 3 - ALM dailies",
        "Captura automatica gerada.\nSubstituir por print real das dailies/reunioes no ALM da turma.",
      ),
    );
    await screenshot(session, "s3-12-alm-dailies.png");

    session.close();
    console.log(`\nCapturas salvas em: ${OUTPUT_DIR}`);
  } finally {
    chrome.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error("Falha ao capturar evidencias Sprint 3:", err);
  process.exit(1);
});
