const DEFAULT_BASE_URL =
  typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
    ? "https://fastinbox-api.fastinbox.app"
    : "http://localhost:4001";

const BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  DEFAULT_BASE_URL;

const ACCESS_TOKEN_KEY = "fastinbox.api.access";
const REFRESH_TOKEN_KEY = "fastinbox.api.refresh";

interface FetchOptions extends RequestInit {
  auth?: boolean;
  rawBody?: BodyInit | null;
}

export interface ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
}

function readToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeToken(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

async function request<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && !options.rawBody) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const token = readToken(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.rawBody ?? options.body,
  });

  if (!response.ok) {
    let payload: { message?: string; code?: string; details?: unknown } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      /* ignore */
    }
    const error = new Error(payload.message ?? response.statusText) as ApiError;
    error.status = response.status;
    error.code = payload.code;
    error.details = payload.details;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  baseUrl: BASE_URL,
  request,
  setTokens(accessToken: string | null, refreshToken: string | null) {
    writeToken(ACCESS_TOKEN_KEY, accessToken);
    writeToken(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens() {
    writeToken(ACCESS_TOKEN_KEY, null);
    writeToken(REFRESH_TOKEN_KEY, null);
  },
  getAccessToken: () => readToken(ACCESS_TOKEN_KEY),
  getRefreshToken: () => readToken(REFRESH_TOKEN_KEY),
};

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: { id: string; email: string; fullName: string; role: string; clinicId?: string };
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthLoginResponse> {
    const data = await request<AuthLoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    api.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  async me() {
    return request<{ userId: string; role: string; fullName: string; email: string; clinicId?: string }>("/auth/me");
  },
  async logout() {
    const refreshToken = api.getRefreshToken();
    if (refreshToken) {
      await request("/auth/logout", { method: "POST", auth: false, body: JSON.stringify({ refreshToken }) });
    }
    api.clearTokens();
  },
};

export interface PublicOrderResponse {
  code: string;
  status: string;
  paymentStatus: string;
  clinic: { id: string; name: string; logoUrl?: string; primaryColor: string; secondaryColor: string };
  items: { id: string; quantity: number; unitPriceCents: number; compositionId?: string }[];
  subtotalCents: number;
  commissionCents: number;
  totalCents: number;
  deliveryWindow?: { date: string; slot: string; regionCode?: string };
  allowedActions: string[];
}

export const publicOrdersApi = {
  view: (code: string) => request<PublicOrderResponse>(`/public/orders/${encodeURIComponent(code)}`, { auth: false }),
  confirm: (code: string) => request<PublicOrderResponse>(`/public/orders/${encodeURIComponent(code)}/confirm`, { method: "POST", auth: false }),
  editItemQuantity: (code: string, itemId: string, quantity: number) =>
    request<PublicOrderResponse>(`/public/orders/${encodeURIComponent(code)}/items/${itemId}`, {
      method: "PATCH",
      auth: false,
      body: JSON.stringify({ quantity }),
    }),
  createIntent: (code: string) =>
    request<{ id: string; providerIntentId: string; redirectUrl: string; amountCents: number; status: string }>(
      `/public/orders/${encodeURIComponent(code)}/payment-intent`,
      { method: "POST", auth: false },
    ),
  simulateApproval: (providerIntentId: string) =>
    request<{ providerEventId: string; status: string }>(
      `/payments/simulate/${encodeURIComponent(providerIntentId)}/approve`,
      { method: "POST", auth: false },
    ),
};

export const ordersApi = {
  list: <T = unknown>(params?: { status?: string }) => {
    const query = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
    return request<T[]>(`/orders${query}`);
  },
  get: <T = unknown>(id: string) => request<T>(`/orders/${id}`),
  history: <T = unknown>(id: string) => request<T[]>(`/orders/${id}/history`),
  startProduction: (id: string) => request(`/orders/${id}/start-production`, { method: "POST" }),
  markReady: (id: string) => request(`/orders/${id}/mark-ready`, { method: "POST" }),
  markDelivered: (id: string) => request(`/orders/${id}/mark-delivered`, { method: "POST" }),
};

export const patientsApi = {
  list: <T = unknown>(q?: string) =>
    request<T[]>(`/patients${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  create: <T = unknown>(payload: Record<string, unknown>) =>
    request<T>("/patients", { method: "POST", body: JSON.stringify(payload) }),
  update: <T = unknown>(id: string, payload: Record<string, unknown>) =>
    request<T>(`/patients/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: <T = unknown>(id: string) => request<T>(`/patients/${id}`, { method: "DELETE" }),
};

export const catalogApi = {
  ingredients: <T = unknown>() => request<T[]>("/ingredients"),
  compositions: <T = unknown>() => request<T[]>("/compositions"),
  packagings: <T = unknown>() => request<T[]>("/packagings"),
};
