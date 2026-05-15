import { useId, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Box, ArrowRight, Search, LogOut, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";
import { formatDate, statusLabels } from "../../data/mockData";
import SkipLink from "../../components/a11y/SkipLink";

const statusCardColors: Record<string, string> = {
  pago: "bg-gray-100 text-gray-900 border-gray-300",
  em_producao: "bg-black text-white border-black",
  pronto: "bg-gray-700 text-white border-gray-700",
  em_entrega: "bg-gray-500 text-white border-gray-500",
  entregue: "bg-gray-200 text-gray-900 border-gray-300",
  aguardando_pagamento: "bg-gray-100 text-gray-900 border-gray-300",
  aguardando_confirmacao: "bg-gray-100 text-gray-900 border-gray-300",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, orders } = useSprintSession();

  const uid = useId();
  const codeId = `${uid}-code`;
  const errId = `${uid}-err`;

  const isPatientLogged = currentUser?.role === "paciente" && !!currentUser.linkedPatientId;

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      sprintStoreActions.logout();
      navigate("/login?role=paciente");
    }
  };

  const patientOrders = useMemo(() => {
    if (!isPatientLogged || !currentUser?.linkedPatientId) return [];
    return [...orders]
      .filter((order) => order.patientId === currentUser.linkedPatientId || order.patientUserId === currentUser.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [isPatientLogged, currentUser, orders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError("Informe o código do pedido");
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
        <SkipLink />
        <header className="bg-white border-b border-gray-100" role="banner">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-black" aria-hidden="true">
                <Box className="h-4 w-4 text-white" aria-hidden="true" focusable="false" />
              </div>
              <span className="leading-none" style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>FastInBox</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-900 hover:text-black transition-colors flex items-center gap-1"
              style={{ fontWeight: 500 }}
              type="button"
              aria-label="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Sair
            </button>
          </div>
        </header>

        <main id="main-content" className="max-w-5xl mx-auto px-6 pt-8 pb-12" tabIndex={-1}>
          <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="text-black" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
                Meu Dashboard
              </h1>
              <p className="text-gray-900 text-sm mt-0.5">Acompanhe a fabricação das suas marmitas em tempo real.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
              <label htmlFor={codeId} className="sr-only">Código do pedido</label>
              <input
                id={codeId}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código do pedido"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="bg-black text-white px-3 py-2 rounded-md text-sm"
                style={{ fontWeight: 600 }}
                aria-busy={loading}
              >
                {loading ? "..." : "Abrir"}
              </button>
            </form>
          </header>

          <section aria-label="Seus pedidos" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patientOrders.length === 0 && (
              <div className="col-span-full bg-white border border-gray-200 rounded-xl p-8 text-center" role="status">
                <PackageCheck className="w-8 h-8 text-gray-700 mx-auto mb-2" aria-hidden="true" focusable="false" />
                <p className="text-gray-900 text-sm m-0">Ainda não há pedidos vinculados ao seu cadastro.</p>
              </div>
            )}

            {patientOrders.map((order) => (
              <article key={order.id} className="bg-white border border-gray-200 rounded-xl p-4" aria-labelledby={`o-${order.id}-code`}>
                <div className="flex items-center justify-between mb-2">
                  <p id={`o-${order.id}-code`} className="font-mono text-sm text-black m-0" style={{ fontWeight: 700 }}>{order.code}</p>
                  <span className={`text-xs px-2 py-0.5 rounded border ${statusCardColors[order.status] || "bg-gray-100 text-gray-900 border-gray-300"}`}>
                    <span className="sr-only">Status: </span>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <p className="text-black text-sm m-0" style={{ fontWeight: 600 }}>{order.items[0]?.name}</p>
                <p className="text-gray-900 text-xs mt-0.5 m-0">
                  Entrega: <time dateTime={order.deliveryDate}>{formatDate(order.deliveryDate)}</time>
                </p>
                <button
                  onClick={() => navigate(`/paciente/pedido/${order.code}/status`)}
                  className="mt-3 w-full border border-gray-300 text-gray-900 py-2 rounded-md text-sm hover:border-black hover:text-black transition-colors flex items-center justify-center gap-1"
                  style={{ fontWeight: 600 }}
                  type="button"
                  aria-label={`Ver andamento do pedido ${order.code}`}
                >
                  Ver andamento <ArrowRight className="w-4 h-4" aria-hidden="true" focusable="false" />
                </button>
              </article>
            ))}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink />
      <header className="bg-white border-b border-gray-100" role="banner">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-black" aria-hidden="true">
              <Box className="h-4 w-4 text-white" aria-hidden="true" focusable="false" />
            </div>
            <span className="leading-none" style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>FastInBox</span>
          </div>
          <button
            onClick={() => navigate("/login?role=nutricionista")}
            className="text-sm text-gray-900 hover:text-black transition-colors"
            style={{ fontWeight: 500 }}
            type="button"
          >
            Sou nutricionista <span aria-hidden="true">→</span>
          </button>
        </div>
      </header>

      <main id="main-content" className="max-w-lg mx-auto px-6 pt-20 pb-12" tabIndex={-1}>
        <header className="text-center mb-10">
          <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mx-auto mb-5" aria-hidden="true">
            <Search className="w-6 h-6 text-white" aria-hidden="true" focusable="false" />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.04em", lineHeight: 1.1 }} className="mb-3">
            Acesse seu pedido
          </h1>
          <p className="text-gray-900" style={{ lineHeight: 1.7 }}>
            Informe o código enviado pela sua nutricionista para acompanhar a produção das suas marmitas.
          </p>
        </header>

        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6" aria-labelledby="track-form-title">
          <h2 id="track-form-title" className="sr-only">Formulário de acompanhamento</h2>
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div
                id={errId}
                role="alert"
                aria-live="assertive"
                className="border-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700 mb-3"
                style={{ fontWeight: 600 }}
              >
                {error}
              </div>
            )}
            <label htmlFor={codeId} className="block text-sm text-gray-900 mb-2" style={{ fontWeight: 600 }}>
              Código do pedido <span aria-hidden="true" className="text-red-600">*</span>
              <span className="sr-only"> (obrigatório)</span>
            </label>
            <div className="flex gap-2">
              <input
                id={codeId}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="FIB-2026-001"
                className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors font-mono uppercase"
                style={{ letterSpacing: "0.05em" }}
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? errId : undefined}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-5 py-3 rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ fontWeight: 600 }}
                aria-label="Abrir pedido"
                aria-busy={loading}
              >
                {loading ? "..." : <ArrowRight className="w-4 h-4" aria-hidden="true" focusable="false" />}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="text-center py-8 border-t border-gray-100" role="contentinfo">
        <p className="text-gray-900 text-xs m-0">FastInBox · Acompanhamento simples para seu pedido</p>
      </footer>
    </div>
  );
}
