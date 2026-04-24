import { useMemo, useState } from "react";
import {
  Activity,
  CreditCard,
  Download,
  LogIn,
  LogOut,
  Package,
  RefreshCw,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  AuditEvent,
  AuditEventType,
  auditActions,
  auditLabels,
  formatAuditDate,
  formatAuditTimeAgo,
  useAuditLog,
} from "../../data/auditStore";

type FilterKey = "all" | AuditEventType;

const typeIcon: Record<AuditEventType, typeof Activity> = {
  login: LogIn,
  logout: LogOut,
  login_failed: ShieldAlert,
  user_registered: UserPlus,
  patient_created: Users,
  order_created: Package,
  order_paid: CreditCard,
  order_status_changed: RefreshCw,
};

const typeAccent: Record<AuditEventType, string> = {
  login: "bg-black text-white",
  logout: "bg-gray-200 text-gray-700",
  login_failed: "bg-gray-900 text-white",
  user_registered: "bg-gray-800 text-white",
  patient_created: "bg-gray-700 text-white",
  order_created: "bg-black text-white",
  order_paid: "bg-black text-white",
  order_status_changed: "bg-gray-600 text-white",
};

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "login", label: "Logins" },
  { key: "login_failed", label: "Falhas" },
  { key: "user_registered", label: "Cadastros" },
  { key: "patient_created", label: "Pacientes" },
  { key: "order_created", label: "Pedidos" },
  { key: "order_paid", label: "Pagamentos" },
  { key: "order_status_changed", label: "Status" },
];

const exportJson = (events: AuditEvent[]) => {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(events, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `fastinbox-auditoria-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function AdminAuditoriaPage() {
  const events = useAuditLog();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesType = filter === "all" ? true : event.type === filter;
      if (!matchesType) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        event.description.toLowerCase().includes(q) ||
        event.actorName.toLowerCase().includes(q) ||
        (event.targetCode?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [events, filter, query]);

  const totals = useMemo(() => {
    return {
      total: events.length,
      criticos: events.filter((event) =>
        ["order_paid", "order_status_changed", "login_failed"].includes(event.type),
      ).length,
      ultima: events[0]?.createdAt ?? null,
    };
  }, [events]);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Auditoria operacional
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Histórico rastreável de login, cadastros, pedidos, pagamentos e mudanças de status.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              exportJson(filtered);
              toast.success("Auditoria exportada em JSON");
            }}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Download className="w-3.5 h-3.5" /> Exportar JSON
          </button>
          <button
            onClick={() => {
              auditActions.clear();
              toast.success("Histórico de auditoria limpo");
            }}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <Activity className="w-4 h-4 text-gray-400 mb-3" />
          <p className="text-black" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {totals.total}
          </p>
          <p className="text-gray-500 text-xs mt-1">Eventos registrados (últimos 200)</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <ShieldAlert className="w-4 h-4 text-gray-400 mb-3" />
          <p className="text-black" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {totals.criticos}
          </p>
          <p className="text-gray-500 text-xs mt-1">Eventos críticos (pagamento, status, falhas)</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <RefreshCw className="w-4 h-4 text-gray-400 mb-3" />
          <p className="text-black" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {totals.ultima ? formatAuditTimeAgo(totals.ultima) : "Sem atividade"}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {totals.ultima ? formatAuditDate(totals.ultima) : "Aguardando primeiro evento"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  filter === item.key
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-black"
                }`}
                style={{ fontWeight: 500 }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por usuário, código ou descrição"
            className="border border-gray-200 rounded-md px-3 py-1.5 text-xs w-full md:w-72 focus:outline-none focus:border-black"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Activity className="w-6 h-6 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500" style={{ fontWeight: 500 }}>
              Nenhum evento encontrado com os filtros atuais.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Faça login, crie um pedido ou movimente um status para ver eventos aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((event) => {
              const Icon = typeIcon[event.type] ?? Activity;
              const accent = typeAccent[event.type] ?? "bg-gray-100 text-gray-500";
              return (
                <article key={event.id} className="px-6 py-4 flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${accent}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-black" style={{ fontWeight: 600 }}>
                        {auditLabels[event.type] ?? event.type}
                      </p>
                      {event.targetCode && (
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>
                          {event.targetCode}
                        </span>
                      )}
                      <span className="text-[10px] uppercase tracking-wider text-gray-400">
                        {event.actorRole}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>
                    {event.metadata && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-[10px] bg-gray-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded"
                          >
                            <span className="text-gray-400">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                      {formatAuditTimeAgo(event.createdAt)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatAuditDate(event.createdAt)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        A auditoria é persistida no dispositivo do operador e se atualiza automaticamente em todas as abas abertas (sincronização via storage events).
      </p>
    </div>
  );
}
