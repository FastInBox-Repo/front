import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { mockOrders, formatCurrency, formatDate, statusLabels, OrderStatus } from "../../data/mockData";

const STATUS_FILTERS: { id: OrderStatus | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "rascunho", label: "Rascunho" },
  { id: "aguardando_pagamento", label: "Aguard. Pag." },
  { id: "pago", label: "Pago" },
  { id: "em_producao", label: "Em produção" },
  { id: "pronto", label: "Pronto" },
  { id: "em_entrega", label: "Em entrega" },
  { id: "entregue", label: "Entregue" },
];

export default function AdminPedidosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.patientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Pedidos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monitoramento de todos os pedidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido..."
            className="border border-gray-200 rounded-md pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:border-black w-56"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs border transition-all ${
                statusFilter === f.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
              style={{ fontWeight: 500 }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Código", "Paciente", "Clínica", "Data", "Entrega", "Valor", "Margem", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono" style={{ fontWeight: 700, letterSpacing: "0.03em" }}>
                    {o.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700" style={{ fontWeight: 500 }}>{o.patientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[130px] truncate">{o.clinicName}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(o.deliveryDate)}</td>
                  <td className="px-4 py-3 text-sm text-black" style={{ fontWeight: 700 }}>{formatCurrency(o.finalPrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(o.margin)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        o.status === "pago" || o.status === "em_producao" || o.status === "entregue"
                          ? "bg-black text-white"
                          : o.status === "rascunho"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-gray-200 text-gray-600"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {statusLabels[o.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">{filtered.length} pedido(s) encontrado(s)</p>
          <p className="text-xs text-gray-400">
            Total: <strong className="text-black">{formatCurrency(filtered.reduce((acc, o) => acc + o.finalPrice, 0))}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
