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

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mx-auto mb-5">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white text-center mb-1" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
            Acesso Cozinha
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            Painel operacional de produção
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>
                Usuário
              </label>
              <input
                placeholder="cozinha"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gray-500 placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5" style={{ fontWeight: 500 }}>
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gray-500"
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
