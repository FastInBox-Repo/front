import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Clock, ChefHat, Package, Truck, CheckCircle, RefreshCw } from "lucide-react";
import { mockOrders, formatDate, formatCurrency, Order, OrderStatus } from "../../data/mockData";
import { toast } from "sonner";

const KITCHEN_STATUSES: { id: OrderStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "pago", label: "Novo (pago)", icon: Clock },
  { id: "em_producao", label: "Em produção", icon: ChefHat },
  { id: "pronto", label: "Pronto", icon: Package },
  { id: "em_entrega", label: "Em entrega", icon: Truck },
  { id: "entregue", label: "Entregue", icon: CheckCircle },
];

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

export default function CozinhaDashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(
    mockOrders.filter((o) =>
      ["pago", "em_producao", "pronto", "em_entrega", "entregue"].includes(o.status)
    )
  );
  const [activeTab, setActiveTab] = useState<OrderStatus>("em_producao");

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    const labels: Record<string, string> = {
      em_producao: "Produção iniciada!",
      pronto: "Pedido pronto para entrega!",
      em_entrega: "Pedido saiu para entrega!",
      entregue: "Pedido entregue com sucesso!",
    };
    toast.success(labels[newStatus] || "Status atualizado!");
  };

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Painel da Cozinha
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
          style={{ fontWeight: 500 }}
          onClick={() => toast.success("Pedidos atualizados!")}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {KITCHEN_STATUSES.map(({ id, label, icon: Icon }) => {
          const count = orders.filter((o) => o.status === id).length;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`border rounded-lg p-3 text-left transition-all ${
                activeTab === id ? "border-black bg-black text-white" : "border-gray-200 bg-white hover:border-gray-400"
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${activeTab === id ? "text-white" : "text-gray-400"}`} />
              <p className={`text-xl mb-0.5 ${activeTab === id ? "text-white" : "text-black"}`} style={{ fontWeight: 800 }}>
                {count}
              </p>
              <p className={`text-xs ${activeTab === id ? "text-gray-300" : "text-gray-400"}`} style={{ fontWeight: 500 }}>
                {label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-sm">Nenhum pedido neste status</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} onView={() => navigate(`/cozinha/pedido/${order.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onUpdateStatus,
  onView,
}: {
  order: Order;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onView: () => void;
}) {
  const nextStatus = NEXT_STATUS[order.status];
  const nextLabel = NEXT_LABEL[order.status];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-black" style={{ fontWeight: 700, letterSpacing: "0.05em", fontSize: "0.875rem" }}>
              {order.code}
            </span>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-600 text-sm">{order.patientName}</span>
            <span className="text-gray-400 text-xs">{order.clinicName}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-md px-2.5 py-1.5">
                <span className="text-black text-xs" style={{ fontWeight: 600 }}>{item.quantity}x</span>
                <span className="text-gray-600 text-xs">{item.name}</span>
                <span className="text-gray-400 text-xs">· {item.packaging}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Entrega: <strong className="text-gray-600">{formatDate(order.deliveryDate)}</strong></span>
            <span>Total: <strong className="text-gray-600">{formatCurrency(order.finalPrice)}</strong></span>
          </div>

          {order.items[0]?.observations && (
            <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
              ⚠ {order.items[0].observations}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {nextStatus && (
            <button
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              className="bg-black text-white px-3 py-2 rounded-md text-xs hover:bg-gray-900 transition-colors whitespace-nowrap"
              style={{ fontWeight: 600 }}
            >
              {nextLabel}
            </button>
          )}
          <button
            onClick={onView}
            className="border border-gray-200 text-gray-600 px-3 py-2 rounded-md text-xs hover:border-black transition-colors flex items-center gap-1"
            style={{ fontWeight: 500 }}
          >
            Detalhes <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
