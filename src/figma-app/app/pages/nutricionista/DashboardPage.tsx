import { useNavigate } from "react-router";
import {
  Users, ShoppingBag, Clock, CheckCircle, ChefHat,
  Plus, ArrowRight, TrendingUp, Package
} from "lucide-react";
import { mockOrders, mockPatients, statusLabels, formatCurrency, formatDate } from "../../data/mockData";

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

  const metrics = [
    {
      icon: Users,
      label: "Total de pacientes",
      value: mockPatients.length,
      sub: "+2 este mês",
    },
    {
      icon: ShoppingBag,
      label: "Rascunhos",
      value: mockOrders.filter((o) => o.status === "rascunho").length,
      sub: "Aguardando envio",
    },
    {
      icon: Clock,
      label: "Aguard. pagamento",
      value: mockOrders.filter((o) => o.status === "aguardando_pagamento" || o.status === "aguardando_confirmacao").length,
      sub: "Pendentes",
    },
    {
      icon: CheckCircle,
      label: "Pagos",
      value: mockOrders.filter((o) => o.status === "pago" || o.status === "em_producao" || o.status === "pronto" || o.status === "em_entrega" || o.status === "entregue").length,
      sub: "Confirmados",
    },
    {
      icon: ChefHat,
      label: "Em produção",
      value: mockOrders.filter((o) => o.status === "em_producao").length,
      sub: "Na cozinha agora",
    },
    {
      icon: TrendingUp,
      label: "Faturamento",
      value: formatCurrency(mockOrders.filter((o) => o.paidAt).reduce((acc, o) => acc + o.finalPrice, 0)),
      sub: "Total pago",
      isText: true,
    },
  ];

  const recentOrders = [...mockOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-black" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Visão geral da sua clínica</p>
        </div>
        <button
          onClick={() => navigate("/nutricionista/pedidos/novo")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md hover:bg-gray-900 transition-colors text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <m.icon className="w-4 h-4 text-gray-400" />
            </div>
            <p
              className="text-black mb-0.5"
              style={{ fontSize: m.isText ? "1.125rem" : "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {m.value}
            </p>
            <p className="text-gray-500 text-xs mb-1">{m.label}</p>
            <p className="text-gray-400 text-xs">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Pedidos recentes</h2>
            <button
              onClick={() => navigate("/nutricionista/pedidos/novo")}
              className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/nutricionista/pedidos/${order.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-xs" style={{ fontWeight: 600 }}>
                      {order.patientName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-black text-sm" style={{ fontWeight: 500 }}>{order.patientName}</p>
                    <p className="text-gray-400 text-xs">{order.code} · {formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-black text-sm" style={{ fontWeight: 600 }}>
                    {formatCurrency(order.finalPrice)}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Ações rápidas</h2>
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-200 hover:border-black text-sm text-gray-700 transition-colors text-left"
                  style={{ fontWeight: 500 }}
                >
                  <a.icon className="w-4 h-4 text-gray-400" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Patients summary */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Pacientes</h2>
              <button
                onClick={() => navigate("/nutricionista/pacientes")}
                className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
              >
                Ver todos <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {mockPatients.slice(0, 4).map((p) => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-600 text-xs" style={{ fontWeight: 600 }}>
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                    <p className="text-sm text-black" style={{ fontWeight: 500 }}>{p.name.split(" ")[0]}</p>
                  </div>
                  <span className="text-xs text-gray-400">{p.ordersCount} pedidos</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
