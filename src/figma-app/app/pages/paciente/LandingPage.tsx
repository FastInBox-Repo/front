import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, ArrowRight, Search } from "lucide-react";
import { toast } from "sonner";

export default function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Informe o código do pedido");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate(`/paciente/pedido/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
              <Box className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={{ fontWeight: 800, letterSpacing: "-0.04em" }}>FastInBox</span>
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
          <h1
            style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.04em", lineHeight: 1.1 }}
            className="mb-3"
          >
            Acesse seu pedido
          </h1>
          <p className="text-gray-500" style={{ lineHeight: 1.7 }}>
            Seu nutricionista enviou um código único para você. Informe abaixo para ver, confirmar e pagar seu pedido de marmitas personalizadas.
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

        {/* Demo shortcuts */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
            Pedidos de demonstração
          </p>
          <div className="space-y-2">
            {[
              { code: "FIB-2026-001", name: "Lucas Mendes", status: "Em produção" },
              { code: "FIB-2026-002", name: "Fernanda Costa", status: "Aguardando pagamento" },
            ].map((p) => (
              <button
                key={p.code}
                onClick={() => navigate(`/paciente/pedido/${p.code}`)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-md border border-gray-100 hover:border-black transition-colors text-left"
              >
                <div>
                  <p className="text-black text-sm" style={{ fontWeight: 500 }}>{p.code}</p>
                  <p className="text-gray-400 text-xs">{p.name} · {p.status}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center py-8 border-t border-gray-100">
        <p className="text-gray-400 text-xs">Tecnologia FastInBox · Plataforma white label para nutricionistas</p>
      </footer>
    </div>
  );
}
