import { useSyncExternalStore } from "react";
import {
  Clinic,
  MarmitaItem,
  Order,
  OrderStatus,
  Patient,
  mockClinic,
  mockOrders,
  mockPatients,
  statusLabels,
} from "./mockData";
import { auditActions } from "./auditStore";

export type AppRole = "nutricionista" | "paciente" | "cozinha" | "admin";

export interface AppUser {
  id: string;
  role: AppRole;
  name: string;
  email: string;
  password: string;
  clinicName?: string;
  nutritionistCRN?: string;
  linkedPatientId?: string;
  factoryName?: string;
}

export interface SprintOrder extends Order {
  factoryId?: string;
  factoryName?: string;
  patientUserId?: string;
}

interface SprintState {
  clinic: Clinic;
  users: AppUser[];
  patients: Patient[];
  orders: SprintOrder[];
  currentUserId: string | null;
  authToken: string | null;
}

interface CreatePatientInput {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  goal: string;
  restrictions: string;
}

interface RegisterInput {
  role: Exclude<AppRole, "admin">;
  name: string;
  email: string;
  password: string;
  clinicName?: string;
  nutritionistCRN?: string;
  goal?: string;
  restrictions?: string;
  phone?: string;
}

interface CreateOrderInput {
  patientId: string;
  nutritionistId: string;
  nutritionistName: string;
  clinicName: string;
  items: MarmitaItem[];
  basePrice: number;
  finalPrice: number;
  margin: number;
  deliveryDate: string;
  nutritionalObservations: string;
  allowEditing: boolean;
  factoryId?: string;
  factoryName?: string;
}

const STORAGE_KEY = "fastinbox-sprint1-state-v1";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

const listeners = new Set<() => void>();

const today = () => new Date().toISOString().slice(0, 10);

const buildInitialState = (): SprintState => {
  const nutritionistId = "nut-1";
  const factoryId = "fac-1";

  const patientUsersByPatientId = new Map<string, string>();

  const users: AppUser[] = [
    {
      id: nutritionistId,
      role: "nutricionista",
      name: mockClinic.nutritionistName,
      email: "ana@nutritionvida.com.br",
      password: "123456",
      clinicName: mockClinic.name,
      nutritionistCRN: mockClinic.nutritionistCRN,
    },
    {
      id: factoryId,
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
  ];

  mockPatients.forEach((patient, index) => {
    if (index < 2) {
      const userId = `pat-user-${index + 1}`;
      patientUsersByPatientId.set(patient.id, userId);
      users.push({
        id: userId,
        role: "paciente",
        name: patient.name,
        email: patient.email,
        password: "123456",
        linkedPatientId: patient.id,
      });
    }
  });

  const orders: SprintOrder[] = mockOrders.map((order) => ({
    ...order,
    factoryId,
    factoryName: "Fabrica Central FastInBox",
    patientUserId: patientUsersByPatientId.get(order.patientId),
  }));

  return {
    clinic: mockClinic,
    users,
    patients: mockPatients,
    orders,
    currentUserId: null,
    authToken: null,
  };
};

const safeParse = (raw: string): SprintState | null => {
  try {
    const parsed = JSON.parse(raw) as SprintState;
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.orders) || !Array.isArray(parsed.patients)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const loadState = (): SprintState => {
  if (typeof window === "undefined") {
    return buildInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return buildInitialState();
  }

  return safeParse(raw) ?? buildInitialState();
};

let state: SprintState = loadState();

const saveState = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const emit = () => {
  saveState();
  listeners.forEach((listener) => listener());
};

const emitWithoutSave = () => {
  listeners.forEach((listener) => listener());
};

const setState = (updater: (prev: SprintState) => SprintState) => {
  state = updater(state);
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      const parsed = safeParse(event.newValue);
      if (parsed) {
        state = parsed;
        emitWithoutSave();
      }
    }
  });
}

const generateCode = (orders: SprintOrder[]) => {
  let attempt = 0;
  while (attempt < 20) {
    const candidate = `FIB-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    if (!orders.some((order) => order.code === candidate)) {
      return candidate;
    }
    attempt += 1;
  }
  return `FIB-2026-${Date.now().toString().slice(-3)}`;
};

const findCurrentUser = () => state.users.find((user) => user.id === state.currentUserId) ?? null;

interface ApiSafeUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  patientId?: string;
  kitchenId?: string;
}

interface ApiLoginResponse {
  token: string;
  user: ApiSafeUser;
}

interface ApiPatient {
  id: string;
  ownerNutritionistId: string;
  name: string;
  email: string;
  dietaryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiOrderRecord {
  id: string;
  code: string;
  createdByNutritionistId: string;
  patientId: string;
  kitchenId: string;
  status: string;
  items: unknown[];
  notes?: string;
  confirmedByPatient: boolean;
  createdAt: string;
  updatedAt: string;
}

const backendToFrontStatus = (status: string): OrderStatus => {
  const normalized = status.trim().toLowerCase();
  const map: Record<string, OrderStatus> = {
    created: "pago",
    confirmed_by_patient: "pago",
    pago: "pago",
    em_producao: "em_producao",
    pronto: "pronto",
    em_entrega: "em_entrega",
    entregue: "entregue",
    cancelado: "cancelado",
  };
  return map[normalized] ?? "pago";
};

const frontToBackendStatus = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    rascunho: "DRAFT",
    aguardando_confirmacao: "CREATED",
    aguardando_pagamento: "CREATED",
    pago: "PAGO",
    em_producao: "EM_PRODUCAO",
    pronto: "PRONTO",
    em_entrega: "EM_ENTREGA",
    entregue: "ENTREGUE",
    cancelado: "CANCELADO",
  };
  return map[status];
};

const toAppUserFromApi = (user: ApiSafeUser): AppUser => ({
  id: user.id,
  role: user.role,
  name: user.name,
  email: user.email,
  password: "",
  linkedPatientId: user.patientId,
  factoryName: user.role === "cozinha" ? "Fabrica Central FastInBox" : undefined,
});

const toPatientFromApi = (patient: ApiPatient, allOrders: SprintOrder[]): Patient => {
  const notes = patient.dietaryNotes || "";
  return {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    phone: "",
    cpf: "",
    birthDate: "",
    goal: notes || "A definir",
    restrictions: notes || "Nenhuma",
    createdAt: patient.createdAt.slice(0, 10),
    ordersCount: allOrders.filter((order) => order.patientId === patient.id).length,
  };
};

const toOrderFromApi = (
  order: ApiOrderRecord,
  allPatients: Patient[],
  baseOrder?: Partial<SprintOrder>,
): SprintOrder => {
  const patient = allPatients.find((item) => item.id === order.patientId);
  const itemsFromApi = Array.isArray(order.items) ? order.items : [];
  const mappedItems: MarmitaItem[] =
    itemsFromApi.length > 0
      ? itemsFromApi.map((item, index) => {
          const ingredientRecord = item as { ingredientId?: string; quantity?: number; notes?: string };
          const ingredientId = ingredientRecord.ingredientId || `ing-${index + 1}`;
          const qty = Number(ingredientRecord.quantity || 1);
          return {
            id: `item-${order.id}-${index + 1}`,
            name: `Item ${index + 1}`,
            quantity: 1,
            packaging: "Embalagem 900ml",
            observations: ingredientRecord.notes || "",
            ingredients: [
              {
                id: ingredientId,
                name: ingredientId,
                category: "proteina",
                quantity: `${qty}`,
              },
            ],
          };
        })
      : [
          {
            id: `item-${order.id}-1`,
            name: "Pedido",
            quantity: 1,
            packaging: "Embalagem 900ml",
            observations: order.notes || "",
            ingredients: [{ id: "ing-default", name: "Ingrediente", category: "proteina", quantity: "1" }],
          },
        ];

  return {
    id: order.id,
    code: order.code,
    patientId: order.patientId,
    patientName: baseOrder?.patientName || patient?.name || "Paciente",
    nutritionistId: order.createdByNutritionistId,
    nutritionistName: baseOrder?.nutritionistName || "Nutricionista",
    clinicName: baseOrder?.clinicName || mockClinic.name,
    items: baseOrder?.items || mappedItems,
    basePrice: baseOrder?.basePrice ?? 0,
    finalPrice: baseOrder?.finalPrice ?? 0,
    margin: baseOrder?.margin ?? 0,
    status: backendToFrontStatus(order.status),
    nutritionalObservations: baseOrder?.nutritionalObservations || order.notes || "",
    deliveryDate: baseOrder?.deliveryDate || order.createdAt.slice(0, 10),
    paymentMethod: baseOrder?.paymentMethod,
    createdAt: order.createdAt.slice(0, 10),
    paidAt: baseOrder?.paidAt,
    allowEditing: baseOrder?.allowEditing ?? false,
    factoryId: baseOrder?.factoryId || "usr_cozinha_1",
    factoryName: baseOrder?.factoryName || "Fabrica Central FastInBox",
    patientUserId: baseOrder?.patientUserId,
  };
};

const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        message = payload.message.join("; ");
      } else if (payload.message) {
        message = payload.message;
      }
    } catch {
      // ignore json parsing error
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const sprintStoreActions = {
  resetAll() {
    state = buildInitialState();
    emit();
  },

  logout() {
    const currentUser = findCurrentUser();
    setState((prev) => ({ ...prev, currentUserId: null, authToken: null }));
    if (currentUser) {
      auditActions.record({
        type: "logout",
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        description: `${currentUser.name} encerrou a sessão`,
      });
    }
  },

  async login(email: string, password: string, role?: AppRole) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const loginResponse = await apiRequest<ApiLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (role && loginResponse.user.role !== role) {
        throw new Error("Perfil diferente do selecionado.");
      }

      const appUser = toAppUserFromApi(loginResponse.user);
      setState((prev) => {
        const existing = prev.users.filter((user) => user.id !== appUser.id);
        return {
          ...prev,
          users: [appUser, ...existing],
          currentUserId: appUser.id,
          authToken: loginResponse.token,
        };
      });

      if (loginResponse.user.role === "nutricionista") {
        const [patientsApi, ordersApi] = await Promise.all([
          apiRequest<ApiPatient[]>("/patients", {
            headers: { Authorization: `Bearer ${loginResponse.token}` },
          }),
          apiRequest<ApiOrderRecord[]>("/orders", {
            headers: { Authorization: `Bearer ${loginResponse.token}` },
          }),
        ]);

        setState((prev) => {
          const mappedOrders = ordersApi.map((order) => toOrderFromApi(order, prev.patients));
          const mappedPatients = patientsApi.map((patient) => toPatientFromApi(patient, mappedOrders));
          return {
            ...prev,
            patients: mappedPatients,
            orders: mappedOrders,
          };
        });
      }

      auditActions.record({
        type: "login",
        actorId: appUser.id,
        actorName: appUser.name,
        actorRole: appUser.role,
        description: `${appUser.name} entrou na plataforma`,
      });
      return appUser;
    } catch {
      const found = state.users.find((user) => {
        const sameEmail = user.email.toLowerCase() === normalizedEmail;
        const samePassword = user.password === password;
        const sameRole = role ? user.role === role : true;
        return sameEmail && samePassword && sameRole;
      });

      if (!found) {
        auditActions.record({
          type: "login_failed",
          actorId: null,
          actorName: normalizedEmail || "anônimo",
          actorRole: role || "desconhecido",
          description: `Tentativa de login sem sucesso${role ? ` (perfil ${role})` : ""}`,
        });
        return null;
      }

      setState((prev) => ({ ...prev, currentUserId: found.id }));
      auditActions.record({
        type: "login",
        actorId: found.id,
        actorName: found.name,
        actorRole: found.role,
        description: `${found.name} entrou na plataforma`,
      });
      return found;
    }
  },

  demoLogin(role: AppRole) {
    const candidate = state.users.find((user) => user.role === role);
    if (!candidate) {
      return null;
    }
    setState((prev) => ({ ...prev, currentUserId: candidate.id }));
    auditActions.record({
      type: "login",
      actorId: candidate.id,
      actorName: candidate.name,
      actorRole: candidate.role,
      description: `${candidate.name} entrou na plataforma`,
      metadata: { mode: "demo" },
    });
    return candidate;
  },

  registerUser(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const hasEmail = state.users.some((user) => user.email.toLowerCase() === normalizedEmail);
    if (hasEmail) {
      return { ok: false, error: "E-mail já cadastrado" } as const;
    }

    const id = `${input.role}-${Date.now()}`;
    const user: AppUser = {
      id,
      role: input.role,
      name: input.name.trim(),
      email: normalizedEmail,
      password: input.password,
      clinicName: input.clinicName?.trim(),
      nutritionistCRN: input.nutritionistCRN?.trim(),
      factoryName: input.role === "cozinha" ? input.name.trim() : undefined,
    };

    let patient: Patient | null = null;
    if (input.role === "paciente") {
      patient = {
        id: `p-${Date.now()}`,
        name: input.name.trim(),
        email: normalizedEmail,
        phone: input.phone?.trim() || "",
        cpf: "",
        birthDate: "",
        goal: input.goal?.trim() || "A definir",
        restrictions: input.restrictions?.trim() || "Nenhuma",
        createdAt: today(),
        ordersCount: 0,
      };
      user.linkedPatientId = patient.id;
    }

    setState((prev) => ({
      ...prev,
      users: [user, ...prev.users],
      patients: patient ? [patient, ...prev.patients] : prev.patients,
      currentUserId: user.id,
    }));

    auditActions.record({
      type: "user_registered",
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      description: `Novo cadastro de ${input.role}: ${user.name}`,
      metadata: { email: user.email },
    });

    if (patient) {
      auditActions.record({
        type: "patient_created",
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        targetId: patient.id,
        description: `Paciente ${patient.name} cadastrado via auto-registro`,
      });
    }

    return { ok: true, user } as const;
  },

  async createPatient(input: CreatePatientInput) {
    const currentUser = findCurrentUser();
    if (state.authToken && currentUser?.role === "nutricionista") {
      try {
        const created = await apiRequest<ApiPatient>("/patients", {
          method: "POST",
          headers: { Authorization: `Bearer ${state.authToken}` },
          body: JSON.stringify({
            name: input.name.trim(),
            email: input.email.trim(),
            dietaryNotes: [input.goal.trim(), input.restrictions.trim()].filter(Boolean).join(" | "),
          }),
        });

        const mappedPatient = toPatientFromApi(created, state.orders);
        setState((prev) => ({
          ...prev,
          patients: [mappedPatient, ...prev.patients],
        }));

        auditActions.record({
          type: "patient_created",
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          targetId: mappedPatient.id,
          description: `Paciente ${mappedPatient.name} cadastrado via API`,
        });
        return mappedPatient;
      } catch {
        // fallback local
      }
    }

    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      cpf: input.cpf.trim(),
      birthDate: input.birthDate,
      goal: input.goal.trim() || "A definir",
      restrictions: input.restrictions.trim() || "Nenhuma",
      createdAt: today(),
      ordersCount: 0,
    };

    setState((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
    }));

    const actor = findCurrentUser();
    auditActions.record({
      type: "patient_created",
      actorId: actor?.id ?? null,
      actorName: actor?.name ?? "Sistema",
      actorRole: actor?.role ?? "sistema",
      targetId: newPatient.id,
      description: `Paciente ${newPatient.name} cadastrado`,
      metadata: { goal: newPatient.goal, restrictions: newPatient.restrictions },
    });

    return newPatient;
  },

  async createOrder(input: CreateOrderInput) {
    const patient = state.patients.find((item) => item.id === input.patientId);
    const patientUser = state.users.find(
      (user) => user.role === "paciente" && user.linkedPatientId === input.patientId,
    );

    if (state.authToken) {
      try {
        const apiOrder = await apiRequest<ApiOrderRecord>("/orders", {
          method: "POST",
          headers: { Authorization: `Bearer ${state.authToken}` },
          body: JSON.stringify({
            patientId: input.patientId,
            kitchenId: input.factoryId === "usr_cozinha_1" ? "kitchen_main" : "kitchen_main",
            items: input.items.flatMap((item) =>
              item.ingredients.map((ingredient) => ({
                ingredientId: ingredient.id,
                quantity: Number.parseInt(ingredient.quantity, 10) || 1,
                notes: `${item.name} - ${ingredient.name}`,
              })),
            ),
            notes: input.nutritionalObservations,
          }),
        });

        const mappedOrder = toOrderFromApi(apiOrder, state.patients, {
          ...input,
          patientName: patient?.name,
          patientUserId: patientUser?.id,
          status: "pago",
        });

        setState((prev) => ({
          ...prev,
          orders: [mappedOrder, ...prev.orders],
          patients: prev.patients.map((item) =>
            item.id === input.patientId ? { ...item, ordersCount: item.ordersCount + 1 } : item,
          ),
        }));

        return mappedOrder;
      } catch {
        // fallback local
      }
    }

    const code = generateCode(state.orders);
    const order: SprintOrder = {
      id: `ord-${Date.now()}`,
      code,
      patientId: input.patientId,
      patientName: patient?.name || "Paciente",
      nutritionistId: input.nutritionistId,
      nutritionistName: input.nutritionistName,
      clinicName: input.clinicName,
      items: input.items,
      basePrice: input.basePrice,
      finalPrice: input.finalPrice,
      margin: input.margin,
      status: "pago",
      nutritionalObservations: input.nutritionalObservations,
      deliveryDate: input.deliveryDate || today(),
      paymentMethod: "interno",
      createdAt: today(),
      paidAt: today(),
      allowEditing: input.allowEditing,
      factoryId: input.factoryId,
      factoryName: input.factoryName,
      patientUserId: patientUser?.id,
    };

    setState((prev) => ({
      ...prev,
      orders: [order, ...prev.orders],
      patients: prev.patients.map((item) =>
        item.id === input.patientId ? { ...item, ordersCount: item.ordersCount + 1 } : item,
      ),
    }));

    const actor = findCurrentUser();
    auditActions.record({
      type: "order_created",
      actorId: actor?.id ?? input.nutritionistId,
      actorName: actor?.name ?? input.nutritionistName,
      actorRole: actor?.role ?? "nutricionista",
      targetId: order.id,
      targetCode: order.code,
      description: `Pedido ${order.code} criado para ${order.patientName}`,
      metadata: {
        total: order.finalPrice,
        items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });

    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    let previous: SprintOrder | undefined;

    if (state.authToken) {
      try {
        const apiOrder = await apiRequest<ApiOrderRecord>(`/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${state.authToken}` },
          body: JSON.stringify({ status: frontToBackendStatus(status) }),
        });

        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId ? toOrderFromApi(apiOrder, prev.patients, order) : order,
          ),
        }));
        return;
      } catch {
        // fallback local
      }
    }

    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }
        previous = order;
        return {
          ...order,
          status,
          paidAt: status === "pago" && !order.paidAt ? today() : order.paidAt,
        };
      }),
    }));

    if (previous && previous.status !== status) {
      const actor = findCurrentUser();
      auditActions.record({
        type: "order_status_changed",
        actorId: actor?.id ?? null,
        actorName: actor?.name ?? "Sistema",
        actorRole: actor?.role ?? "sistema",
        targetId: previous.id,
        targetCode: previous.code,
        description: `${previous.code}: ${statusLabels[previous.status]} -> ${statusLabels[status]}`,
        metadata: { from: previous.status, to: status },
      });
    }
  },

  async markOrderAsPaid(code: string, paymentMethod: string) {
    let matchedOrder: SprintOrder | undefined;

    if (state.authToken) {
      const target = state.orders.find((order) => order.code === code);
      if (target) {
        try {
          const confirmed = await apiRequest<ApiOrderRecord>(`/orders/${target.id}/confirm`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${state.authToken}` },
          });

          setState((prev) => ({
            ...prev,
            orders: prev.orders.map((order) =>
              order.id === target.id
                ? {
                    ...toOrderFromApi(confirmed, prev.patients, order),
                    paymentMethod,
                    paidAt: order.paidAt || today(),
                    status: "pago",
                  }
                : order,
            ),
          }));
          return;
        } catch {
          // fallback local
        }
      }
    }
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.code !== code) {
          return order;
        }

        const alreadyInProduction =
          order.status === "em_producao" ||
          order.status === "pronto" ||
          order.status === "em_entrega" ||
          order.status === "entregue";

        matchedOrder = order;
        return {
          ...order,
          paymentMethod,
          paidAt: order.paidAt || today(),
          status: alreadyInProduction ? order.status : "pago",
        };
      }),
    }));

    if (matchedOrder) {
      const actor = findCurrentUser();
      auditActions.record({
        type: "order_paid",
        actorId: actor?.id ?? null,
        actorName: actor?.name ?? matchedOrder.patientName,
        actorRole: actor?.role ?? "paciente",
        targetId: matchedOrder.id,
        targetCode: matchedOrder.code,
        description: `${matchedOrder.code} pago via ${paymentMethod.toUpperCase()}`,
        metadata: { total: matchedOrder.finalPrice, method: paymentMethod },
      });
    }
  },

  getCurrentUser: findCurrentUser,
};

export function useSprintStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useSprintSession() {
  const snapshot = useSprintStore();
  const currentUser = snapshot.users.find((user) => user.id === snapshot.currentUserId) ?? null;
  return {
    ...snapshot,
    currentUser,
  };
}
