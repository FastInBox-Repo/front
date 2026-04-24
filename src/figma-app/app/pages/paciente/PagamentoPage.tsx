import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Lock, CreditCard, Smartphone, Check, Loader2, ShieldCheck } from "lucide-react";
import { formatCurrency } from "../../data/mockData";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";

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
  const { orders, clinic } = useSprintSession();

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
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-3">Pedido não encontrado.</p>
          <button
            onClick={() => navigate("/paciente")}
            className="bg-black text-white px-4 py-2 rounded-md text-sm"
            style={{ fontWeight: 600 }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (method === "cartao" && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
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
    sprintStoreActions.markOrderAsPaid(code || "", method);
    setProgress("sucesso");
    toast.success("Pagamento confirmado! Seu pedido entrou na fila de produção.");
    setLoading(false);
  };

  const progressIndex = progressSteps.findIndex((step) => step.id === progress);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate(`/paciente/pedido/${code}`)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <p className="text-white" style={{ fontWeight: 700, fontSize: "1.125rem" }}>{clinic.name}</p>
          <p className="text-gray-400 text-sm">Pagamento seguro</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Order summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
            Resumo do pedido
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black" style={{ fontWeight: 600 }}>{order.code}</p>
              <p className="text-gray-500 text-sm">{order.items[0]?.name} · {order.items[0]?.quantity}x</p>
            </div>
            <p className="text-black" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.04em" }}>
              {formatCurrency(order.finalPrice)}
            </p>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
            Forma de pagamento
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { id: "pix" as Method, icon: Smartphone, label: "PIX" },
              { id: "cartao" as Method, icon: CreditCard, label: "Cartão" },
              { id: "boleto" as Method, icon: null, label: "Boleto" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                  method === id ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-gray-600" />}
                {!Icon && <span className="text-gray-600 text-sm">📄</span>}
                <span className="text-xs" style={{ fontWeight: method === id ? 600 : 400 }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* PIX */}
          {method === "pix" && (
            <div className="text-center border border-gray-200 rounded-lg p-6">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-gray-200">
                <div className="grid grid-cols-4 gap-0.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-black mb-2" style={{ fontWeight: 600 }}>Escaneie o QR Code</p>
              <p className="text-gray-400 text-xs mb-3">ou copie a chave PIX abaixo</p>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 flex items-center gap-2 text-left">
                <span className="flex-1 text-xs text-gray-500 truncate font-mono">
                  00020126580014br.gov.bcb.pix013600...fastinbox
                </span>
                <button
                  className="text-xs bg-black text-white px-2 py-1 rounded flex-shrink-0"
                  onClick={() => toast.success("Chave PIX copiada!")}
                  style={{ fontWeight: 500 }}
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Cartão */}
          {method === "cartao" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>
                  Número do cartão
                </label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>
                  Nome no cartão
                </label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="NOME COMO NO CARTÃO"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>
                    Validade
                  </label>
                  <input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>
                    CVV
                  </label>
                  <input
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="000"
                    maxLength={4}
                    type="password"
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Boleto */}
          {method === "boleto" && (
            <div className="border border-gray-200 rounded-lg p-5 text-center">
              <p className="text-black mb-2" style={{ fontWeight: 600 }}>Boleto bancário</p>
              <p className="text-gray-500 text-sm mb-3">
                O boleto vence em <strong>3 dias úteis</strong>. Após o pagamento, aguarde até 2 dias para confirmação.
              </p>
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-3 text-gray-400 text-xs font-mono">
                3458.90000 1/04 00035.701 63 00000-0 1 103900000022000
              </div>
            </div>
          )}
        </div>

        {/* Security + Pay */}
        <div className="flex items-center gap-2 justify-center mb-4">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-xs text-gray-400">Pagamento 100% seguro com criptografia SSL</p>
        </div>

        {loading && progressIndex >= 0 && (
          <div
            className="mb-4 border border-gray-200 rounded-xl p-4 bg-white"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 text-black animate-spin" />
              <p className="text-sm text-black" style={{ fontWeight: 600 }}>
                {progressSteps[progressIndex]?.label ?? "Processando"}
              </p>
            </div>
            <div className="space-y-2">
              {progressSteps.map((step, idx) => {
                const done = idx < progressIndex;
                const current = idx === progressIndex;
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        done
                          ? "bg-black border-black text-white"
                          : current
                          ? "bg-white border-black text-black"
                          : "bg-white border-gray-200 text-gray-300"
                      }`}
                    >
                      {done ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                    </span>
                    <span
                      className={`text-xs ${current ? "text-black" : done ? "text-gray-500" : "text-gray-300"}`}
                      style={{ fontWeight: current ? 600 : 500 }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
              <ShieldCheck className="w-3 h-3" />
              <span>Transação 100% simulada para demonstração. Nenhum dado real é cobrado.</span>
            </div>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl text-sm hover:bg-gray-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontWeight: 700, fontSize: "1rem" }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processando pagamento...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Pagar {formatCurrency(order.finalPrice)}
            </>
          )}
        </button>

        <p className="text-center text-gray-300 text-xs mt-4">
          FastInBox · Pagamento simples e seguro
        </p>
      </div>
    </div>
  );
}
