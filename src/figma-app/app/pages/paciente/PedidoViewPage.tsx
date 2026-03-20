import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Phone, CheckCircle, Edit3, Lock, ChevronRight } from "lucide-react";
import { mockOrders, mockClinic, formatCurrency, formatDate, statusLabels } from "../../data/mockData";
import { useState } from "react";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  proteina: "bg-gray-900 text-white",
  carboidrato: "bg-gray-700 text-white",
  vegetal: "bg-gray-500 text-white",
  gordura: "bg-gray-300 text-gray-800",
  tempero: "bg-gray-100 text-gray-600",
};

export default function PedidoViewPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState("");

  const order = mockOrders.find((o) => o.code === code) || mockOrders[1];
  const clinic = mockClinic;

  const canPay = order.status === "aguardando_pagamento" || order.status === "aguardando_confirmacao";
  const isPaid = ["pago", "em_producao", "pronto", "em_entrega", "entregue"].includes(order.status);

  const handleConfirmAndPay = () => {
    if (editMode) {
      toast.success("Alterações salvas!");
      setEditMode(false);
    }
    navigate(`/paciente/pedido/${code}/pagamento`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clinic Header */}
      <header className="bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate("/paciente")}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-black" style={{ fontWeight: 900, fontSize: "0.875rem" }}>
                {clinic.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
            </div>
            <div>
              <p className="text-white" style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                {clinic.name}
              </p>
              <p className="text-gray-400 text-sm">{clinic.nutritionistName} · {clinic.nutritionistCRN}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {clinic.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {clinic.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Order code + status */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
              Código do pedido
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                isPaid ? "bg-black text-white border-black" : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
              style={{ fontWeight: 500 }}
            >
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="text-black" style={{ fontWeight: 900, fontSize: "1.5rem", letterSpacing: "0.08em" }}>
            {order.code}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">Entrega prevista: {formatDate(order.deliveryDate)}</p>
        </div>

        {/* Items */}
        {order.items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-black" style={{ fontWeight: 700, fontSize: "1rem" }}>{item.name}</p>
                <p className="text-gray-400 text-sm">{item.quantity} marmitas · {item.packaging}</p>
              </div>
              {order.allowEditing && !isPaid && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-md px-2.5 py-1.5 hover:border-black transition-colors text-gray-500"
                  style={{ fontWeight: 500 }}
                >
                  {editMode ? <Lock className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                  {editMode ? "Bloquear" : "Editar"}
                </button>
              )}
              {!order.allowEditing && !isPaid && (
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <Lock className="w-3 h-3" /> Bloqueado
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Composição
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing) => (
                  <span
                    key={ing.id}
                    className={`text-xs px-2.5 py-1 rounded-full ${categoryColors[ing.category] || "bg-gray-100 text-gray-600"}`}
                    style={{ fontWeight: 500 }}
                  >
                    {ing.name} {ing.quantity}
                  </span>
                ))}
              </div>
            </div>

            {item.observations && (
              <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5" style={{ fontWeight: 500 }}>Observações</p>
                <p className="text-gray-600 text-sm">{item.observations}</p>
              </div>
            )}
          </div>
        ))}

        {/* Nutritional observations */}
        {order.nutritionalObservations && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
              Orientações da nutricionista
            </p>
            <p className="text-gray-600 text-sm" style={{ lineHeight: 1.7 }}>
              {order.nutritionalObservations}
            </p>
          </div>
        )}

        {/* Edit section */}
        {editMode && order.allowEditing && !isPaid && (
          <div className="bg-white border border-black rounded-xl p-5 mb-4">
            <p className="text-sm mb-2 text-black" style={{ fontWeight: 600 }}>
              Observações adicionais
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma solicitação especial? Alergias? Preferências?"
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Sua nutricionista revisará as alterações antes da produção.
            </p>
          </div>
        )}

        {/* Price + CTA */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total do pedido</p>
              <p className="text-black" style={{ fontWeight: 900, fontSize: "1.75rem", letterSpacing: "-0.04em" }}>
                {formatCurrency(order.finalPrice)}
              </p>
            </div>
            {isPaid && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-black" />
                Pago
              </div>
            )}
          </div>

          {canPay && (
            <button
              onClick={handleConfirmAndPay}
              className="w-full bg-black text-white py-3.5 rounded-lg text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 700 }}
            >
              {editMode ? "Salvar e ir ao pagamento" : "Confirmar e pagar"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {isPaid && (
            <button
              onClick={() => navigate(`/paciente/pedido/${code}/status`)}
              className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg text-sm hover:border-black transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 600 }}
            >
              Acompanhar entrega <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-center text-gray-300 text-xs mt-6">
          Tecnologia FastInBox · Plataforma white label
        </p>
      </div>
    </div>
  );
}