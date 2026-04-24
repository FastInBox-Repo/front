import { useSyncExternalStore } from "react";

export type AuditEventType =
  | "login"
  | "logout"
  | "login_failed"
  | "user_registered"
  | "patient_created"
  | "order_created"
  | "order_paid"
  | "order_status_changed";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  createdAt: string;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  targetId?: string;
  targetCode?: string;
  description: string;
  metadata?: Record<string, string | number | boolean>;
}

const AUDIT_STORAGE_KEY = "fastinbox-sprint2-audit-v1";
const MAX_EVENTS = 200;

const listeners = new Set<() => void>();

const nowIso = () => new Date().toISOString();

const parseAudit = (raw: string): AuditEvent[] | null => {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as AuditEvent[];
  } catch {
    return null;
  }
};

const loadEvents = (): AuditEvent[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!raw) return [];
  return parseAudit(raw) ?? [];
};

let events: AuditEvent[] = loadEvents();

const saveEvents = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(events));
};

const emit = () => {
  saveEvents();
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => events;

const hydrateFromStorage = () => {
  events = loadEvents();
  listeners.forEach((listener) => listener());
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === AUDIT_STORAGE_KEY) {
      hydrateFromStorage();
    }
  });
}

const generateId = () => `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const auditActions = {
  record(event: Omit<AuditEvent, "id" | "createdAt">) {
    const newEvent: AuditEvent = {
      id: generateId(),
      createdAt: nowIso(),
      ...event,
    };
    events = [newEvent, ...events].slice(0, MAX_EVENTS);
    emit();
    return newEvent;
  },

  clear() {
    events = [];
    emit();
  },

  getSnapshot,
};

export function useAuditLog() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const auditLabels: Record<AuditEventType, string> = {
  login: "Login realizado",
  logout: "Logout",
  login_failed: "Tentativa de login",
  user_registered: "Novo cadastro",
  patient_created: "Paciente cadastrado",
  order_created: "Pedido criado",
  order_paid: "Pedido pago",
  order_status_changed: "Status atualizado",
};

export const auditGroupByType = (items: AuditEvent[]) =>
  items.reduce<Record<AuditEventType, number>>(
    (acc, item) => {
      acc[item.type] = (acc[item.type] ?? 0) + 1;
      return acc;
    },
    {
      login: 0,
      logout: 0,
      login_failed: 0,
      user_registered: 0,
      patient_created: 0,
      order_created: 0,
      order_paid: 0,
      order_status_changed: 0,
    },
  );

export const formatAuditDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

export const formatAuditTimeAgo = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
};
