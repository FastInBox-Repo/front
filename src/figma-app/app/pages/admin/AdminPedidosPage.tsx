import { useId, useState } from "react";
import { Search } from "lucide-react";
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
  const searchId = useId();
  const resultsId = `${searchId}-results`;

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.patientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Pedidos</h1>
          <p className="text-gray-900 text-sm mt-0.5">Monitoramento de todos os pedidos</p>
        </div>
      </header>

      {/* Filters */}
      <section className="flex items-center gap-3 mb-5 flex-wrap" aria-label="Filtros de pedidos">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">Buscar pedido por código ou paciente</label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none"
            aria-hidden="true"
            focusable="false"
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido..."
            className="border border-gray-300 rounded-md pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:border-black w-56"
            aria-controls={resultsId}
          />
        </div>
        <div
          className="flex items-center gap-1.5 flex-wrap"
          role="radiogroup"
          aria-label="Filtrar por status do pedido"
        >
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs border transition-all ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-900 border-gray-300 hover:border-black"
                }`}
                style={{ fontWeight: 500 }}
                type="button"
                role="radio"
                aria-checked={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Table */}
      <section
        id={resultsId}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        aria-label="Lista de pedidos"
        aria-live="polite"
      >
        <table className="w-full">
          <caption className="sr-only">
            {filtered.length} pedido(s) encontrado(s) com os filtros atuais.
          </caption>
          <thead>
            <tr className="border-b border-gray-100">
              {["Código", "Paciente", "Clínica", "Data", "Entrega", "Valor", "Margem", "Status"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-xs text-gray-900 uppercase tracking-wider"
                  style={{ fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-900 text-sm">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <th
                    scope="row"
                    className="px-4 py-3 text-sm font-mono text-left"
                    style={{ fontWeight: 700, letterSpacing: "0.03em" }}
                  >
                    {o.code}
                  </th>
                  <td className="px-4 py-3 text-sm text-gray-900" style={{ fontWeight: 500 }}>{o.patientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[130px] truncate">{o.clinicName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(o.deliveryDate)}</td>
                  <td className="px-4 py-3 text-sm text-black" style={{ fontWeight: 700 }}>{formatCurrency(o.finalPrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(o.margin)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        o.status === "pago" || o.status === "em_producao" || o.status === "entregue"
                          ? "bg-black text-white"
                          : o.status === "rascunho"
                          ? "bg-gray-100 text-gray-900"
                          : "bg-gray-200 text-gray-900"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      <span className="sr-only">Status: </span>
                      {statusLabels[o.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div
          className="px-4 py-3 border-t border-gray-100 flex items-center justify-between"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs text-gray-900">{filtered.length} pedido(s) encontrado(s)</p>
          <p className="text-xs text-gray-900">
            Total: <strong className="text-black">{formatCurrency(filtered.reduce((acc, o) => acc + o.finalPrice, 0))}</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
