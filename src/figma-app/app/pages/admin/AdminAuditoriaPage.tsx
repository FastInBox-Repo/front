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

  const handleClear = () => {
    if (window.confirm("Confirma limpar todo o histórico de auditoria? Esta ação não pode ser desfeita.")) {
      auditActions.clear();
      toast.success("Histórico de auditoria limpo");
    }
  };

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

  const searchInputId = "audit-search";

  return (
    <div className="p-8">
      <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Auditoria operacional
          </h1>
          <p className="text-gray-900 text-sm mt-0.5">
            Histórico rastreável de login, cadastros, pedidos, pagamentos e mudanças de status.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Ações da auditoria">
          <button
            onClick={() => {
              exportJson(filtered);
              toast.success("Auditoria exportada em JSON");
            }}
            className="flex items-center gap-2 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
            style={{ fontWeight: 500 }}
            type="button"
            aria-label="Exportar eventos filtrados como arquivo JSON"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Exportar JSON
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
            style={{ fontWeight: 500 }}
            type="button"
            aria-label="Limpar histórico de auditoria"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Limpar
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" aria-label="Resumo da auditoria">
        <article className="bg-white border border-gray-200 rounded-lg p-5" aria-label={`${totals.total} eventos registrados`}>
          <Activity className="w-4 h-4 text-gray-700 mb-3" aria-hidden="true" focusable="false" />
          <p className="text-black" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {totals.total}
          </p>
          <p className="text-gray-900 text-xs mt-1">Eventos registrados (últimos 200)</p>
        </article>
        <article className="bg-white border border-gray-200 rounded-lg p-5" aria-label={`${totals.criticos} eventos críticos`}>
          <ShieldAlert className="w-4 h-4 text-gray-700 mb-3" aria-hidden="true" focusable="false" />
          <p className="text-black" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {totals.criticos}
          </p>
          <p className="text-gray-900 text-xs mt-1">Eventos críticos (pagamento, status, falhas)</p>
        </article>
        <article className="bg-white border border-gray-200 rounded-lg p-5">
          <RefreshCw className="w-4 h-4 text-gray-700 mb-3" aria-hidden="true" focusable="false" />
          <p className="text-black" style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {totals.ultima ? formatAuditTimeAgo(totals.ultima) : "Sem atividade"}
          </p>
          <p className="text-gray-900 text-xs mt-1">
            {totals.ultima ? formatAuditDate(totals.ultima) : "Aguardando primeiro evento"}
          </p>
        </article>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg" aria-label="Lista de eventos">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Filtrar por tipo de evento">
            {filters.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-900 border-gray-300 hover:border-black"
                  }`}
                  style={{ fontWeight: 500 }}
                  type="button"
                  role="radio"
                  aria-checked={active}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div>
            <label htmlFor={searchInputId} className="sr-only">Buscar por usuário, código ou descrição</label>
            <input
              id={searchInputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por usuário, código ou descrição"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-xs w-full md:w-72 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center" role="status" aria-live="polite">
            <Activity className="w-6 h-6 text-gray-700 mx-auto mb-3" aria-hidden="true" focusable="false" />
            <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
              Nenhum evento encontrado com os filtros atuais.
            </p>
            <p className="text-xs text-gray-900 mt-1">
              Faça login, crie um pedido ou movimente um status para ver eventos aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 list-none p-0 m-0" aria-live="polite">
            {filtered.map((event) => {
              const Icon = typeIcon[event.type] ?? Activity;
              const accent = typeAccent[event.type] ?? "bg-gray-100 text-gray-900";
              return (
                <li key={event.id}>
                  <article className="px-6 py-4 flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${accent}`}
                      aria-hidden="true"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm text-black m-0" style={{ fontWeight: 600 }}>
                          {auditLabels[event.type] ?? event.type}
                        </h3>
                        {event.targetCode && (
                          <span className="text-[10px] font-mono bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>
                            {event.targetCode}
                          </span>
                        )}
                        <span className="text-[10px] uppercase tracking-wider text-gray-900">
                          {event.actorRole}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mt-0.5">{event.description}</p>
                      {event.metadata && (
                        <dl className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-[10px] bg-gray-50 border border-gray-200 text-gray-900 px-1.5 py-0.5 rounded"
                            >
                              <dt className="inline text-gray-900">{key}:</dt>{" "}
                              <dd className="inline m-0">{String(value)}</dd>
                            </span>
                          ))}
                        </dl>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <time
                        className="text-xs text-gray-900"
                        style={{ fontWeight: 500 }}
                        dateTime={new Date(event.createdAt).toISOString()}
                      >
                        {formatAuditTimeAgo(event.createdAt)}
                      </time>
                      <p className="text-[10px] text-gray-900 mt-0.5">{formatAuditDate(event.createdAt)}</p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-4 text-xs text-gray-900">
        A auditoria é persistida no dispositivo do operador e se atualiza automaticamente em todas as abas abertas (sincronização via storage events).
      </p>
    </div>
  );
}
