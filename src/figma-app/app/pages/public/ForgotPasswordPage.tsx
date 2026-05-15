import { useId, useState } from "react";
import { Link } from "react-router";
import { Box, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();
  const errorId = `${emailId}-error`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Informe seu e-mail");
      toast.error("Informe seu e-mail");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <main id="main-content" className="w-full max-w-md" tabIndex={-1} aria-labelledby="forgot-title">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center" aria-hidden="true">
            <Box className="w-4 h-4 text-white" aria-hidden="true" focusable="false" />
          </div>
          <span style={{ fontWeight: 800, letterSpacing: "-0.04em" }}>FastInBox</span>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-8" aria-labelledby="forgot-title">
          {sent ? (
            <div className="text-center py-4" role="status" aria-live="polite">
              <div
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <CheckCircle className="w-6 h-6 text-black" aria-hidden="true" focusable="false" />
              </div>
              <h2
                id="forgot-title"
                style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
                className="mb-2"
              >
                E-mail enviado
              </h2>
              <p className="text-gray-900 text-sm mb-6" style={{ lineHeight: 1.55 }}>
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
              <h1
                id="forgot-title"
                className="text-black mb-1"
                style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.03em" }}
              >
                Recuperar senha
              </h1>
              <p className="text-gray-900 text-sm mb-6" style={{ lineHeight: 1.55 }}>
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <div
                    id={errorId}
                    role="alert"
                    aria-live="assertive"
                    className="border-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700"
                    style={{ fontWeight: 600 }}
                  >
                    {error}
                  </div>
                )}
                <div>
                  <label
                    htmlFor={emailId}
                    className="block text-sm text-gray-900 mb-1.5"
                    style={{ fontWeight: 600 }}
                  >
                    E-mail <span aria-hidden="true" className="text-red-600">*</span>
                    <span className="sr-only"> (obrigatório)</span>
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com.br"
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                    required
                    autoComplete="email"
                    inputMode="email"
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                  aria-busy={loading}
                >
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>
            </>
          )}
        </section>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-gray-900 hover:text-black transition-colors mt-6 underline underline-offset-2"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Voltar ao login
        </Link>
      </main>
    </div>
  );
}
