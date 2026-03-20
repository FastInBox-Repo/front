import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { mockOrders, statusLabels, formatCurrency, formatDate, OrderStatus } from "../../data/mockData";
import { useState } from "react";
import { toast } from "sonner";

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

const categoryEmoji: Record<string, string> = {
  proteina: "🥩",
  carboidrato: "🍚",
  vegetal: "🥦",
  gordura: "🫒",
  tempero: "🌿",
};

export default function CozinhaPedidoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus | null>(null);

  const order = mockOrders.find((o) => o.id === id) || mockOrders[0];
  const currentStatus = status || order.status;

  const handleUpdate = () => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setStatus(next);
    toast.success(NEXT_LABEL[currentStatus] + "!");
  };

  const nextLabel = NEXT_LABEL[currentStatus];

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/cozinha/dashboard")} className="text-gray-400 hover:text-black">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              {order.code}
            </h1>
            <span className="bg-black text-white text-xs px-2 py-1 rounded" style={{ fontWeight: 500 }}>
              {statusLabels[currentStatus]}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{order.clinicName} · {order.nutritionistName}</p>
        </div>
        {nextLabel && (
          <button
            onClick={handleUpdate}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
            style={{ fontWeight: 600 }}
          >
            {nextLabel} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Info */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Paciente</p>
            <p className="text-black" style={{ fontWeight: 600 }}>{order.patientName}</p>
            <p className="text-gray-400 text-sm mt-3">Entrega</p>
            <p className="text-black text-sm" style={{ fontWeight: 600 }}>{formatDate(order.deliveryDate)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>Valor</p>
            <p className="text-black" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.03em" }}>
              {formatCurrency(order.finalPrice)}
            </p>
            {order.paidAt && <p className="text-gray-400 text-xs mt-1">Pago em {formatDate(order.paidAt)}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-black" style={{ fontWeight: 700 }}>{item.name}</p>
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white text-xs px-2 py-1 rounded" style={{ fontWeight: 600 }}>
                    {item.quantity}x
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">
                    {item.packaging}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Ingredientes
              </p>
              <div className="space-y-1.5 mb-4">
                {item.ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span>{categoryEmoji[ing.category] || "·"}</span>
                      <span className="text-black text-sm" style={{ fontWeight: 500 }}>{ing.name}</span>
                      <span className="text-gray-400 text-xs capitalize bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                        {ing.category}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm" style={{ fontWeight: 600 }}>{ing.quantity}</span>
                  </div>
                ))}
              </div>

              {item.observations && (
                <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>Observações</p>
                  <p className="text-gray-700 text-sm">{item.observations}</p>
                </div>
              )}
            </div>
          ))}

          {order.nutritionalObservations && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Observações nutricionais
              </p>
              <p className="text-gray-600 text-sm" style={{ lineHeight: 1.7 }}>
                {order.nutritionalObservations}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
