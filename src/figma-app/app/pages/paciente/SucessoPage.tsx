import { useParams, useNavigate } from "react-router";
import { CheckCircle, ChevronRight, Download } from "lucide-react";
import { formatCurrency } from "../../data/mockData";
import { useSprintSession } from "../../data/sprintStore";
import SkipLink from "../../components/a11y/SkipLink";

export default function SucessoPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { orders, clinic } = useSprintSession();
  const order = orders.find((o) => o.code === code);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <SkipLink />
      <main id="main-content" className="w-full max-w-md" tabIndex={-1} aria-labelledby="success-title">
        <section
          className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-4"
          role="status"
          aria-live="polite"
          aria-labelledby="success-title"
        >
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-5" aria-hidden="true">
            <CheckCircle className="w-8 h-8 text-white" aria-hidden="true" focusable="false" />
          </div>
          <h1
            id="success-title"
            style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.04em" }}
            className="mb-2"
          >
            Pagamento confirmado!
          </h1>
          <p className="text-gray-900 text-sm mb-6" style={{ lineHeight: 1.7 }}>
            Seu pedido foi recebido pela {clinic.name} e já está na fila de produção. Você receberá atualizações sobre a entrega.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-900 uppercase tracking-wider m-0" style={{ fontWeight: 600 }}>
                Pedido
              </p>
              <span className="bg-black text-white text-xs px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>
                <span className="sr-only">Status: </span>
                Em produção
              </span>
            </div>
            <p className="text-black m-0" style={{ fontWeight: 700, fontSize: "1.125rem", letterSpacing: "0.05em" }}>
              {order.code}
            </p>
            <p className="text-gray-900 text-sm mt-1 m-0">{order.items[0]?.name} · {order.items[0]?.quantity}x</p>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
              <span className="text-gray-900 text-sm">Valor pago</span>
              <span className="text-black" style={{ fontWeight: 700 }}>{formatCurrency(order.finalPrice)}</span>
            </div>
            <p className="text-gray-900 text-xs mt-2 m-0">
              Entrega prevista: <time dateTime={order.deliveryDate}>{order.deliveryDate.split("-").reverse().join("/")}</time>
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate(`/paciente/pedido/${code}/status`)}
              className="w-full bg-black text-white py-3 rounded-lg text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 600 }}
              type="button"
              aria-label={`Acompanhar entrega do pedido ${order.code}`}
            >
              Acompanhar entrega <ChevronRight className="w-4 h-4" aria-hidden="true" focusable="false" />
            </button>
            <button
              className="w-full border border-gray-300 text-gray-900 py-2.5 rounded-lg text-sm hover:border-black transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 500 }}
              type="button"
            >
              <Download className="w-4 h-4" aria-hidden="true" focusable="false" /> Baixar comprovante
            </button>
          </div>
        </section>

        <aside className="bg-white border border-gray-200 rounded-xl p-4 text-center" aria-labelledby="help-title">
          <h2 id="help-title" className="text-gray-900 text-sm mb-1 m-0">Dúvidas? Fale com sua nutricionista</h2>
          <p className="text-black text-sm m-0" style={{ fontWeight: 600 }}>{clinic.nutritionistName}</p>
          <p className="text-gray-900 text-xs m-0">
            <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} className="underline underline-offset-2" aria-label={`Ligar para ${clinic.phone}`}>
              {clinic.phone}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${clinic.email}`} className="underline underline-offset-2">
              {clinic.email}
            </a>
          </p>
        </aside>

        <p className="text-center text-gray-900 text-xs mt-6">
          FastInBox · Pedido confirmado com sucesso
        </p>
      </main>
    </div>
  );
}
