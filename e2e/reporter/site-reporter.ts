import { Reporter, TestCase, TestResult, FullResult } from "@playwright/test/reporter";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

import { featureCatalog } from "../feature-catalog";

type Outcome = "passed" | "failed" | "flaky" | "skipped" | "interrupted" | "timedOut";

interface FeatureEntry {
  slug: string;
  fileKey: string;
  area: string;
  title: string;
  summary: string;
  steps: string[];
  status: Outcome;
  durationMs: number;
  videoFile: string | null;
  posterFile: string | null;
  errorMessage?: string;
}

const AREA_ORDER = ["Publico", "Nutricionista", "Paciente", "Cozinha", "Admin"];

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\.spec\.ts$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function fileKey(file: string): string {
  return basename(file).replace(/\.spec\.ts$/, "");
}

function statusLabel(status: Outcome): string {
  return {
    passed: "Aprovado",
    failed: "Falhou",
    flaky: "Instavel",
    skipped: "Ignorado",
    interrupted: "Interrompido",
    timedOut: "Timeout",
  }[status];
}

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${rest}s`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makePoster(videoPath: string, targetPath: string): boolean {
  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-ss",
        "00:00:01.5",
        "-i",
        videoPath,
        "-frames:v",
        "1",
        "-vf",
        "scale=720:-2",
        "-q:v",
        "3",
        targetPath,
      ],
      { stdio: "ignore" },
    );
    return existsSync(targetPath);
  } catch {
    try {
      execFileSync(
        "ffmpeg",
        ["-y", "-i", videoPath, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "3", targetPath],
        { stdio: "ignore" },
      );
      return existsSync(targetPath);
    } catch {
      return false;
    }
  }
}

export default class SiteReporter implements Reporter {
  private readonly entries: FeatureEntry[] = [];
  private readonly outDir = resolve(__dirname, "../.report-site");
  private readonly videosDir = join(this.outDir, "videos");
  private readonly postersDir = join(this.outDir, "posters");

  onBegin() {
    rmSync(this.outDir, { recursive: true, force: true });
    mkdirSync(this.videosDir, { recursive: true });
    mkdirSync(this.postersDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const key = fileKey(test.location.file);
    const titleSlug = slugify(test.title);
    const slug = `${slugify(key)}-${titleSlug}`;
    const catalog = featureCatalog[key];

    const videoAttachment = result.attachments.find((att) => att.contentType?.startsWith("video/"));
    let videoFile: string | null = null;
    let posterFile: string | null = null;

    if (videoAttachment?.path && existsSync(videoAttachment.path)) {
      const ext = videoAttachment.path.split(".").pop() ?? "webm";
      const targetName = `${slug}.${ext}`;
      const target = join(this.videosDir, targetName);
      try {
        copyFileSync(videoAttachment.path, target);
        videoFile = relative(this.outDir, target).replace(/\\/g, "/");
      } catch (err) {
        console.warn(`[site-reporter] copy video falhou ${videoAttachment.path}:`, err);
      }

      if (videoFile) {
        const posterName = `${slug}.jpg`;
        const posterTarget = join(this.postersDir, posterName);
        if (makePoster(target, posterTarget)) {
          posterFile = relative(this.outDir, posterTarget).replace(/\\/g, "/");
        }
      }
    }

    this.entries.push({
      slug,
      fileKey: key,
      area: catalog?.area ?? "Outros",
      title: catalog?.title ?? test.title,
      summary: catalog?.summary ?? test.title,
      steps: catalog?.steps ?? [],
      status: result.status as Outcome,
      durationMs: result.duration,
      videoFile,
      posterFile,
      errorMessage: result.error?.message,
    });
  }

  onEnd(result: FullResult) {
    const generatedAt = new Date().toISOString();
    const summary = {
      total: this.entries.length,
      passed: this.entries.filter((e) => e.status === "passed").length,
      failed: this.entries.filter((e) => e.status === "failed" || e.status === "timedOut").length,
      skipped: this.entries.filter((e) => e.status === "skipped").length,
    };

    const sorted = [...this.entries].sort((a, b) => a.slug.localeCompare(b.slug));
    const grouped = AREA_ORDER.map((area) => ({
      area,
      items: sorted.filter((entry) => entry.area === area),
    })).filter((group) => group.items.length > 0);

    const html = renderShell({ summary, grouped, generatedAt, status: result.status });
    writeFileSync(join(this.outDir, "index.html"), html, "utf8");
    writeFileSync(
      join(this.outDir, "report.json"),
      JSON.stringify({ summary, generatedAt, status: result.status, entries: sorted }, null, 2),
      "utf8",
    );

    console.log(`[site-reporter] static report ready: ${this.outDir}/index.html`);
  }
}

function renderCard(entry: FeatureEntry): string {
  const tag = entry.fileKey.match(/^(\d+)/)?.[1] ?? "E2E";
  const poster = entry.posterFile
    ? `<img loading="lazy" src="${entry.posterFile}" alt="Preview: ${escapeHtml(entry.title)}" />`
    : `<div class="thumb-empty">Sem preview</div>`;

  const stepsHtml = entry.steps.length
    ? `<ol class="card-steps">${entry.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
    : "";

  const errorHtml = entry.errorMessage
    ? `<details class="card-error"><summary>Detalhes do erro</summary><pre>${escapeHtml(entry.errorMessage)}</pre></details>`
    : "";

  const videoSrc = entry.videoFile ?? "";
  const safeTitle = escapeHtml(entry.title);

  return `<article class="card" data-status="${entry.status}">
    <button class="card-thumb" type="button" data-video="${videoSrc}" data-title="${safeTitle}" data-desc="${escapeHtml(entry.summary)}" ${videoSrc ? "" : "disabled"}>
      ${poster}
      <span class="play-overlay" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
      <span class="card-tag">#${tag}</span>
      <span class="card-badge card-badge--${entry.status}">${statusLabel(entry.status)}</span>
    </button>
    <div class="card-body">
      <p class="card-area">${entry.area}</p>
      <h3 class="card-title">${safeTitle}</h3>
      <p class="card-summary">${escapeHtml(entry.summary)}</p>
      ${stepsHtml}
      <footer class="card-foot">
        <span>${formatDuration(entry.durationMs)}</span>
        ${entry.videoFile ? `<button class="card-play" type="button" data-video="${videoSrc}" data-title="${safeTitle}" data-desc="${escapeHtml(entry.summary)}">Assistir video &rarr;</button>` : `<span class="card-foot-dim">Video indisponivel</span>`}
      </footer>
      ${errorHtml}
    </div>
  </article>`;
}

function renderShell(opts: {
  summary: { total: number; passed: number; failed: number; skipped: number };
  grouped: { area: string; items: FeatureEntry[] }[];
  generatedAt: string;
  status: string;
}): string {
  const { summary, grouped, generatedAt, status } = opts;

  const sections = grouped
    .map(
      (group) => `<section class="area" id="area-${group.area.toLowerCase()}">
        <header class="area-head">
          <h2>${group.area}</h2>
          <span class="area-count">${group.items.length} cenarios</span>
        </header>
        <div class="grid">${group.items.map(renderCard).join("\n")}</div>
      </section>`,
    )
    .join("\n");

  const areaNav = grouped
    .map((group) => `<a href="#area-${group.area.toLowerCase()}">${group.area} <span>${group.items.length}</span></a>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FastInBox - Relatorio E2E com video</title>
  <meta name="description" content="Relatorio profissional de testes E2E do FastInBox: para cada funcionalidade, descricao do que e testado e o video da execucao." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink: #000;
      --paper: #fff;
      --soft: #f6f6f6;
      --softer: #fafafa;
      --muted: #555;
      --line: #111;
      --ok: #0a8a3f;
      --bad: #b8242b;
      --warn: #b48000;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      background: var(--paper);
      color: var(--ink);
      letter-spacing: -0.01em;
      line-height: 1.5;
    }
    a { color: inherit; }
    .top {
      border-bottom: 2px solid var(--line);
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .top .crumb {
      color: var(--muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .top h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.4rem, 2.5vw, 2rem);
      font-weight: 700;
      letter-spacing: -0.04em;
      margin: 4px 0 0;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 2px solid var(--line);
      padding: 8px 16px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: var(--ink);
      color: var(--paper);
    }
    .pill[data-status="failed"] { background: var(--bad); border-color: var(--bad); }
    main { padding: 32px; max-width: 1280px; margin: 0 auto; }
    .meta {
      border: 2px solid var(--line);
      box-shadow: 8px 8px 0 var(--line);
      padding: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
      background: var(--paper);
    }
    .meta .kpi {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.4rem;
      font-weight: 700;
      letter-spacing: -0.05em;
      margin: 0;
    }
    .meta .label {
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .areas-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0 0 28px;
    }
    .areas-nav a {
      border: 2px solid var(--line);
      padding: 8px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-decoration: none;
      background: var(--paper);
      transition: transform 0.15s ease;
    }
    .areas-nav a:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--line); }
    .areas-nav a span {
      display: inline-block;
      margin-left: 6px;
      padding: 0 6px;
      background: var(--ink);
      color: var(--paper);
      border-radius: 999px;
      font-size: 0.7rem;
    }
    .area {
      margin-bottom: 48px;
    }
    .area-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      border-bottom: 2px solid var(--line);
      padding-bottom: 8px;
      margin-bottom: 18px;
      gap: 12px;
    }
    .area-head h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 0;
    }
    .area-count {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 22px;
    }
    .card {
      border: 2px solid var(--line);
      background: var(--paper);
      box-shadow: 6px 6px 0 var(--line);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .card:hover {
      transform: translate(-2px, -2px);
      box-shadow: 10px 10px 0 var(--line);
    }
    .card-thumb {
      position: relative;
      background: var(--ink);
      border: none;
      padding: 0;
      cursor: pointer;
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      display: block;
      color: var(--paper);
    }
    .card-thumb:disabled { cursor: not-allowed; opacity: 0.85; }
    .card-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .thumb-empty {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
      letter-spacing: 0.04em;
    }
    .play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--paper);
      background: rgba(0,0,0,0.18);
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .card-thumb:hover .play-overlay,
    .card-thumb:focus-visible .play-overlay {
      opacity: 1;
    }
    .play-overlay svg {
      background: rgba(0,0,0,0.55);
      border: 2px solid var(--paper);
      border-radius: 999px;
      padding: 12px;
      width: 64px;
      height: 64px;
    }
    .card-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--paper);
      color: var(--ink);
      padding: 4px 10px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      border: 2px solid var(--line);
    }
    .card-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 10px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 2px solid var(--paper);
      background: var(--ok);
      color: var(--paper);
    }
    .card-badge--failed,
    .card-badge--timedOut { background: var(--bad); }
    .card-badge--skipped { background: var(--warn); }
    .card-body {
      padding: 18px 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }
    .card-area {
      margin: 0;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .card-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .card-summary {
      margin: 0;
      color: #2b2b2b;
      font-size: 0.9rem;
      line-height: 1.55;
    }
    .card-steps {
      margin: 0;
      padding: 12px 16px 12px 28px;
      background: var(--softer);
      border-left: 4px solid var(--ink);
      color: #1a1a1a;
      font-size: 0.85rem;
      line-height: 1.55;
    }
    .card-steps li { margin: 0 0 4px; }
    .card-foot {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px dashed #d3d3d3;
      font-size: 0.82rem;
      color: var(--muted);
    }
    .card-play {
      background: var(--ink);
      color: var(--paper);
      border: none;
      padding: 8px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
    }
    .card-play:hover { background: #1d1d1d; }
    .card-foot-dim { font-style: italic; color: #999; }
    .card-error {
      margin-top: 4px;
    }
    .card-error summary {
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--bad);
    }
    .card-error pre {
      margin: 8px 0 0;
      background: var(--softer);
      border: 2px solid var(--bad);
      padding: 10px;
      font-size: 0.75rem;
      white-space: pre-wrap;
    }
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.86);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99;
      padding: 24px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
    }
    .modal.open { opacity: 1; pointer-events: auto; }
    .modal-card {
      background: var(--paper);
      border: 2px solid var(--paper);
      max-width: 1080px;
      width: 100%;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 14px 14px 0 #fff2;
      display: flex;
      flex-direction: column;
    }
    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 22px;
      border-bottom: 2px solid var(--ink);
      gap: 12px;
    }
    .modal-head h3 {
      font-family: 'Space Grotesk', sans-serif;
      margin: 0;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .modal-close {
      background: var(--ink);
      color: var(--paper);
      border: none;
      padding: 6px 12px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }
    .modal-body {
      padding: 0 22px 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .modal-desc {
      margin: 12px 0 0;
      color: #1c1c1c;
      font-size: 0.95rem;
      line-height: 1.6;
    }
    .modal-video {
      width: 100%;
      max-height: 70vh;
      background: #000;
      border: 2px solid var(--ink);
    }
    footer.bottom {
      padding: 32px;
      border-top: 2px solid var(--line);
      color: var(--muted);
      font-size: 0.78rem;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    footer.bottom a { font-weight: 700; }
    @media (max-width: 720px) {
      .top, main, footer.bottom { padding: 22px; }
      .area-head { flex-direction: column; align-items: flex-start; gap: 4px; }
    }
  </style>
</head>
<body>
  <header class="top">
    <div>
      <p class="crumb">FastInBox - QA - Suite End-to-End</p>
      <h1>Relatorio E2E com video por funcionalidade</h1>
    </div>
    <span class="pill" data-status="${status}">${status === "passed" ? "Suite saudavel" : "Falhas detectadas"}</span>
  </header>
  <main>
    <section class="meta">
      <div><p class="label">Cenarios</p><p class="kpi">${summary.total}</p></div>
      <div><p class="label">Aprovados</p><p class="kpi" style="color: var(--ok)">${summary.passed}</p></div>
      <div><p class="label">Falhas</p><p class="kpi" style="color: var(--bad)">${summary.failed}</p></div>
      <div><p class="label">Ignorados</p><p class="kpi" style="color: var(--warn)">${summary.skipped}</p></div>
    </section>
    <nav class="areas-nav">${areaNav}</nav>
    ${sections}
  </main>
  <div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-hidden="true">
    <div class="modal-card">
      <header class="modal-head">
        <h3 id="modal-title">Video</h3>
        <button type="button" class="modal-close" id="modal-close" aria-label="Fechar">Fechar</button>
      </header>
      <div class="modal-body">
        <video id="modal-video" class="modal-video" controls playsinline preload="metadata"></video>
        <p class="modal-desc" id="modal-desc"></p>
      </div>
    </div>
  </div>
  <footer class="bottom">
    <span>Gerado em ${generatedAt} - Stack: Playwright + Chromium + NestJS + Next.js</span>
    <a href="../../index.html">&larr; Voltar ao hub de documentacao</a>
  </footer>
  <script>
    (function () {
      var modal = document.getElementById('modal');
      var modalVideo = document.getElementById('modal-video');
      var modalTitle = document.getElementById('modal-title');
      var modalDesc = document.getElementById('modal-desc');
      var modalClose = document.getElementById('modal-close');

      function open(src, title, desc) {
        if (!src) return;
        modalVideo.src = src;
        modalTitle.textContent = title || 'Video';
        modalDesc.textContent = desc || '';
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        try { modalVideo.currentTime = 0; modalVideo.play(); } catch (e) {}
      }

      function close() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        try { modalVideo.pause(); } catch (e) {}
        modalVideo.removeAttribute('src');
        modalVideo.load();
      }

      document.querySelectorAll('[data-video]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var src = btn.getAttribute('data-video');
          var title = btn.getAttribute('data-title');
          var desc = btn.getAttribute('data-desc');
          if (src) open(src, title, desc);
        });
      });

      modalClose.addEventListener('click', close);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    })();
  </script>
</body>
</html>`;
}
