import { defineConfig, devices } from "@playwright/test";

const PORT = Number.parseInt(process.env.E2E_PORT ?? "3001", 10);
const BACK_PORT = Number.parseInt(process.env.E2E_BACK_PORT ?? "4001", 10);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const BACK_URL = process.env.E2E_BACK_URL ?? `http://localhost:${BACK_PORT}`;
const SKIP_BACKEND = process.env.E2E_SKIP_BACKEND === "true";
const REUSE_SERVER = !process.env.CI;

type WebServerConfig = {
  command: string;
  url: string;
  reuseExistingServer: boolean;
  stdout: "ignore";
  stderr: "pipe";
  timeout: number;
  env: Record<string, string>;
};

const webServer: WebServerConfig[] = [
  {
    command: `npm --prefix ${process.cwd()} run dev`,
    url: BASE_URL,
    reuseExistingServer: REUSE_SERVER,
    stdout: "ignore" as const,
    stderr: "pipe" as const,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_API_URL: BACK_URL,
    },
  },
];

if (!SKIP_BACKEND) {
  webServer.unshift({
    command: `npm --prefix ${process.cwd()}/../back run start`,
    url: `${BACK_URL}/health`,
    reuseExistingServer: REUSE_SERVER,
    stdout: "ignore" as const,
    stderr: "pipe" as const,
    timeout: 180_000,
    env: {
      PORT: String(BACK_PORT),
      NODE_ENV: "test",
      FRONTEND_URL: BASE_URL,
      SEED_DATA: "true",
    },
  });
}

export default defineConfig({
  testDir: "./e2e/specs",
  outputDir: "./e2e/.artifacts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "./e2e/.report-html", open: "never" }],
    ["./e2e/reporter/site-reporter.ts"],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    video: {
      mode: "on",
      size: { width: 1280, height: 720 },
    },
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: process.env.E2E_SLOWMO ? Number(process.env.E2E_SLOWMO) : 80,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer,
});
