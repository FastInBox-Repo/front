import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { Box, ChefHat } from "lucide-react";

export default function CozinhaLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const uid = useId();
  const userId = `${uid}-user`;
  const passId = `${uid}-pass`;
  const errId = `${uid}-err`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user || !pass) {
      setError("Preencha usuário e senha");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate("/cozinha/dashboard");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6" data-dark-surface>
      <main id="main-content" className="w-full max-w-sm" tabIndex={-1} aria-labelledby="cozinha-login-title">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center" aria-hidden="true">
            <Box className="w-4 h-4 text-black" aria-hidden="true" focusable="false" />
          </div>
          <span className="text-white" style={{ fontWeight: 800, letterSpacing: "-0.04em", fontSize: "1.1rem" }}>
            FastInBox
          </span>
        </div>

        <section className="bg-gray-900 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mx-auto mb-5" aria-hidden="true">
            <ChefHat className="w-6 h-6 text-black" aria-hidden="true" focusable="false" />
          </div>
          <h1
            id="cozinha-login-title"
            className="text-white text-center mb-1"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Acesso Cozinha
          </h1>
          <p className="text-gray-100 text-center text-sm mb-6" style={{ fontWeight: 500 }}>
            Painel operacional de produção
          </p>
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {error && (
              <div
                id={errId}
                role="alert"
                aria-live="assertive"
                className="border-2 border-red-500 bg-red-900/40 px-3 py-2 text-sm text-red-200"
                style={{ fontWeight: 600 }}
              >
                {error}
              </div>
            )}
            <div>
              <label htmlFor={userId} className="block text-sm text-white mb-1.5" style={{ fontWeight: 600 }}>
                Usuário <span aria-hidden="true" className="text-red-300">*</span>
                <span className="sr-only"> (obrigatório)</span>
              </label>
              <input
                id={userId}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="cozinha"
                className="w-full bg-gray-800 border border-gray-500 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white placeholder:text-gray-300"
                required
                autoComplete="username"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor={passId} className="block text-sm text-white mb-1.5" style={{ fontWeight: 600 }}>
                Senha <span aria-hidden="true" className="text-red-300">*</span>
                <span className="sr-only"> (obrigatório)</span>
              </label>
              <input
                id={passId}
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-500 rounded-md px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white placeholder:text-gray-300"
                required
                autoComplete="current-password"
                aria-required="true"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-2.5 rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              style={{ fontWeight: 700 }}
              aria-busy={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
