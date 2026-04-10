import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, ChefHat, Clock, Package, RefreshCw, Truck } from "lucide-react";
import { formatCurrency, formatDate, OrderStatus, statusLabels } from "../../data/mockData";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";
import { toast } from "sonner";

const KANBAN_COLUMNS: { id: OrderStatus; label: string; icon: FC<{ className?: string }> }[] = [
  { id: "pago", label: "Novo", icon: Clock },
  { id: "em_producao", label: "Em produção", icon: ChefHat },
  { id: "pronto", label: "Pronto", icon: Package },
  { id: "em_entrega", label: "Em entrega", icon: Truck },
  { id: "entregue", label: "Entregue", icon: CheckCircle },
];

const allowedStatuses = new Set<OrderStatus>(["pago", "em_producao", "pronto", "em_entrega", "entregue"]);

export default function CozinhaDashboardPage() {
  const navigate = useNavigate();
  const { orders, currentUser } = useSprintSession();
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);

  const visibleOrders = useMemo(() => {
    const inFlow = orders.filter((order) => allowedStatuses.has(order.status));
    if (!currentUser) {
      return inFlow;
    }
    return inFlow.filter((order) => !order.factoryId || order.factoryId === currentUser.id);
  }, [orders, currentUser]);

  const handleDrop = (targetStatus: OrderStatus) => {
    if (!draggingOrderId) {
      return;
    }

    sprintStoreActions.updateOrderStatus(draggingOrderId, targetStatus);
    const label = statusLabels[targetStatus] || targetStatus;
    toast.success(`Pedido movido para ${label}`);
    setDraggingOrderId(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Kanban da Fábrica
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Arraste os pedidos entre as colunas até concluir a entrega.
          </p>
        </div>
        <button
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
          style={{ fontWeight: 500 }}
          onClick={() => toast.success("Kanban atualizado")}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {KANBAN_COLUMNS.map((column) => {
          const columnOrders = visibleOrders.filter((order) => order.status === column.id);
          return (
            <div
              key={column.id}
              className="bg-white border border-gray-200 rounded-lg p-3 min-h-[480px]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <column.icon className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-black" style={{ fontWeight: 700 }}>
                    {column.label}
                  </p>
                </div>
                <span className="text-xs bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded" style={{ fontWeight: 600 }}>
                  {columnOrders.length}
                </span>
              </div>

              <div className="space-y-2">
                {columnOrders.length === 0 && (
                  <div className="border border-dashed border-gray-200 rounded-md p-4 text-center">
                    <p className="text-xs text-gray-300">Sem pedidos</p>
                  </div>
                )}

                {columnOrders.map((order) => (
                  <article
                    key={order.id}
                    draggable
                    onDragStart={() => setDraggingOrderId(order.id)}
                    onDragEnd={() => setDraggingOrderId(null)}
                    className="border border-gray-200 rounded-md p-3 bg-gray-50 cursor-grab active:cursor-grabbing hover:border-black transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-black text-xs font-mono" style={{ fontWeight: 700 }}>
                        {order.code}
                      </p>
                      <span className="text-[10px] text-gray-400">{formatDate(order.deliveryDate)}</span>
                    </div>

                    <p className="text-sm text-black mb-0.5" style={{ fontWeight: 600 }}>
                      {order.patientName}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {order.items[0]?.name} · {order.items[0]?.quantity}x
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600" style={{ fontWeight: 700 }}>
                        {formatCurrency(order.finalPrice)}
                      </span>
                      <button
                        onClick={() => navigate(`/cozinha/pedido/${order.id}`)}
                        className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded hover:border-black hover:text-black transition-colors"
                      >
                        Detalhes
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
