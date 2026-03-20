import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Package, ChefHat, Truck, CheckCircle, Clock } from "lucide-react";
import { mockOrders, mockClinic, formatDate } from "../../data/mockData";

const STATUS_STEPS = [
  { id: "pago", icon: CheckCircle, label: "Pagamento confirmado", desc: "Seu pagamento foi aprovado" },
  { id: "em_producao", icon: ChefHat, label: "Em produção", desc: "A cozinha está preparando seu pedido" },
  { id: "pronto", icon: Package, label: "Pronto para entrega", desc: "Seu pedido foi embalado" },
  { id: "em_entrega", icon: Truck, label: "Saiu para entrega", desc: "Pedido a caminho" },
  { id: "entregue", icon: CheckCircle, label: "Entregue", desc: "Pedido recebido com sucesso" },
];

const STATUS_ORDER = ["pago", "em_producao", "pronto", "em_entrega", "entregue"];

export default function StatusPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const order = mockOrders.find((o) => o.code === code) || mockOrders[0];
  const clinic = mockClinic;

  const currentStepIdx = STATUS_ORDER.indexOf(order.status);
  const currentStep = currentStepIdx === -1 ? 0 : currentStepIdx;

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
          <p className="text-gray-400 text-sm">Acompanhamento do pedido</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Order info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                Pedido
              </p>
              <p className="text-black" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "0.05em" }}>
                {order.code}
              </p>
              <p className="text-gray-500 text-sm">{order.items[0]?.name} · {order.items[0]?.quantity}x</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Entrega prevista</p>
              <p className="text-black" style={{ fontWeight: 700 }}>{formatDate(order.deliveryDate)}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-5" style={{ fontWeight: 600 }}>
            Status do pedido
          </p>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone
                          ? "bg-black border-black"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${isDone ? "text-white" : "text-gray-300"}`}
                      />
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mt-1 ${
                          idx < currentStep ? "bg-black" : "bg-gray-100"
                        }`}
                      />
                    )}
                  </div>
                  <div className={`pb-6 ${idx === STATUS_STEPS.length - 1 ? "pb-0" : ""}`}>
                    <p
                      className={`text-sm ${isDone ? "text-black" : "text-gray-300"}`}
                      style={{ fontWeight: isCurrent ? 700 : 500 }}
                    >
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 inline-flex items-center gap-1 bg-black text-white text-xs px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" /> Atual
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDone ? "text-gray-400" : "text-gray-200"}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>
            Contato
          </p>
          <p className="text-black text-sm" style={{ fontWeight: 600 }}>{clinic.nutritionistName}</p>
          <p className="text-gray-500 text-sm">{clinic.phone}</p>
          <p className="text-gray-500 text-sm">{clinic.address}</p>
        </div>

        <p className="text-center text-gray-300 text-xs mt-6">
          Tecnologia FastInBox · Plataforma white label
        </p>
      </div>
    </div>
  );
}
