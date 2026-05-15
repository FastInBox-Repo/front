#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { argv, exit } from "node:process";

const usage = "uso: node publish-to-docs.mjs <caminho-para-docs-repo>";
const target = argv[2];
if (!target) {
  console.error(usage);
  exit(1);
}

const source = resolve(import.meta.dirname ?? new URL("../.report-site", import.meta.url).pathname, "../.report-site");
const docsRoot = resolve(target);
const destination = join(docsRoot, "documents", "e2e-report");

if (!existsSync(source)) {
  console.error(`relat&oacute;rio nao encontrado em ${source}. Rode "npx playwright test" antes.`);
  exit(1);
}
if (!existsSync(docsRoot)) {
  console.error(`docs repo nao encontrado em ${docsRoot}`);
  exit(1);
}

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });
console.log(`publicado em ${destination}`);
