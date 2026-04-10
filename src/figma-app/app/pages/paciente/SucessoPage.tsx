import { useParams, useNavigate } from "react-router";
import { CheckCircle, ChevronRight, Download } from "lucide-react";
import { formatCurrency } from "../../data/mockData";
import { useSprintSession } from "../../data/sprintStore";

export default function SucessoPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { orders, clinic } = useSprintSession();
  const order = orders.find((o) => o.code === code);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-4">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1
            style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.04em" }}
            className="mb-2"
          >
            Pagamento confirmado!
          </h1>
          <p className="text-gray-500 text-sm mb-6" style={{ lineHeight: 1.7 }}>
            Seu pedido foi recebido pela {clinic.name} e já está na fila de produção. Você receberá atualizações sobre a entrega.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Pedido
              </p>
              <span className="bg-black text-white text-xs px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>
                Em produção
              </span>
            </div>
            <p className="text-black" style={{ fontWeight: 700, fontSize: "1.125rem", letterSpacing: "0.05em" }}>
              {order.code}
            </p>
            <p className="text-gray-500 text-sm mt-1">{order.items[0]?.name} · {order.items[0]?.quantity}x</p>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
              <span className="text-gray-400 text-sm">Valor pago</span>
              <span className="text-black" style={{ fontWeight: 700 }}>{formatCurrency(order.finalPrice)}</span>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Entrega prevista: {order.deliveryDate.split("-").reverse().join("/")}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate(`/paciente/pedido/${code}/status`)}
              className="w-full bg-black text-white py-3 rounded-lg text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 600 }}
            >
              Acompanhar entrega <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:border-black transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 500 }}
            >
              <Download className="w-4 h-4" /> Baixar comprovante
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm mb-1">Dúvidas? Fale com sua nutricionista</p>
          <p className="text-black text-sm" style={{ fontWeight: 600 }}>{clinic.nutritionistName}</p>
          <p className="text-gray-500 text-xs">{clinic.phone} · {clinic.email}</p>
        </div>

        <p className="text-center text-gray-300 text-xs mt-6">
          Tecnologia FastInBox · Plataforma white label
        </p>
      </div>
    </div>
  );
}
