import { useNavigate } from "react-router";
import { Activity, ShoppingBag, DollarSign, TrendingUp, Users, ChevronRight, BarChart3 } from "lucide-react";
import { formatCurrency, statusLabels, formatDate } from "../../data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSprintSession } from "../../data/sprintStore";
import { auditLabels, formatAuditTimeAgo, useAuditLog } from "../../data/auditStore";

const chartData = [
  { dia: "Seg", pedidos: 4, faturamento: 88000 },
  { dia: "Ter", pedidos: 7, faturamento: 154000 },
  { dia: "Qua", pedidos: 5, faturamento: 110000 },
  { dia: "Qui", pedidos: 9, faturamento: 198000 },
  { dia: "Sex", pedidos: 12, faturamento: 264000 },
  { dia: "Sáb", pedidos: 6, faturamento: 132000 },
  { dia: "Dom", pedidos: 3, faturamento: 66000 },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    rascunho: "bg-gray-100 text-gray-500",
    aguardando_pagamento: "bg-gray-100 text-gray-600",
    pago: "bg-black text-white",
    em_producao: "bg-gray-800 text-white",
    pronto: "bg-gray-600 text-white",
    em_entrega: "bg-gray-400 text-white",
    entregue: "bg-gray-200 text-gray-700",
    cancelado: "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${styles[status] || "bg-gray-100 text-gray-500"}`} style={{ fontWeight: 500 }}>
      {statusLabels[status as keyof typeof statusLabels] || status}
    </span>
  );
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { orders, patients } = useSprintSession();
  const auditEvents = useAuditLog();

  const totalPedidos = orders.length;
  const pagos = orders.filter((o) => o.paidAt).length;
  const faturamento = orders.filter((o) => o.paidAt).reduce((acc, o) => acc + o.finalPrice, 0);

  const metrics = [
    { icon: ShoppingBag, label: "Total de pedidos", value: totalPedidos, sub: "Todos os status" },
    { icon: DollarSign, label: "Faturamento bruto", value: formatCurrency(faturamento), sub: "Pedidos pagos", isText: true },
    { icon: TrendingUp, label: "Pagos / confirmados", value: pagos, sub: "Prontos para produção" },
    { icon: Users, label: "Pacientes ativos", value: patients.length, sub: "Cadastrados" },
  ];

  const recentEvents = auditEvents.slice(0, 6);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
          Administração
        </h1>
        <p className="text-gray-700 text-sm mt-0.5">Visão geral da operação FastInBox</p>
      </header>

      {/* Metrics */}
      <section aria-label="Indicadores principais" className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <article key={m.label} className="bg-white border border-gray-200 rounded-lg p-5" aria-label={`${m.label}: ${m.value}`}>
            <div className="flex items-center justify-between mb-4">
              <m.icon className="w-4 h-4 text-gray-700" aria-hidden="true" focusable="false" />
            </div>
            <p
              className="text-black mb-0.5"
              style={{ fontSize: m.isText ? "1.25rem" : "2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {m.value}
            </p>
            <p className="text-gray-700 text-xs mb-0.5">{m.label}</p>
            <p className="text-gray-700 text-xs">{m.sub}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontWeight: 600, fontSize: "0.9375rem" }} id="weekly-chart-title">Pedidos por dia (esta semana)</h2>
            <BarChart3 className="w-4 h-4 text-gray-700" aria-hidden="true" focusable="false" />
          </div>
          <div role="img" aria-labelledby="weekly-chart-title" aria-describedby="weekly-chart-desc">
            <p id="weekly-chart-desc" className="sr-only">
              Gráfico de barras com o total de pedidos por dia da semana. {chartData.map((d) => `${d.dia}: ${d.pedidos} pedidos`).join(", ")}.
            </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value) => [value ?? 0, "Pedidos"]}
              />
              <Bar dataKey="pedidos" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 style={{ fontWeight: 600, fontSize: "0.9375rem" }} className="mb-4">
            Status dos pedidos
          </h2>
          <div className="space-y-3">
            {[
              { status: "rascunho", label: "Rascunho" },
              { status: "aguardando_pagamento", label: "Aguard. Pagamento" },
              { status: "em_producao", label: "Em Produção" },
              { status: "pronto", label: "Pronto" },
              { status: "entregue", label: "Entregue" },
            ].map(({ status, label }) => {
              const count = orders.filter((o) => o.status === status).length;
              const pct = totalPedidos > 0 ? Math.round((count / totalPedidos) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-900">{label}</span>
                    <span className="text-black" style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                  <div
                    className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label={`${label}: ${count} pedidos (${pct}%)`}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-black rounded-full"
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent audit events */}
      <section className="bg-white border border-gray-200 rounded-lg mb-6" aria-labelledby="audit-title">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-700" aria-hidden="true" focusable="false" />
            <h2 id="audit-title" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Eventos recentes</h2>
          </div>
          <button
            onClick={() => navigate("/admin/auditoria")}
            className="text-xs text-gray-900 hover:text-black flex items-center gap-1 transition-colors"
            type="button"
            aria-label="Abrir página de auditoria"
          >
            Abrir auditoria <ChevronRight className="w-3 h-3" aria-hidden="true" focusable="false" />
          </button>
        </div>
        {recentEvents.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
              Nenhum evento registrado ainda.
            </p>
            <p className="text-xs text-gray-700 mt-1">
              Faça login, crie um pedido ou movimente um status para começar o histórico.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 list-none p-0 m-0">
            {recentEvents.map((event) => (
              <li key={event.id} className="px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-black" style={{ fontWeight: 600 }}>
                      {auditLabels[event.type] ?? event.type}
                    </span>
                    {event.targetCode && (
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>
                        {event.targetCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-900 truncate">{event.description}</p>
                </div>
                <time className="text-[10px] text-gray-700 shrink-0" dateTime={new Date(event.createdAt).toISOString()}>
                  {formatAuditTimeAgo(event.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent orders table */}
      <section className="bg-white border border-gray-200 rounded-lg" aria-labelledby="orders-table-title">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 id="orders-table-title" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Todos os pedidos</h2>
          <button
            onClick={() => navigate("/admin/pedidos")}
            className="text-xs text-gray-900 hover:text-black flex items-center gap-1 transition-colors"
            type="button"
            aria-label="Ver todos os pedidos"
          >
            Ver tudo <ChevronRight className="w-3 h-3" aria-hidden="true" focusable="false" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">Lista de todos os pedidos com código, paciente, clínica, nutricionista, data, valor e status.</caption>
            <thead>
              <tr className="border-b border-gray-50">
                {["Código", "Paciente", "Clínica", "Nutricionista", "Data", "Valor", "Status"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs text-gray-900 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <th scope="row" className="px-4 py-3 text-sm font-mono text-left" style={{ fontWeight: 600 }}>{o.code}</th>
                  <td className="px-4 py-3 text-sm text-gray-900">{o.patientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[140px] truncate">{o.clinicName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{o.nutritionistName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-sm" style={{ fontWeight: 600 }}>{formatCurrency(o.finalPrice)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
