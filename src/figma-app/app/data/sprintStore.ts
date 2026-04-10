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
} from "./mockData";

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

const setState = (updater: (prev: SprintState) => SprintState) => {
  state = updater(state);
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

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
    setState((prev) => ({ ...prev, currentUserId: null }));
  },

  login(email: string, password: string, role?: AppRole) {
    const found = state.users.find((user) => {
      const sameEmail = user.email.toLowerCase() === email.trim().toLowerCase();
      const samePassword = user.password === password;
      const sameRole = role ? user.role === role : true;
      return sameEmail && samePassword && sameRole;
    });

    if (!found) {
      return null;
    }

    setState((prev) => ({ ...prev, currentUserId: found.id }));
    return found;
  },

  demoLogin(role: AppRole) {
    const candidate = state.users.find((user) => user.role === role);
    if (!candidate) {
      return null;
    }
    setState((prev) => ({ ...prev, currentUserId: candidate.id }));
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

    return order;
  },

  updateOrderStatus(orderId: string, status: OrderStatus) {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }
        return {
          ...order,
          status,
          paidAt: status === "pago" && !order.paidAt ? today() : order.paidAt,
        };
      }),
    }));
  },

  markOrderAsPaid(code: string, paymentMethod: string) {
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

        return {
          ...order,
          paymentMethod,
          paidAt: order.paidAt || today(),
          status: alreadyInProduction ? order.status : "pago",
        };
      }),
    }));
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
