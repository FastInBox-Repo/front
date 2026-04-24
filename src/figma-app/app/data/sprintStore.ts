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

export const sprintStoreActions = {
  resetAll() {
    state = buildInitialState();
    emit();
  },

  logout() {
    const currentUser = findCurrentUser();
    setState((prev) => ({ ...prev, currentUserId: null }));
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

  login(email: string, password: string, role?: AppRole) {
    const normalizedEmail = email.trim().toLowerCase();
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

  createPatient(input: CreatePatientInput) {
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

  createOrder(input: CreateOrderInput) {
    const patient = state.patients.find((item) => item.id === input.patientId);
    const patientUser = state.users.find(
      (user) => user.role === "paciente" && user.linkedPatientId === input.patientId,
    );

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

  updateOrderStatus(orderId: string, status: OrderStatus) {
    let previous: SprintOrder | undefined;
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

  markOrderAsPaid(code: string, paymentMethod: string) {
    let matchedOrder: SprintOrder | undefined;
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
