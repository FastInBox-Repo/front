import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import { statusLabels, formatCurrency, formatDate } from "../../data/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { useSprintSession } from "../../data/sprintStore";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    rascunho: "bg-gray-100 text-gray-500 border-gray-200",
    aguardando_confirmacao: "bg-gray-100 text-gray-600 border-gray-200",
    aguardando_pagamento: "bg-gray-100 text-gray-600 border-gray-200",
    pago: "bg-black text-white border-black",
    em_producao: "bg-gray-800 text-white border-gray-800",
    pronto: "bg-gray-600 text-white border-gray-600",
    em_entrega: "bg-gray-400 text-white border-gray-400",
    entregue: "bg-gray-200 text-gray-700 border-gray-300",
    cancelado: "bg-gray-100 text-gray-400 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded border text-xs ${styles[status] || ""}`} style={{ fontWeight: 500 }}>
      {statusLabels[status as keyof typeof statusLabels]}
    </span>
  );
};

export default function PedidoResumoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { orders } = useSprintSession();

  const order = orders.find((o) => o.id === id) || orders[0];

  if (!order) {
    return (
      <div className="p-8" role="alert">
        <p className="text-gray-900 text-sm">Nenhum pedido encontrado.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/paciente/pedido/${order.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copiado!");
  };

  return (
    <div className="p-8 max-w-4xl">
      <header className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/nutricionista/dashboard")}
          className="text-gray-700 hover:text-black transition-colors"
          type="button"
          aria-label="Voltar ao dashboard"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" focusable="false" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
              <span className="sr-only">Pedido </span>
              {order.code}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-900 text-sm mt-0.5">
            Criado em <time dateTime={new Date(order.createdAt).toISOString()}>{formatDate(order.createdAt)}</time>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/paciente/pedido/${order.code}`)}
            className="flex items-center gap-1.5 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
            style={{ fontWeight: 500 }}
            type="button"
            aria-label="Pré-visualizar como paciente"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Prévia
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-md text-sm hover:bg-gray-900 transition-colors"
            style={{ fontWeight: 500 }}
            type="button"
            aria-label={copied ? "Link copiado" : "Copiar link de acompanhamento"}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            )}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <section className="bg-white border border-gray-200 rounded-lg p-5" aria-labelledby="patient-card-title">
            <h2 id="patient-card-title" className="text-xs text-gray-900 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Paciente</h2>
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>
                  {order.patientName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              </span>
              <div>
                <p className="text-black m-0" style={{ fontWeight: 600 }}>{order.patientName}</p>
                <p className="text-gray-900 text-sm m-0">Entrega: <time dateTime={order.deliveryDate}>{formatDate(order.deliveryDate)}</time></p>
              </div>
            </div>
          </section>

          {order.items.map((item) => (
            <section key={item.id} className="bg-white border border-gray-200 rounded-lg p-5" aria-labelledby={`item-${item.id}-title`}>
              <div className="flex items-center justify-between mb-4">
                <h2 id={`item-${item.id}-title`} className="text-black m-0" style={{ fontWeight: 600 }}>{item.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded border border-gray-300">
                    <span className="sr-only">Quantidade: </span>
                    {item.quantity}x
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded border border-gray-300">
                    {item.packaging}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <h3 className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                  Ingredientes
                </h3>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 list-none p-0 m-0">
                  {item.ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-center justify-between border border-gray-200 rounded-md px-2.5 py-2 bg-gray-50">
                      <div>
                        <p className="text-black text-xs m-0" style={{ fontWeight: 500 }}>{ing.name}</p>
                        <p className="text-gray-900 text-xs capitalize m-0">{ing.category}</p>
                      </div>
                      <span className="text-gray-900 text-xs">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {item.observations && (
                <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 m-0">
                  Obs: {item.observations}
                </p>
              )}
            </section>
          ))}

          {order.nutritionalObservations && (
            <aside className="bg-white border border-gray-200 rounded-lg p-5" aria-labelledby="nutri-obs-title">
              <h2 id="nutri-obs-title" className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Observações nutricionais
              </h2>
              <p className="text-gray-900 text-sm m-0" style={{ lineHeight: 1.7 }}>
                {order.nutritionalObservations}
              </p>
            </aside>
          )}
        </div>

        <aside className="space-y-4" aria-label="Resumo lateral do pedido">
          <section className="bg-black rounded-lg p-5 text-center" data-dark-surface aria-labelledby="order-code-label">
            <p id="order-code-label" className="text-gray-100 text-xs mb-2">Código do pedido</p>
            <p className="text-white m-0" style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "0.08em" }}>
              {order.code}
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5" aria-labelledby="values-title">
            <h2 id="values-title" className="text-xs text-gray-900 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Valores</h2>
            <dl className="space-y-2 m-0">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-900">Preço base</dt>
                <dd className="m-0">{formatCurrency(order.basePrice)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-900">Margem</dt>
                <dd className="m-0">{formatCurrency(order.margin)}</dd>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <dt className="text-black" style={{ fontWeight: 600 }}>Total ao paciente</dt>
                <dd className="text-black m-0" style={{ fontWeight: 700 }}>{formatCurrency(order.finalPrice)}</dd>
              </div>
              {order.paidAt && (
                <p className="text-xs text-gray-900 mt-1 m-0">
                  Pago em <time dateTime={order.paidAt}>{formatDate(order.paidAt)}</time>
                </p>
              )}
            </dl>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5" aria-labelledby="status-title">
            <h2 id="status-title" className="text-xs text-gray-900 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Status</h2>
            <StatusBadge status={order.status} />
            <ol className="mt-3 space-y-2 list-none p-0">
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-black" aria-hidden="true" />
                <span className="text-gray-900">
                  Criado: <time dateTime={new Date(order.createdAt).toISOString()}>{formatDate(order.createdAt)}</time>
                </span>
              </li>
              {order.paidAt && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-black" aria-hidden="true" />
                  <span className="text-gray-900">
                    Pago: <time dateTime={order.paidAt}>{formatDate(order.paidAt)}</time>
                  </span>
                </li>
              )}
            </ol>
          </section>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/paciente/pedido/${order.code}`)}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-900 py-2.5 rounded-md text-sm hover:border-black transition-colors"
              style={{ fontWeight: 500 }}
              type="button"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" focusable="false" /> Ver como paciente
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
