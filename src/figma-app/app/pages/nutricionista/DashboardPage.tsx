import { useNavigate } from "react-router";
import {
  Users, ShoppingBag, Clock, CheckCircle, ChefHat,
  Plus, ArrowRight, TrendingUp, Package
} from "lucide-react";
import { formatCurrency, formatDate, statusLabels } from "../../data/mockData";
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${styles[status] || "bg-gray-100 text-gray-500"}`} style={{ fontWeight: 500 }}>
      {statusLabels[status as keyof typeof statusLabels] || status}
    </span>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { orders, patients, currentUser } = useSprintSession();

  const nutritionistOrders = orders.filter(
    (order) => order.nutritionistId === currentUser?.id || order.nutritionistName === currentUser?.name,
  );

  const visiblePatients =
    nutritionistOrders.length > 0
      ? patients.filter((patient) => nutritionistOrders.some((order) => order.patientId === patient.id))
      : patients;

  const metrics = [
    {
      icon: Users,
      label: "Total de pacientes",
      value: visiblePatients.length,
      sub: "+2 este mês",
    },
    {
      icon: ShoppingBag,
      label: "Rascunhos",
      value: nutritionistOrders.filter((o) => o.status === "rascunho").length,
      sub: "Aguardando envio",
    },
    {
      icon: Clock,
      label: "Aguard. pagamento",
      value: nutritionistOrders.filter((o) => o.status === "aguardando_pagamento" || o.status === "aguardando_confirmacao").length,
      sub: "Pendentes",
    },
    {
      icon: CheckCircle,
      label: "Pagos",
      value: nutritionistOrders.filter((o) => o.status === "pago" || o.status === "em_producao" || o.status === "pronto" || o.status === "em_entrega" || o.status === "entregue").length,
      sub: "Confirmados",
    },
    {
      icon: ChefHat,
      label: "Em produção",
      value: nutritionistOrders.filter((o) => o.status === "em_producao").length,
      sub: "Na cozinha agora",
    },
    {
      icon: TrendingUp,
      label: "Faturamento",
      value: formatCurrency(nutritionistOrders.filter((o) => o.paidAt).reduce((acc, o) => acc + o.finalPrice, 0)),
      sub: "Total pago",
      isText: true,
    },
  ];

  const recentOrders = [...nutritionistOrders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-8">
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-black" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Dashboard
          </h1>
          <p className="text-gray-900 text-sm mt-0.5">Visão geral da sua clínica</p>
        </div>
        <button
          onClick={() => navigate("/nutricionista/pedidos/novo")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md hover:bg-gray-900 transition-colors text-sm"
          style={{ fontWeight: 600 }}
          type="button"
        >
          <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
          Novo Pedido
        </button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8" aria-label="Indicadores da clínica">
        {metrics.map((m) => (
          <article key={m.label} className="bg-white border border-gray-200 rounded-lg p-4" aria-label={`${m.label}: ${m.value}`}>
            <div className="flex items-center justify-between mb-3">
              <m.icon className="w-4 h-4 text-gray-700" aria-hidden="true" focusable="false" />
            </div>
            <p
              className="text-black mb-0.5"
              style={{ fontSize: m.isText ? "1.125rem" : "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {m.value}
            </p>
            <p className="text-gray-900 text-xs mb-1">{m.label}</p>
            <p className="text-gray-900 text-xs">{m.sub}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white border border-gray-200 rounded-lg" aria-labelledby="recent-orders">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 id="recent-orders" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Pedidos recentes</h2>
            <button
              onClick={() => navigate("/nutricionista/pedidos/novo")}
              className="text-xs text-gray-900 hover:text-black flex items-center gap-1 transition-colors"
              type="button"
              aria-label="Ver todos os pedidos"
            >
              Ver todos <ArrowRight className="w-3 h-3" aria-hidden="true" focusable="false" />
            </button>
          </div>
          <ul className="divide-y divide-gray-50 list-none p-0 m-0">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  onClick={() => navigate(`/nutricionista/pedidos/${order.id}`)}
                  style={{ border: "none", boxShadow: "none", background: "transparent" }}
                  aria-label={`Pedido ${order.code} de ${order.patientName}, ${formatCurrency(order.finalPrice)}, status ${statusLabels[order.status as keyof typeof statusLabels] || order.status}`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <span className="text-gray-900 text-xs" style={{ fontWeight: 600 }}>
                        {order.patientName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </span>
                    <span>
                      <span className="block text-black text-sm" style={{ fontWeight: 500 }}>{order.patientName}</span>
                      <span className="block text-gray-900 text-xs">{order.code} · {formatDate(order.createdAt)}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="text-black text-sm" style={{ fontWeight: 600 }}>
                      {formatCurrency(order.finalPrice)}
                    </span>
                    <StatusBadge status={order.status} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="bg-white border border-gray-200 rounded-lg" aria-labelledby="quick-actions">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 id="quick-actions" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Ações rápidas</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "Criar novo pedido", icon: Plus, action: () => navigate("/nutricionista/pedidos/novo") },
                { label: "Cadastrar paciente", icon: Users, action: () => navigate("/nutricionista/pacientes") },
                { label: "Ver configurações", icon: Package, action: () => navigate("/nutricionista/configuracoes") },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 hover:border-black text-sm text-gray-900 transition-colors text-left"
                  style={{ fontWeight: 500 }}
                  type="button"
                >
                  <a.icon className="w-4 h-4 text-gray-700" aria-hidden="true" focusable="false" />
                  {a.label}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg" aria-labelledby="patients-summary">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 id="patients-summary" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Pacientes</h2>
              <button
                onClick={() => navigate("/nutricionista/pacientes")}
                className="text-xs text-gray-900 hover:text-black flex items-center gap-1 transition-colors"
                type="button"
                aria-label="Ver todos os pacientes"
              >
                Ver todos <ArrowRight className="w-3 h-3" aria-hidden="true" focusable="false" />
              </button>
            </div>
            <ul className="divide-y divide-gray-50 list-none p-0 m-0">
              {visiblePatients.slice(0, 4).map((p) => (
                <li key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-gray-900 text-xs" style={{ fontWeight: 600 }}>
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </span>
                    <p className="text-sm text-black m-0" style={{ fontWeight: 500 }}>{p.name.split(" ")[0]}</p>
                  </div>
                  <span className="text-xs text-gray-900">
                    <span className="sr-only">Total de pedidos: </span>
                    {p.ordersCount} pedidos
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
