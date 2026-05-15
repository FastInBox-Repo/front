import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { statusLabels, formatCurrency, formatDate, OrderStatus } from "../../data/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";

const NEXT_STATUS: Record<string, OrderStatus> = {
  pago: "em_producao",
  em_producao: "pronto",
  pronto: "em_entrega",
  em_entrega: "entregue",
};

const NEXT_LABEL: Record<string, string> = {
  pago: "Iniciar produção",
  em_producao: "Marcar pronto",
  pronto: "Saiu para entrega",
  em_entrega: "Confirmar entrega",
};

const categoryEmoji: Record<string, { emoji: string; label: string }> = {
  proteina: { emoji: "🥩", label: "Proteína" },
  carboidrato: { emoji: "🍚", label: "Carboidrato" },
  vegetal: { emoji: "🥦", label: "Vegetal" },
  gordura: { emoji: "🫒", label: "Gordura" },
  tempero: { emoji: "🌿", label: "Tempero" },
};

export default function CozinhaPedidoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const { orders } = useSprintSession();

  const order = orders.find((o) => o.id === id) || orders[0];

  if (!order) {
    return (
      <div className="p-6" role="alert">
        <p className="text-gray-900 text-sm">Pedido não encontrado.</p>
      </div>
    );
  }

  const currentStatus = status || order.status;

  const handleUpdate = async () => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setStatus(next);
    await sprintStoreActions.updateOrderStatus(order.id, next);
    toast.success(NEXT_LABEL[currentStatus] + "!");
  };

  const nextLabel = NEXT_LABEL[currentStatus];

  return (
    <div className="p-6 max-w-3xl">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/cozinha/dashboard")}
          className="text-gray-700 hover:text-black"
          type="button"
          aria-label="Voltar ao quadro de pedidos"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" focusable="false" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              <span className="sr-only">Pedido </span>
              {order.code}
            </h1>
            <span className="bg-black text-white text-xs px-2 py-1 rounded" style={{ fontWeight: 500 }}>
              <span className="sr-only">Status: </span>
              {statusLabels[currentStatus]}
            </span>
          </div>
          <p className="text-gray-900 text-sm">{order.clinicName} · {order.nutritionistName}</p>
        </div>
        {nextLabel && (
          <button
            onClick={handleUpdate}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
            style={{ fontWeight: 600 }}
            type="button"
            aria-label={`Avançar status: ${nextLabel}`}
          >
            {nextLabel} <ChevronRight className="w-4 h-4" aria-hidden="true" focusable="false" />
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <aside className="space-y-4" aria-label="Informações do pedido">
          <section className="bg-white border border-gray-200 rounded-lg p-4" aria-labelledby="pat-title">
            <h2 id="pat-title" className="text-xs text-gray-900 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Paciente</h2>
            <p className="text-black m-0" style={{ fontWeight: 600 }}>{order.patientName}</p>
            <p className="text-gray-900 text-sm mt-3 m-0">Entrega</p>
            <p className="text-black text-sm m-0" style={{ fontWeight: 600 }}>
              <time dateTime={order.deliveryDate}>{formatDate(order.deliveryDate)}</time>
            </p>
          </section>
          <section className="bg-white border border-gray-200 rounded-lg p-4" aria-labelledby="value-title">
            <h2 id="value-title" className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Valor</h2>
            <p className="text-black m-0" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.03em" }}>
              {formatCurrency(order.finalPrice)}
            </p>
            {order.paidAt && (
              <p className="text-gray-900 text-xs mt-1 m-0">
                Pago em <time dateTime={order.paidAt}>{formatDate(order.paidAt)}</time>
              </p>
            )}
          </section>
        </aside>

        <div className="md:col-span-2 space-y-4">
          {order.items.map((item) => (
            <section key={item.id} className="bg-white border border-gray-200 rounded-lg p-5" aria-labelledby={`item-${item.id}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 id={`item-${item.id}`} className="text-black m-0" style={{ fontWeight: 700 }}>{item.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white text-xs px-2 py-1 rounded" style={{ fontWeight: 600 }}>
                    <span className="sr-only">Quantidade: </span>
                    {item.quantity}x
                  </span>
                  <span className="bg-gray-100 text-gray-900 text-xs px-2 py-1 rounded border border-gray-300">
                    {item.packaging}
                  </span>
                </div>
              </div>

              <h3 className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Ingredientes
              </h3>
              <ul className="space-y-1.5 mb-4 list-none p-0 m-0">
                {item.ingredients.map((ing) => {
                  const cat = categoryEmoji[ing.category] || { emoji: "·", label: ing.category };
                  return (
                    <li key={ing.id} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true">{cat.emoji}</span>
                        <span className="sr-only">{cat.label}: </span>
                        <span className="text-black text-sm" style={{ fontWeight: 500 }}>{ing.name}</span>
                        <span className="text-gray-900 text-xs capitalize bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                          {ing.category}
                        </span>
                      </div>
                      <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>{ing.quantity}</span>
                    </li>
                  );
                })}
              </ul>

              {item.observations && (
                <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                  <p className="text-xs text-gray-900 mb-0.5 m-0" style={{ fontWeight: 500 }}>Observações</p>
                  <p className="text-gray-900 text-sm m-0">{item.observations}</p>
                </div>
              )}
            </section>
          ))}

          {order.nutritionalObservations && (
            <aside className="bg-white border border-gray-200 rounded-lg p-5" aria-labelledby="nutri-title">
              <h2 id="nutri-title" className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Observações nutricionais
              </h2>
              <p className="text-gray-900 text-sm m-0" style={{ lineHeight: 1.7 }}>
                {order.nutritionalObservations}
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
