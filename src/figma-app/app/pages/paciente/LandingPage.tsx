import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Box, ArrowRight, Search, LogOut, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";
import { formatDate, statusLabels } from "../../data/mockData";

const statusCardColors: Record<string, string> = {
  pago: "bg-gray-100 text-gray-700 border-gray-200",
  em_producao: "bg-black text-white border-black",
  pronto: "bg-gray-700 text-white border-gray-700",
  em_entrega: "bg-gray-500 text-white border-gray-500",
  entregue: "bg-gray-200 text-gray-700 border-gray-300",
  aguardando_pagamento: "bg-gray-100 text-gray-600 border-gray-200",
  aguardando_confirmacao: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser, orders } = useSprintSession();

  const isPatientLogged = currentUser?.role === "paciente" && !!currentUser.linkedPatientId;

  const patientOrders = useMemo(() => {
    if (!isPatientLogged || !currentUser?.linkedPatientId) {
      return [];
    }
    return [...orders]
      .filter((order) => order.patientId === currentUser.linkedPatientId || order.patientUserId === currentUser.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [isPatientLogged, currentUser, orders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Informe o código do pedido");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    navigate(`/paciente/pedido/${code.trim().toUpperCase()}`);
  };

  if (isPatientLogged) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-black">
                <Box className="h-4 w-4 text-white" />
              </div>
              <span className="leading-none" style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>FastInBox</span>
            </div>
            <button
              onClick={() => {
                sprintStoreActions.logout();
                navigate("/login?role=paciente");
              }}
              className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
              style={{ fontWeight: 500 }}
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 pt-8 pb-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-black" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
                Meu Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Acompanhe a fabricação das suas marmitas em tempo real.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código do pedido"
                className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="bg-black text-white px-3 py-2 rounded-md text-sm"
                style={{ fontWeight: 600 }}
              >
                {loading ? "..." : "Abrir"}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patientOrders.length === 0 && (
              <div className="col-span-full bg-white border border-gray-200 rounded-xl p-8 text-center">
                <PackageCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Ainda não há pedidos vinculados ao seu cadastro.</p>
              </div>
            )}

            {patientOrders.map((order) => (
              <article key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-sm text-black" style={{ fontWeight: 700 }}>{order.code}</p>
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusCardColors[order.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <p className="text-black text-sm" style={{ fontWeight: 600 }}>{order.items[0]?.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">Entrega: {formatDate(order.deliveryDate)}</p>
                <button
                  onClick={() => navigate(`/paciente/pedido/${order.code}/status`)}
                  className="mt-3 w-full border border-gray-200 text-gray-600 py-2 rounded-md text-sm hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1"
                  style={{ fontWeight: 600 }}
                >
                  Ver andamento <ArrowRight className="w-4 h-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-black">
              <Box className="h-4 w-4 text-white" />
            </div>
            <span className="leading-none" style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>FastInBox</span>
          </div>
          <button
            onClick={() => navigate("/login?role=nutricionista")}
            className="text-sm text-gray-500 hover:text-black transition-colors"
            style={{ fontWeight: 500 }}
          >
            Sou nutricionista →
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mx-auto mb-5">
            <Search className="w-6 h-6 text-white" />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.04em", lineHeight: 1.1 }} className="mb-3">
            Acesse seu pedido
          </h1>
          <p className="text-gray-500" style={{ lineHeight: 1.7 }}>
            Informe o código enviado pela sua nutricionista para acompanhar a produção das suas marmitas.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
              Código do pedido
            </label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="FIB-2026-001"
                className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors font-mono uppercase"
                style={{ letterSpacing: "0.05em" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-5 py-3 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {loading ? "..." : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="text-center py-8 border-t border-gray-100">
        <p className="text-gray-400 text-xs">FastInBox · Acompanhamento simples para seu pedido</p>
      </footer>
    </div>
  );
}
