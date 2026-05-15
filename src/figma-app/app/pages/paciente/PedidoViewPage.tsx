import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Phone, CheckCircle, Edit3, Lock, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, statusLabels } from "../../data/mockData";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useSprintSession } from "../../data/sprintStore";
import SkipLink from "../../components/a11y/SkipLink";

const categoryColors: Record<string, string> = {
  proteina: "bg-gray-900 text-white",
  carboidrato: "bg-gray-700 text-white",
  vegetal: "bg-gray-500 text-white",
  gordura: "bg-gray-200 text-gray-900",
  tempero: "bg-gray-100 text-gray-900",
};

export default function PedidoViewPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState("");
  const { orders, clinic } = useSprintSession();
  const notesId = useId();

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
      <SkipLink />
      <header className="bg-black text-white" data-dark-surface>
        <div className="max-w-2xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate("/paciente")}
            className="flex items-center gap-1.5 text-gray-100 hover:text-white transition-colors mb-4 text-sm"
            type="button"
            aria-label="Voltar ao painel do paciente"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" focusable="false" /> Voltar
          </button>
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="text-black" style={{ fontWeight: 900, fontSize: "0.875rem" }}>
                {clinic.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
            </div>
            <div>
              <p className="text-white m-0" style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                {clinic.name}
              </p>
              <p className="text-gray-100 text-sm m-0">{clinic.nutritionistName} · {clinic.nutritionistCRN}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-100 flex-wrap">
                <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} className="flex items-center gap-1 underline underline-offset-2" aria-label={`Telefone ${clinic.phone}`}>
                  <Phone className="w-3 h-3" aria-hidden="true" focusable="false" /> {clinic.phone}
                </a>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" aria-hidden="true" focusable="false" />
                  <span className="sr-only">Endereço: </span>
                  {clinic.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-2xl mx-auto px-4 py-6" tabIndex={-1}>
        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-4" aria-labelledby="order-code-title">
          <div className="flex items-center justify-between mb-1">
            <h2 id="order-code-title" className="text-xs text-gray-900 uppercase tracking-wider m-0" style={{ fontWeight: 600 }}>
              Código do pedido
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                isPaid ? "bg-black text-white border-black" : "bg-gray-100 text-gray-900 border-gray-300"
              }`}
              style={{ fontWeight: 500 }}
              role="status"
            >
              <span className="sr-only">Status: </span>
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="text-black m-0" style={{ fontWeight: 900, fontSize: "1.5rem", letterSpacing: "0.08em" }}>
            {order.code}
          </p>
          <p className="text-gray-900 text-sm mt-0.5 m-0">
            Entrega prevista: <time dateTime={order.deliveryDate}>{formatDate(order.deliveryDate)}</time>
          </p>
        </section>

        {order.items.map((item) => (
          <section key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 mb-4" aria-labelledby={`item-${item.id}-title`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id={`item-${item.id}-title`} className="text-black m-0" style={{ fontWeight: 700, fontSize: "1rem" }}>{item.name}</h2>
                <p className="text-gray-900 text-sm m-0">{item.quantity} marmitas · {item.packaging}</p>
              </div>
              {order.allowEditing && !isPaid && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5 text-xs border border-gray-300 rounded-md px-2.5 py-1.5 hover:border-black transition-colors text-gray-900"
                  style={{ fontWeight: 500 }}
                  type="button"
                  aria-pressed={editMode}
                  aria-label={editMode ? "Bloquear edição do pedido" : "Editar pedido"}
                >
                  {editMode ? (
                    <Lock className="w-3 h-3" aria-hidden="true" focusable="false" />
                  ) : (
                    <Edit3 className="w-3 h-3" aria-hidden="true" focusable="false" />
                  )}
                  {editMode ? "Bloquear" : "Editar"}
                </button>
              )}
              {!order.allowEditing && !isPaid && (
                <span className="flex items-center gap-1 text-xs text-gray-900" aria-label="Edição bloqueada pela nutricionista">
                  <Lock className="w-3 h-3" aria-hidden="true" focusable="false" /> Bloqueado
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Composição
              </h3>
              <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                {item.ingredients.map((ing) => (
                  <li
                    key={ing.id}
                    className={`text-xs px-2.5 py-1 rounded-full ${categoryColors[ing.category] || "bg-gray-100 text-gray-900"}`}
                    style={{ fontWeight: 500 }}
                  >
                    <span className="sr-only">{ing.category}: </span>
                    {ing.name} {ing.quantity}
                  </li>
                ))}
              </ul>
            </div>

            {item.observations && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-900 mb-0.5 m-0" style={{ fontWeight: 500 }}>Observações</p>
                <p className="text-gray-900 text-sm m-0">{item.observations}</p>
              </div>
            )}
          </section>
        ))}

        {order.nutritionalObservations && (
          <aside className="bg-white border border-gray-200 rounded-xl p-5 mb-4" aria-labelledby="nutri-orient-title">
            <h2 id="nutri-orient-title" className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
              Orientações da nutricionista
            </h2>
            <p className="text-gray-900 text-sm m-0" style={{ lineHeight: 1.7 }}>
              {order.nutritionalObservations}
            </p>
          </aside>
        )}

        {editMode && order.allowEditing && !isPaid && (
          <section className="bg-white border-2 border-black rounded-xl p-5 mb-4" aria-labelledby="edit-section-title">
            <label htmlFor={notesId} id="edit-section-title" className="block text-sm mb-2 text-black" style={{ fontWeight: 600 }}>
              Observações adicionais
            </label>
            <textarea
              id={notesId}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma solicitação especial? Alergias? Preferências?"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
              aria-describedby={`${notesId}-help`}
            />
            <p id={`${notesId}-help`} className="text-xs text-gray-900 mt-1">
              Sua nutricionista revisará as alterações antes da produção.
            </p>
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-xl p-5" aria-labelledby="total-title">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-900 text-sm m-0" id="total-title">Total do pedido</p>
              <p className="text-black m-0" style={{ fontWeight: 900, fontSize: "1.75rem", letterSpacing: "-0.04em" }}>
                {formatCurrency(order.finalPrice)}
              </p>
            </div>
            {isPaid && (
              <p className="flex items-center gap-1.5 text-sm text-gray-900 m-0" role="status">
                <CheckCircle className="w-4 h-4 text-black" aria-hidden="true" focusable="false" />
                Pago
              </p>
            )}
          </div>

          {canPay && (
            <button
              onClick={handleConfirmAndPay}
              className="w-full bg-black text-white py-3.5 rounded-lg text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 700 }}
              type="button"
            >
              {editMode ? "Salvar e ir ao pagamento" : "Confirmar e pagar"}
              <ChevronRight className="w-4 h-4" aria-hidden="true" focusable="false" />
            </button>
          )}

          {isPaid && (
            <button
              onClick={() => navigate(`/paciente/pedido/${code}/status`)}
              className="w-full border border-gray-300 text-gray-900 py-3 rounded-lg text-sm hover:border-black transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 600 }}
              type="button"
              aria-label="Acompanhar entrega do pedido"
            >
              Acompanhar entrega <ChevronRight className="w-4 h-4" aria-hidden="true" focusable="false" />
            </button>
          )}
        </section>

        <p className="text-center text-gray-900 text-xs mt-6 m-0">
          FastInBox · Pedido acompanhado em tempo real
        </p>
      </main>
    </div>
  );
}
