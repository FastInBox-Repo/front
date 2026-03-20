export type OrderStatus =
  | "rascunho"
  | "aguardando_confirmacao"
  | "aguardando_pagamento"
  | "pago"
  | "em_producao"
  | "pronto"
  | "em_entrega"
  | "entregue"
  | "cancelado";

export interface Ingredient {
  id: string;
  name: string;
  category: "proteina" | "carboidrato" | "vegetal" | "gordura" | "tempero";
  quantity: string;
}

export interface MarmitaItem {
  id: string;
  name: string;
  ingredients: Ingredient[];
  packaging: string;
  observations: string;
  quantity: number;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  goal: string;
  restrictions: string;
  createdAt: string;
  ordersCount: number;
}

export interface Order {
  id: string;
  code: string;
  patientId: string;
  patientName: string;
  nutritionistId: string;
  nutritionistName: string;
  clinicName: string;
  items: MarmitaItem[];
  basePrice: number;
  finalPrice: number;
  margin: number;
  status: OrderStatus;
  nutritionalObservations: string;
  deliveryDate: string;
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
  allowEditing: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  nutritionistName: string;
  nutritionistCRN: string;
  email: string;
  phone: string;
  address: string;
}

export const mockClinic: Clinic = {
  id: "clinic-1",
  name: "Clínica Nutrition Vida",
  logoUrl: "",
  primaryColor: "#0a0a0a",
  nutritionistName: "Dra. Ana Carvalho",
  nutritionistCRN: "CRN-3 12345",
  email: "ana@nutritionvida.com.br",
  phone: "(11) 99999-0000",
  address: "Av. Paulista, 1000 — São Paulo, SP",
};

export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "Lucas Mendes",
    email: "lucas.mendes@email.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    birthDate: "1990-05-14",
    goal: "Hipertrofia muscular",
    restrictions: "Lactose",
    createdAt: "2025-11-10",
    ordersCount: 3,
  },
  {
    id: "p2",
    name: "Fernanda Costa",
    email: "fernanda.costa@email.com",
    phone: "(11) 91234-5678",
    cpf: "987.654.321-00",
    birthDate: "1995-08-22",
    goal: "Perda de peso",
    restrictions: "Glúten, Amendoim",
    createdAt: "2025-12-01",
    ordersCount: 5,
  },
  {
    id: "p3",
    name: "Rafael Souza",
    email: "rafael.souza@email.com",
    phone: "(11) 97654-3210",
    cpf: "456.789.123-00",
    birthDate: "1988-03-30",
    goal: "Manutenção e saúde",
    restrictions: "Nenhuma",
    createdAt: "2026-01-15",
    ordersCount: 2,
  },
  {
    id: "p4",
    name: "Juliana Alves",
    email: "juliana.alves@email.com",
    phone: "(11) 93333-2222",
    cpf: "321.654.987-00",
    birthDate: "1993-11-05",
    goal: "Controle glicêmico",
    restrictions: "Açúcar refinado",
    createdAt: "2026-01-28",
    ordersCount: 1,
  },
  {
    id: "p5",
    name: "Marcos Oliveira",
    email: "marcos.oliveira@email.com",
    phone: "(11) 94444-5555",
    cpf: "654.321.098-00",
    birthDate: "1985-07-19",
    goal: "Performance esportiva",
    restrictions: "Soja",
    createdAt: "2026-02-05",
    ordersCount: 4,
  },
];

const sampleIngredients: Record<string, Ingredient[]> = {
  frango: [
    { id: "i1", name: "Frango grelhado", category: "proteina", quantity: "180g" },
    { id: "i2", name: "Arroz integral", category: "carboidrato", quantity: "100g" },
    { id: "i3", name: "Brócolis no vapor", category: "vegetal", quantity: "80g" },
    { id: "i4", name: "Cenoura", category: "vegetal", quantity: "50g" },
    { id: "i5", name: "Azeite de oliva", category: "gordura", quantity: "10ml" },
  ],
  salmao: [
    { id: "i6", name: "Salmão assado", category: "proteina", quantity: "160g" },
    { id: "i7", name: "Batata-doce", category: "carboidrato", quantity: "120g" },
    { id: "i8", name: "Aspargos", category: "vegetal", quantity: "70g" },
    { id: "i9", name: "Limão siciliano", category: "tempero", quantity: "5g" },
  ],
};

export const mockOrders: Order[] = [
  {
    id: "ord-001",
    code: "FIB-2026-001",
    patientId: "p1",
    patientName: "Lucas Mendes",
    nutritionistId: "nut-1",
    nutritionistName: "Dra. Ana Carvalho",
    clinicName: "Clínica Nutrition Vida",
    items: [
      {
        id: "item-1",
        name: "Marmita Hipertrofia",
        ingredients: sampleIngredients.frango,
        packaging: "Embalagem 1000ml hermeticamente fechada",
        observations: "Sem sal adicional. Frango bem cozido.",
        quantity: 5,
      },
    ],
    basePrice: 18500,
    finalPrice: 22000,
    margin: 3500,
    status: "em_producao",
    nutritionalObservations: "Paciente em fase de ganho de massa. Refeição rica em proteína e carboidratos complexos. Manter temperatura acima de 65°C até consumo.",
    deliveryDate: "2026-03-10",
    paymentMethod: "pix",
    createdAt: "2026-03-05",
    paidAt: "2026-03-06",
    allowEditing: false,
  },
  {
    id: "ord-002",
    code: "FIB-2026-002",
    patientId: "p2",
    patientName: "Fernanda Costa",
    nutritionistId: "nut-1",
    nutritionistName: "Dra. Ana Carvalho",
    clinicName: "Clínica Nutrition Vida",
    items: [
      {
        id: "item-2",
        name: "Marmita Low Carb",
        ingredients: sampleIngredients.salmao,
        packaging: "Embalagem 800ml",
        observations: "Sem glúten. Usar azeite apenas no acabamento.",
        quantity: 7,
      },
    ],
    basePrice: 21000,
    finalPrice: 26000,
    margin: 5000,
    status: "aguardando_pagamento",
    nutritionalObservations: "Paciente em processo de emagrecimento. Cardápio low carb com alto teor proteico. Evitar qualquer fonte de glúten.",
    deliveryDate: "2026-03-12",
    createdAt: "2026-03-05",
    allowEditing: true,
  },
  {
    id: "ord-003",
    code: "FIB-2026-003",
    patientId: "p3",
    patientName: "Rafael Souza",
    nutritionistId: "nut-1",
    nutritionistName: "Dra. Ana Carvalho",
    clinicName: "Clínica Nutrition Vida",
    items: [
      {
        id: "item-3",
        name: "Marmita Equilíbrio",
        ingredients: sampleIngredients.frango,
        packaging: "Embalagem 900ml",
        observations: "Temperos naturais apenas.",
        quantity: 5,
      },
    ],
    basePrice: 17500,
    finalPrice: 21000,
    margin: 3500,
    status: "pronto",
    nutritionalObservations: "Cardápio equilibrado para manutenção. Refeição balanceada.",
    deliveryDate: "2026-03-09",
    paymentMethod: "cartao",
    createdAt: "2026-03-03",
    paidAt: "2026-03-04",
    allowEditing: false,
  },
  {
    id: "ord-004",
    code: "FIB-2026-004",
    patientId: "p4",
    patientName: "Juliana Alves",
    nutritionistId: "nut-1",
    nutritionistName: "Dra. Ana Carvalho",
    clinicName: "Clínica Nutrition Vida",
    items: [
      {
        id: "item-4",
        name: "Marmita Glicêmica",
        ingredients: sampleIngredients.frango,
        packaging: "Embalagem 850ml",
        observations: "Sem açúcar. Arroz integral apenas.",
        quantity: 6,
      },
    ],
    basePrice: 19500,
    finalPrice: 24000,
    margin: 4500,
    status: "rascunho",
    nutritionalObservations: "Controle glicêmico rigoroso. Sem açúcares refinados.",
    deliveryDate: "2026-03-15",
    createdAt: "2026-03-06",
    allowEditing: true,
  },
  {
    id: "ord-005",
    code: "FIB-2026-005",
    patientId: "p5",
    patientName: "Marcos Oliveira",
    nutritionistId: "nut-1",
    nutritionistName: "Dra. Ana Carvalho",
    clinicName: "Clínica Nutrition Vida",
    items: [
      {
        id: "item-5",
        name: "Marmita Performance",
        ingredients: sampleIngredients.salmao,
        packaging: "Embalagem 1100ml",
        observations: "Sem soja. Porção aumentada de proteína.",
        quantity: 10,
      },
    ],
    basePrice: 32000,
    finalPrice: 39000,
    margin: 7000,
    status: "entregue",
    nutritionalObservations: "Atleta em período de competição. Alta demanda calórica e proteica.",
    deliveryDate: "2026-03-01",
    paymentMethod: "pix",
    createdAt: "2026-02-28",
    paidAt: "2026-02-28",
    allowEditing: false,
  },
];

export const statusLabels: Record<OrderStatus, string> = {
  rascunho: "Rascunho",
  aguardando_confirmacao: "Aguard. Confirmação",
  aguardando_pagamento: "Aguard. Pagamento",
  pago: "Pago",
  em_producao: "Em Produção",
  pronto: "Pronto",
  em_entrega: "Em Entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};
