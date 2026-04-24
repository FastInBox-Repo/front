import { useState } from "react";
import { Link } from "react-router";
import { Box, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Informe seu e-mail"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontWeight: 800, letterSpacing: "-0.04em" }}>FastInBox</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-black" />
              </div>
              <h2 style={{ fontWeight: 700, letterSpacing: "-0.02em" }} className="mb-2">E-mail enviado</h2>
              <p className="text-gray-800 text-sm mb-6" style={{ lineHeight: 1.55 }}>
                Verifique sua caixa de entrada. Enviamos um link de recuperação para <strong>{email}</strong>.
              </p>
              <Link
                to="/login"
                className="text-sm text-black underline underline-offset-4"
                style={{ fontWeight: 500 }}
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-black mb-1" style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.03em" }}>
                Recuperar senha
              </h1>
              <p className="text-gray-800 text-sm mb-6" style={{ lineHeight: 1.55 }}>
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com.br"
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>
            </>
          )}
        </div>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-gray-700 hover:text-black transition-colors mt-6" style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
        </Link>
      </div>
    </div>
  );
}
