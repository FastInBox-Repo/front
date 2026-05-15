import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Lock, CreditCard, Smartphone, Check, Loader2, ShieldCheck, FileText } from "lucide-react";
import { formatCurrency } from "../../data/mockData";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";
import SkipLink from "../../components/a11y/SkipLink";

type Method = "pix" | "cartao" | "boleto";

type ProgressStage = "idle" | "verificando" | "processando" | "confirmando" | "sucesso";

const progressSteps: { id: ProgressStage; label: string }[] = [
  { id: "verificando", label: "Verificando dados" },
  { id: "processando", label: "Processando pagamento" },
  { id: "confirmando", label: "Confirmando com a clínica" },
  { id: "sucesso", label: "Pagamento aprovado" },
];

export default function PagamentoPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const { orders, clinic } = useSprintSession();

  const uid = useId();
  const ids = {
    num: `${uid}-num`,
    name: `${uid}-name`,
    exp: `${uid}-exp`,
    cvv: `${uid}-cvv`,
    err: `${uid}-err`,
  };

  const order = orders.find((o) => o.code === code);

  useEffect(() => {
    if (progress === "sucesso") {
      const timeout = setTimeout(() => {
        navigate(`/paciente/pedido/${code}/sucesso`);
      }, 900);
      return () => clearTimeout(timeout);
    }
  }, [progress, code, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center" role="alert">
          <p className="text-gray-900 text-sm mb-3">Pedido não encontrado.</p>
          <button
            onClick={() => navigate("/paciente")}
            className="bg-black text-white px-4 py-2 rounded-md text-sm"
            style={{ fontWeight: 600 }}
            type="button"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    setError(null);
    if (method === "cartao" && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      setError("Preencha todos os dados do cartão");
      toast.error("Preencha todos os dados do cartão");
      return;
    }
    setLoading(true);
    setProgress("verificando");
    await new Promise((r) => setTimeout(r, 700));
    setProgress("processando");
    await new Promise((r) => setTimeout(r, 900));
    setProgress("confirmando");
    await new Promise((r) => setTimeout(r, 600));
    await sprintStoreActions.markOrderAsPaid(code || "", method);
    setProgress("sucesso");
    toast.success("Pagamento confirmado! Seu pedido entrou na fila de produção.");
    setLoading(false);
  };

  const progressIndex = progressSteps.findIndex((step) => step.id === progress);

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink />
      <header className="bg-black text-white" data-dark-surface>
        <div className="max-w-2xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate(`/paciente/pedido/${code}`)}
            className="flex items-center gap-1.5 text-gray-100 hover:text-white transition-colors mb-3 text-sm"
            type="button"
            aria-label="Voltar ao pedido"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" /> Voltar
          </button>
          <p className="text-white m-0" style={{ fontWeight: 700, fontSize: "1.125rem" }}>{clinic.name}</p>
          <p className="text-gray-100 text-sm m-0">Pagamento seguro</p>
        </div>
      </header>

      <main id="main-content" className="max-w-2xl mx-auto px-4 py-6" tabIndex={-1}>
        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-4" aria-labelledby="summary-title">
          <h2 id="summary-title" className="text-xs text-gray-900 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
            Resumo do pedido
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black m-0" style={{ fontWeight: 600 }}>{order.code}</p>
              <p className="text-gray-900 text-sm m-0">{order.items[0]?.name} · {order.items[0]?.quantity}x</p>
            </div>
            <p className="text-black m-0" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.04em" }}>
              {formatCurrency(order.finalPrice)}
            </p>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-4" aria-labelledby="method-title">
          <h2 id="method-title" className="text-xs text-gray-900 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
            Forma de pagamento
          </h2>
          <div className="grid grid-cols-3 gap-2 mb-4" role="radiogroup" aria-label="Selecione a forma de pagamento">
            {[
              { id: "pix" as Method, icon: Smartphone, label: "PIX" },
              { id: "cartao" as Method, icon: CreditCard, label: "Cartão" },
              { id: "boleto" as Method, icon: FileText, label: "Boleto" },
            ].map(({ id, icon: Icon, label }) => {
              const active = method === id;
              return (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    active ? "border-black bg-gray-50" : "border-gray-300 hover:border-black"
                  }`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                >
                  <Icon className="w-4 h-4 text-gray-900" aria-hidden="true" focusable="false" />
                  <span className="text-xs" style={{ fontWeight: active ? 600 : 400 }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {method === "pix" && (
            <div className="text-center border border-gray-200 rounded-lg p-6" role="region" aria-label="Pagamento via PIX">
              <div
                className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-gray-300"
                role="img"
                aria-label="QR code para pagamento via PIX"
              >
                <div className="grid grid-cols-4 gap-0.5" aria-hidden="true">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${i % 3 === 0 ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-black mb-2 m-0" style={{ fontWeight: 600 }}>Escaneie o QR Code</p>
              <p className="text-gray-900 text-xs mb-3 m-0">ou copie a chave PIX abaixo</p>
              <div className="bg-gray-50 border border-gray-300 rounded-md p-2.5 flex items-center gap-2 text-left">
                <span className="flex-1 text-xs text-gray-900 truncate font-mono" aria-label="Chave PIX">
                  00020126580014br.gov.bcb.pix013600...fastinbox
                </span>
                <button
                  className="text-xs bg-black text-white px-2 py-1 rounded shrink-0"
                  onClick={() => toast.success("Chave PIX copiada!")}
                  style={{ fontWeight: 500 }}
                  type="button"
                  aria-label="Copiar chave PIX"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {method === "cartao" && (
            <div className="space-y-3" role="group" aria-label="Dados do cartão de crédito">
              {error && (
                <div
                  id={ids.err}
                  role="alert"
                  aria-live="assertive"
                  className="border-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700"
                  style={{ fontWeight: 600 }}
                >
                  {error}
                </div>
              )}
              <div>
                <label htmlFor={ids.num} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>
                  Número do cartão
                </label>
                <input
                  id={ids.num}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black font-mono"
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
              </div>
              <div>
                <label htmlFor={ids.name} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>
                  Nome no cartão
                </label>
                <input
                  id={ids.name}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="NOME COMO NO CARTÃO"
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black uppercase"
                  autoComplete="cc-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={ids.exp} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>
                    Validade
                  </label>
                  <input
                    id={ids.exp}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label htmlFor={ids.cvv} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>
                    CVV
                  </label>
                  <input
                    id={ids.cvv}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="000"
                    maxLength={4}
                    type="password"
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          )}

          {method === "boleto" && (
            <div className="border border-gray-200 rounded-lg p-5 text-center" role="region" aria-label="Pagamento via boleto">
              <p className="text-black mb-2 m-0" style={{ fontWeight: 600 }}>Boleto bancário</p>
              <p className="text-gray-900 text-sm mb-3 m-0">
                O boleto vence em <strong>3 dias úteis</strong>. Após o pagamento, aguarde até 2 dias para confirmação.
              </p>
              <div className="bg-gray-50 border border-dashed border-gray-400 rounded-md p-3 text-gray-900 text-xs font-mono" aria-label="Linha digitável do boleto">
                3458.90000 1/04 00035.701 63 00000-0 1 103900000022000
              </div>
            </div>
          )}
        </section>

        <div className="flex items-center gap-2 justify-center mb-4">
          <Lock className="w-3.5 h-3.5 text-gray-900" aria-hidden="true" focusable="false" />
          <p className="text-xs text-gray-900 m-0">Pagamento 100% seguro com criptografia SSL</p>
        </div>

        {loading && progressIndex >= 0 && (
          <section
            className="mb-4 border border-gray-200 rounded-xl p-4 bg-white"
            role="status"
            aria-live="polite"
            aria-labelledby="payment-progress-title"
          >
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 text-black animate-spin" aria-hidden="true" focusable="false" />
              <p id="payment-progress-title" className="text-sm text-black m-0" style={{ fontWeight: 600 }}>
                {progressSteps[progressIndex]?.label ?? "Processando"}
              </p>
            </div>
            <ol className="space-y-2 list-none p-0 m-0">
              {progressSteps.map((step, idx) => {
                const done = idx < progressIndex;
                const current = idx === progressIndex;
                return (
                  <li key={step.id} className="flex items-center gap-2" aria-current={current ? "step" : undefined}>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        done
                          ? "bg-black border-black text-white"
                          : current
                          ? "bg-white border-black text-black"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      aria-hidden="true"
                    >
                      {done ? <Check className="w-2.5 h-2.5" aria-hidden="true" focusable="false" /> : idx + 1}
                    </span>
                    <span
                      className={`text-xs ${current ? "text-black" : done ? "text-gray-900" : "text-gray-900"}`}
                      style={{ fontWeight: current ? 600 : 500 }}
                    >
                      <span className="sr-only">{done ? "Concluído: " : current ? "Em andamento: " : "Próximo: "}</span>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-900">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" focusable="false" />
              <span>Transação 100% simulada para demonstração. Nenhum dado real é cobrado.</span>
            </div>
          </section>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl text-sm hover:bg-gray-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontWeight: 700, fontSize: "1rem" }}
          type="button"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" focusable="false" /> Processando pagamento...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" aria-hidden="true" focusable="false" />
              Pagar {formatCurrency(order.finalPrice)}
            </>
          )}
        </button>

        <p className="text-center text-gray-900 text-xs mt-4 m-0">
          FastInBox · Pagamento simples e seguro
        </p>
      </main>
    </div>
  );
}
