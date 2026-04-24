import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, ChefHat } from "lucide-react";

export default function CozinhaLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate("/cozinha/dashboard");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <Box className="w-4 h-4 text-black" />
          </div>
          <span className="text-white" style={{ fontWeight: 800, letterSpacing: "-0.04em", fontSize: "1.1rem" }}>
            FastInBox
          </span>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mx-auto mb-5">
            <ChefHat className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-white text-center mb-1" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            Acesso Cozinha
          </h1>
          <p className="text-gray-200 text-center text-sm mb-6" style={{ fontWeight: 500 }}>
            Painel operacional de produção
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white mb-1.5" style={{ fontWeight: 600 }}>
                Usuário
              </label>
              <input
                placeholder="cozinha"
                className="w-full bg-gray-800 border border-gray-500 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-1.5" style={{ fontWeight: 600 }}>
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-500 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-2.5 rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              style={{ fontWeight: 700 }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
