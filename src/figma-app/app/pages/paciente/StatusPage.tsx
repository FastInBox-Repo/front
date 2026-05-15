import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Package, ChefHat, Truck, CheckCircle, Clock, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../../data/mockData";
import { useSprintSession } from "../../data/sprintStore";
import { formatAuditDate, formatAuditTimeAgo, useAuditLog } from "../../data/auditStore";
import SkipLink from "../../components/a11y/SkipLink";

const STATUS_STEPS = [
  { id: "pago", icon: CheckCircle, label: "Pagamento confirmado", desc: "Seu pagamento foi aprovado" },
  { id: "em_producao", icon: ChefHat, label: "Em produção", desc: "A cozinha está preparando seu pedido" },
  { id: "pronto", icon: Package, label: "Pronto para entrega", desc: "Seu pedido foi embalado" },
  { id: "em_entrega", icon: Truck, label: "Saiu para entrega", desc: "Pedido a caminho" },
  { id: "entregue", icon: CheckCircle, label: "Entregue", desc: "Pedido recebido com sucesso" },
];

const STATUS_ORDER = ["pago", "em_producao", "pronto", "em_entrega", "entregue"];

export default function StatusPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { orders, clinic } = useSprintSession();
  const auditEvents = useAuditLog();
  const order = orders.find((o) => o.code === code);
  const [lastSyncAt, setLastSyncAt] = useState(() => new Date());

  useEffect(() => {
    setLastSyncAt(new Date());
  }, [order?.status]);

  const timelineEvents = useMemo(() => {
    if (!order) return new Map<string, string>();
    const map = new Map<string, string>();
    auditEvents.forEach((event) => {
      if (event.targetId !== order.id && event.targetCode !== order.code) return;
      if (event.type === "order_paid") {
        if (!map.has("pago")) map.set("pago", event.createdAt);
        return;
      }
      if (event.type === "order_status_changed" && event.metadata?.to) {
        const toStatus = String(event.metadata.to);
        if (!map.has(toStatus)) map.set(toStatus, event.createdAt);
      }
    });
    return map;
  }, [auditEvents, order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center" role="alert">
          <p className="text-gray-900 text-sm mb-3">Pedido não encontrado.</p>
          <button
            onClick={() => navigate("/paciente")}
            className="bg-black text-white px-4 py-2 rounded-md text-sm"
            style={{ fontWeight: 600 }}
            type="button"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const currentStepIdx = STATUS_ORDER.indexOf(order.status);
  const currentStep = currentStepIdx === -1 ? 0 : currentStepIdx;

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink />
      <header className="bg-black text-white" data-dark-surface>
        <div className="max-w-2xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate(`/paciente/pedido/${code}`)}
            className="flex items-center gap-1.5 text-gray-100 hover:text-white transition-colors mb-3 text-sm"
            type="button"
            aria-label="Voltar ao pedido"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" /> Voltar
          </button>
          <p className="text-white m-0" style={{ fontWeight: 700, fontSize: "1.125rem" }}>{clinic.name}</p>
          <p className="text-gray-100 text-sm m-0">Acompanhamento do pedido</p>
        </div>
      </header>

      <main id="main-content" className="max-w-2xl mx-auto px-4 py-6" tabIndex={-1}>
        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-4" aria-labelledby="order-info-title">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="order-info-title" className="text-xs text-gray-900 uppercase tracking-wider mb-1 m-0" style={{ fontWeight: 600 }}>
                Pedido
              </h2>
              <p className="text-black m-0" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "0.05em" }}>
                {order.code}
              </p>
              <p className="text-gray-900 text-sm m-0">{order.items[0]?.name} · {order.items[0]?.quantity}x</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-900 mb-1 m-0">Entrega prevista</p>
              <p className="text-black m-0" style={{ fontWeight: 700 }}>
                <time dateTime={order.deliveryDate}>{formatDate(order.deliveryDate)}</time>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-4" aria-labelledby="timeline-title">
          <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
            <h2 id="timeline-title" className="text-xs text-gray-900 uppercase tracking-wider m-0" style={{ fontWeight: 600 }}>
              Status do pedido
            </h2>
            <div className="flex items-center gap-1.5" role="status" aria-live="polite">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
              </span>
              <span className="text-[10px] text-gray-900" style={{ fontWeight: 600 }}>
                Atualizado <time dateTime={lastSyncAt.toISOString()}>{formatAuditTimeAgo(lastSyncAt.toISOString())}</time>
              </span>
              <Radio className="w-3 h-3 text-gray-700" aria-hidden="true" focusable="false" />
            </div>
          </div>
          <ol className="space-y-0 list-none p-0 m-0" aria-label="Linha do tempo do pedido">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const Icon = step.icon;
              const eventAt = timelineEvents.get(step.id);

              return (
                <li key={step.id} className="flex gap-4" aria-current={isCurrent ? "step" : undefined}>
                  <div className="flex flex-col items-center" aria-hidden="true">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? "bg-black border-black"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${isDone ? "text-white" : "text-gray-700"}`}
                        aria-hidden="true"
                        focusable="false"
                      />
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mt-1 ${
                          idx < currentStep ? "bg-black" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className={`pb-6 ${idx === STATUS_STEPS.length - 1 ? "pb-0" : ""}`}>
                    <p
                      className={`text-sm m-0 ${isDone ? "text-black" : "text-gray-900"}`}
                      style={{ fontWeight: isCurrent ? 700 : 500 }}
                    >
                      <span className="sr-only">
                        {isDone && !isCurrent ? "Concluído: " : isCurrent ? "Status atual: " : "Próximo: "}
                      </span>
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center gap-1 bg-black text-white text-xs px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" aria-hidden="true" focusable="false" /> Atual
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 m-0 ${isDone ? "text-gray-900" : "text-gray-900"}`}>
                      {step.desc}
                    </p>
                    {eventAt && (
                      <p className="text-[10px] text-gray-900 mt-1 font-mono m-0">
                        <time dateTime={new Date(eventAt).toISOString()}>{formatAuditDate(eventAt)}</time>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="bg-white border border-gray-200 rounded-xl p-5" aria-labelledby="contact-card-title">
          <h2 id="contact-card-title" className="text-xs text-gray-900 uppercase tracking-wider mb-3 m-0" style={{ fontWeight: 600 }}>
            Contato
          </h2>
          <p className="text-black text-sm m-0" style={{ fontWeight: 600 }}>{clinic.nutritionistName}</p>
          <p className="text-gray-900 text-sm m-0">
            <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} className="underline underline-offset-2" aria-label={`Telefone ${clinic.phone}`}>
              {clinic.phone}
            </a>
          </p>
          <p className="text-gray-900 text-sm m-0">{clinic.address}</p>
        </aside>

        <p className="text-center text-gray-900 text-xs mt-6">
          FastInBox · Acompanhe cada etapa do seu pedido
        </p>
      </main>
    </div>
  );
}
