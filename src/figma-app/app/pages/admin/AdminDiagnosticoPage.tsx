import { useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Clock,
  Loader2,
  Play,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  SprintOrder,
  sprintStoreActions,
  useSprintSession,
} from "../../data/sprintStore";
import { statusLabels } from "../../data/mockData";

type StepStatus = "pending" | "running" | "ok" | "fail";

interface Step {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  message?: string;
  durationMs?: number;
}

const INITIAL_STEPS: Step[] = [
  {
    id: "hydrate",
    title: "Hidratar sessão",
    description: "Verifica se a persistência local carrega pacientes, pedidos e usuários.",
    status: "pending",
  },
  {
    id: "auth",
    title: "Autenticar nutricionista",
    description: "Login com credencial padrão e validação do perfil retornado.",
    status: "pending",
  },
  {
    id: "patient",
    title: "Cadastrar paciente",
    description: "Criar paciente sintético e garantir que aparece imediatamente na listagem.",
    status: "pending",
  },
  {
    id: "order",
    title: "Gerar pedido",
    description: "Criar pedido vinculado ao novo paciente com código único e itens válidos.",
    status: "pending",
  },
  {
    id: "payment",
    title: "Simular pagamento",
    description: "Marcar o pedido como pago (PIX) e validar que avançou para o status pago.",
    status: "pending",
  },
  {
    id: "status",
    title: "Avançar status (kanban)",
    description: "Enviar o pedido para produção e validar que o estado sincronizou.",
    status: "pending",
  },
  {
    id: "cleanup",
    title: "Limpar sessão de teste",
    description: "Encerrar sessão do nutricionista e deixar o ambiente pronto para nova execução.",
    status: "pending",
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const statusStyles: Record<StepStatus, { icon: typeof CircleDashed; accent: string; pill: string }> = {
  pending: {
    icon: CircleDashed,
    accent: "text-gray-300",
    pill: "bg-gray-100 text-gray-500 border-gray-200",
  },
  running: {
    icon: Loader2,
    accent: "text-black",
    pill: "bg-black text-white border-black",
  },
  ok: {
    icon: CheckCircle2,
    accent: "text-black",
    pill: "bg-black text-white border-black",
  },
  fail: {
    icon: XCircle,
    accent: "text-black",
    pill: "bg-gray-900 text-white border-gray-900",
  },
};

const pillLabel: Record<StepStatus, string> = {
  pending: "Pendente",
  running: "Executando",
  ok: "OK",
  fail: "Falhou",
};

export default function AdminDiagnosticoPage() {
  const session = useSprintSession();
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<{
    passed: number;
    total: number;
    finishedAt: string | null;
    durationMs: number | null;
  } | null>(null);

  const updateStep = (id: string, patch: Partial<Step>) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, ...patch } : step)));
  };

  const runSmokeTest = async () => {
    if (running) return;
    setRunning(true);
    setSteps(INITIAL_STEPS.map((step) => ({ ...step, status: "pending" as StepStatus, message: undefined })));
    setSummary(null);

    const startedAt = Date.now();
    const results: StepStatus[] = [];

    const runStep = async (id: string, fn: () => Promise<string>) => {
      updateStep(id, { status: "running", message: undefined });
      const stepStart = Date.now();
      try {
        const message = await fn();
        const durationMs = Date.now() - stepStart;
        updateStep(id, { status: "ok", message, durationMs });
        results.push("ok");
      } catch (error) {
        const durationMs = Date.now() - stepStart;
        const message = error instanceof Error ? error.message : "Falha inesperada";
        updateStep(id, { status: "fail", message, durationMs });
        results.push("fail");
      }
      await wait(250);
    };

    await runStep("hydrate", async () => {
      await wait(200);
      const snapshot = sprintStoreActions.getCurrentUser?.() ?? null;
      const ordersCount = session.orders.length;
      const patientsCount = session.patients.length;
      if (ordersCount === 0 || patientsCount === 0) {
        throw new Error("Store vazio: esperava pacientes e pedidos carregados.");
      }
      return `${patientsCount} pacientes e ${ordersCount} pedidos hidratados${snapshot ? ` (sessão ativa: ${snapshot.name})` : ""}.`;
    });

    await runStep("auth", async () => {
      await wait(300);
      const user = sprintStoreActions.login(
        "ana@nutritionvida.com.br",
        "123456",
        "nutricionista",
      );
      if (!user) {
        throw new Error("Login do nutricionista padrão não retornou usuário.");
      }
      if (user.role !== "nutricionista") {
        throw new Error("Perfil retornado não é nutricionista.");
      }
      return `Autenticado como ${user.name}.`;
    });

    let smokePatientId: string | null = null;
    await runStep("patient", async () => {
      await wait(250);
      const patient = sprintStoreActions.createPatient({
        name: `Smoke Test ${new Date().toISOString().slice(11, 19)}`,
        email: `smoke-${Date.now()}@fastinbox.test`,
        phone: "(11) 00000-0000",
        cpf: "000.000.000-00",
        birthDate: "1990-01-01",
        goal: "Teste E2E",
        restrictions: "Nenhuma",
      });
      smokePatientId = patient.id;
      return `Paciente ${patient.name} criado (id ${patient.id}).`;
    });

    let smokeOrder: SprintOrder | null = null;
    await runStep("order", async () => {
      await wait(300);
      if (!smokePatientId) {
        throw new Error("Paciente de teste não disponível.");
      }
      const order = sprintStoreActions.createOrder({
        patientId: smokePatientId,
        nutritionistId: "nut-1",
        nutritionistName: "Dra. Ana Carvalho",
        clinicName: "Clínica Nutrition Vida",
        items: [
          {
            id: `smoke-item-${Date.now()}`,
            name: "Marmita Smoke Test",
            ingredients: [
              { id: "i-s1", name: "Frango grelhado", category: "proteina", quantity: "180g" },
              { id: "i-s2", name: "Arroz integral", category: "carboidrato", quantity: "120g" },
            ],
            packaging: "Embalagem teste 900ml",
            observations: "Teste automatizado.",
            quantity: 3,
          },
        ],
        basePrice: 9000,
        finalPrice: 12000,
        margin: 3000,
        deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        nutritionalObservations: "Cardápio de teste.",
        allowEditing: false,
        factoryId: "fac-1",
        factoryName: "Fabrica Central FastInBox",
      });
      smokeOrder = order;
      if (!order.code.startsWith("FIB-")) {
        throw new Error("Código do pedido fora do padrão esperado.");
      }
      return `Pedido ${order.code} criado, total R$ ${(order.finalPrice / 100).toFixed(2)}.`;
    });

    await runStep("payment", async () => {
      await wait(300);
      if (!smokeOrder) {
        throw new Error("Pedido de teste não disponível.");
      }
      sprintStoreActions.markOrderAsPaid(smokeOrder.code, "pix");
      return `${smokeOrder.code} marcado como pago via PIX.`;
    });

    await runStep("status", async () => {
      await wait(300);
      if (!smokeOrder) {
        throw new Error("Pedido de teste não disponível.");
      }
      sprintStoreActions.updateOrderStatus(smokeOrder.id, "em_producao");
      return `${smokeOrder.code}: ${statusLabels.pago} -> ${statusLabels.em_producao}.`;
    });

    await runStep("cleanup", async () => {
      await wait(200);
      sprintStoreActions.logout();
      return "Sessão encerrada e estado persistido.";
    });

    const finishedAt = new Date().toISOString();
    const durationMs = Date.now() - startedAt;
    const passed = results.filter((result) => result === "ok").length;
    setSummary({ passed, total: results.length, finishedAt, durationMs });

    if (passed === results.length) {
      toast.success(`Smoke test OK em ${Math.round(durationMs / 10) / 100}s`);
    } else {
      toast.error(`Smoke test com ${results.length - passed} falha(s)`);
    }
    setRunning(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Diagnóstico E2E
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 max-w-xl">
            Smoke test automatizado que simula a jornada completa: login, cadastro de paciente, criação de pedido,
            pagamento e avanço de status. Use antes de cada demo para garantir que o fluxo principal está saudável.
          </p>
        </div>
        <button
          onClick={runSmokeTest}
          disabled={running}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-60"
          style={{ fontWeight: 600 }}
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Executando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Rodar smoke test
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <CheckCircle2 className="w-4 h-4 text-gray-400 mb-3" />
          <p className="text-black" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {summary ? `${summary.passed}/${summary.total}` : "--"}
          </p>
          <p className="text-gray-500 text-xs mt-1">Passos concluídos com sucesso</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <Clock className="w-4 h-4 text-gray-400 mb-3" />
          <p className="text-black" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {summary?.durationMs ? `${Math.round(summary.durationMs / 10) / 100}s` : "--"}
          </p>
          <p className="text-gray-500 text-xs mt-1">Duração da execução</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <CircleDashed className="w-4 h-4 text-gray-400 mb-3" />
          <p className="text-black" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {summary?.finishedAt
              ? new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(summary.finishedAt))
              : "Ainda não executado"}
          </p>
          <p className="text-gray-500 text-xs mt-1">Última execução</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm text-black" style={{ fontWeight: 600 }}>
              Passos do smoke test
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Execução sequencial, cada passo com critério de aceite próprio.
            </p>
          </div>
        </div>
        <ol className="divide-y divide-gray-50">
          {steps.map((step, idx) => {
            const visuals = statusStyles[step.status];
            const Icon = visuals.icon;
            return (
              <li key={step.id} className="px-6 py-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${visuals.accent} ${step.status === "running" ? "animate-spin" : ""}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">#{String(idx + 1).padStart(2, "0")}</span>
                    <p className="text-sm text-black" style={{ fontWeight: 600 }}>
                      {step.title}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${visuals.pill}`}
                      style={{ fontWeight: 600 }}
                    >
                      {pillLabel[step.status]}
                    </span>
                    {typeof step.durationMs === "number" && (
                      <span className="text-[10px] text-gray-400">{step.durationMs}ms</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  {step.message && (
                    <p
                      className={`text-xs mt-2 px-3 py-2 rounded-md border ${
                        step.status === "fail"
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-gray-50 text-gray-700 border-gray-100"
                      }`}
                    >
                      {step.message}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Dica: abra a página de Auditoria em outra aba antes de rodar o smoke test para ver os eventos sendo registrados em tempo real via sincronização entre abas.
      </p>
    </div>
  );
}
