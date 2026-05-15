import { FC, useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, ChefHat, Clock, Package, RefreshCw, Truck, Radio } from "lucide-react";
import { formatCurrency, formatDate, OrderStatus, statusLabels } from "../../data/mockData";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";
import { toast } from "sonner";

const KANBAN_COLUMNS: { id: OrderStatus; label: string; icon: FC<{ className?: string; "aria-hidden"?: boolean }> }[] = [
  { id: "pago", label: "Novo", icon: Clock },
  { id: "em_producao", label: "Em produção", icon: ChefHat },
  { id: "pronto", label: "Pronto", icon: Package },
  { id: "em_entrega", label: "Em entrega", icon: Truck },
  { id: "entregue", label: "Entregue", icon: CheckCircle },
];

const allowedStatuses = new Set<OrderStatus>(["pago", "em_producao", "pronto", "em_entrega", "entregue"]);

const formatSyncLabel = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

export default function CozinhaDashboardPage() {
  const navigate = useNavigate();
  const { orders, currentUser } = useSprintSession();
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date>(() => new Date());
  const liveRegionId = useId();

  const visibleOrders = useMemo(() => {
    const inFlow = orders.filter((order) => allowedStatuses.has(order.status));
    if (!currentUser) return inFlow;
    return inFlow.filter((order) => !order.factoryId || order.factoryId === currentUser.id);
  }, [orders, currentUser]);

  useEffect(() => {
    setLastSyncAt(new Date());
  }, [orders]);

  const moveOrder = async (orderId: string, targetStatus: OrderStatus) => {
    await sprintStoreActions.updateOrderStatus(orderId, targetStatus);
    const label = statusLabels[targetStatus] || targetStatus;
    toast.success(`Pedido movido para ${label}`);
  };

  const handleDrop = async (targetStatus: OrderStatus) => {
    if (!draggingOrderId) return;
    await moveOrder(draggingOrderId, targetStatus);
    setDraggingOrderId(null);
  };

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Pedidos em produção
          </h1>
          <p className="text-gray-900 text-sm mt-0.5">
            Arraste os pedidos entre as etapas ou use o seletor de status para mover via teclado.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white" role="status" aria-live="polite">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
            </span>
            <span className="text-xs text-gray-900" style={{ fontWeight: 500 }}>
              Sincronizado às <time dateTime={lastSyncAt.toISOString()}>{formatSyncLabel(lastSyncAt)}</time>
            </span>
            <Radio className="w-3.5 h-3.5 text-gray-700" aria-hidden="true" focusable="false" />
          </div>
          <button
            className="flex items-center gap-2 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
            style={{ fontWeight: 500 }}
            type="button"
            aria-label="Atualizar pedidos"
            onClick={() => {
              setLastSyncAt(new Date());
              toast.success("Pedidos atualizados");
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Atualizar
          </button>
        </div>
      </header>

      <div id={liveRegionId} className="sr-only" role="status" aria-live="polite" />

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4" aria-label="Quadro Kanban de pedidos">
        {KANBAN_COLUMNS.map((column) => {
          const columnOrders = visibleOrders.filter((order) => order.status === column.id);
          const colTitleId = `col-${column.id}-title`;
          return (
            <section
              key={column.id}
              className="bg-white border border-gray-200 rounded-lg p-3 min-h-[480px]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.id)}
              aria-labelledby={colTitleId}
              aria-describedby={`col-${column.id}-count`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <column.icon className="w-4 h-4 text-gray-900" aria-hidden={true} />
                  <h2 id={colTitleId} className="text-sm text-black m-0" style={{ fontWeight: 700 }}>
                    {column.label}
                  </h2>
                </div>
                <span
                  id={`col-${column.id}-count`}
                  className="text-xs bg-gray-100 border border-gray-300 text-gray-900 px-2 py-0.5 rounded"
                  style={{ fontWeight: 600 }}
                  aria-label={`${columnOrders.length} pedidos`}
                >
                  {columnOrders.length}
                </span>
              </div>

              <ul className="space-y-2 list-none p-0 m-0">
                {columnOrders.length === 0 && (
                  <li className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                    <p className="text-xs text-gray-900 m-0">Sem pedidos</p>
                  </li>
                )}

                {columnOrders.map((order) => {
                  const statusSelectId = `status-${order.id}`;
                  return (
                    <li key={order.id}>
                      <article
                        draggable
                        onDragStart={() => setDraggingOrderId(order.id)}
                        onDragEnd={() => setDraggingOrderId(null)}
                        className="border border-gray-300 rounded-md p-3 bg-gray-50 cursor-grab active:cursor-grabbing hover:border-black transition-colors"
                        aria-label={`Pedido ${order.code} de ${order.patientName}, ${formatCurrency(order.finalPrice)}, atualmente em ${column.label}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-black text-xs font-mono m-0" style={{ fontWeight: 700 }}>
                            <span className="sr-only">Código: </span>
                            {order.code}
                          </p>
                          <time className="text-[10px] text-gray-900" dateTime={order.deliveryDate}>
                            <span className="sr-only">Entrega: </span>
                            {formatDate(order.deliveryDate)}
                          </time>
                        </div>

                        <p className="text-sm text-black mb-0.5 m-0" style={{ fontWeight: 600 }}>
                          {order.patientName}
                        </p>
                        <p className="text-xs text-gray-900 mb-2 m-0">
                          {order.items[0]?.name} · {order.items[0]?.quantity}x
                        </p>

                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs text-gray-900" style={{ fontWeight: 700 }}>
                            {formatCurrency(order.finalPrice)}
                          </span>
                          <div className="flex items-center gap-2">
                            <label htmlFor={statusSelectId} className="sr-only">
                              Mover pedido {order.code} para outro status
                            </label>
                            <select
                              id={statusSelectId}
                              value={order.status}
                              onChange={(e) => moveOrder(order.id, e.target.value as OrderStatus)}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                            >
                              {KANBAN_COLUMNS.map((col) => (
                                <option key={col.id} value={col.id}>{col.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => navigate(`/cozinha/pedido/${order.id}`)}
                              className="text-xs border border-gray-300 text-gray-900 px-2 py-1 rounded hover:border-black hover:text-black transition-colors"
                              type="button"
                              aria-label={`Ver detalhes do pedido ${order.code}`}
                            >
                              Detalhes
                            </button>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </section>
    </div>
  );
}
