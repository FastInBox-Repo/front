import { useId, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

const paymentMethods = [
  { id: "pix", label: "PIX", desc: "Aprovação instantânea" },
  { id: "cartao", label: "Cartão de crédito", desc: "Aprovação em até 2 dias úteis" },
  { id: "boleto", label: "Boleto bancário", desc: "Aprovação em 1-2 dias úteis" },
];

export default function AdminConfiguracoesPage() {
  const [deliveryDays, setDeliveryDays] = useState<string[]>(["segunda", "quarta", "sexta"]);
  const [minLead, setMinLead] = useState("2");
  const [maxOrders, setMaxOrders] = useState("50");
  const [enabledPayments, setEnabledPayments] = useState<string[]>(["pix", "cartao", "boleto"]);
  const [saved, setSaved] = useState(false);
  const uid = useId();
  const leadId = `${uid}-lead`;
  const maxOrdersId = `${uid}-max`;
  const statusId = `${uid}-status`;

  const days = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

  const toggleDay = (d: string) =>
    setDeliveryDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const togglePayment = (id: string) =>
    setEnabledPayments((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = async () => {
    setSaved(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaved(false);
    toast.success("Configurações salvas!");
  };

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-8">
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Configurações</h1>
        <p className="text-gray-900 text-sm mt-0.5">Regras operacionais da plataforma</p>
      </header>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        aria-describedby={statusId}
      >
        <fieldset className="bg-white border border-gray-200 rounded-lg p-6 m-0">
          <legend className="px-1 mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
            Dias de entrega
          </legend>
          <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Dias de entrega disponíveis">
            {days.map((d) => {
              const active = deliveryDays.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-4 py-2 rounded-md text-sm border capitalize transition-all ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-900 border-gray-300 hover:border-black"
                  }`}
                  style={{ fontWeight: 500 }}
                  type="button"
                  aria-pressed={active}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-900">Dias disponíveis para entrega de pedidos</p>
        </fieldset>

        <fieldset className="bg-white border border-gray-200 rounded-lg p-6 m-0">
          <legend className="px-1 mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
            Regras de pedido
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={leadId} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                Antecedência mínima (dias)
              </label>
              <input
                id={leadId}
                type="number"
                value={minLead}
                onChange={(e) => setMinLead(e.target.value)}
                min={1}
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                aria-describedby={`${leadId}-help`}
              />
              <p id={`${leadId}-help`} className="text-xs text-gray-900 mt-1">Mínimo de dias para pedidos futuros</p>
            </div>
            <div>
              <label htmlFor={maxOrdersId} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                Máx. pedidos/dia na cozinha
              </label>
              <input
                id={maxOrdersId}
                type="number"
                value={maxOrders}
                onChange={(e) => setMaxOrders(e.target.value)}
                min={1}
                inputMode="numeric"
                className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                aria-describedby={`${maxOrdersId}-help`}
              />
              <p id={`${maxOrdersId}-help`} className="text-xs text-gray-900 mt-1">Capacidade máxima diária</p>
            </div>
          </div>
        </fieldset>

        <fieldset className="bg-white border border-gray-200 rounded-lg p-6 m-0">
          <legend className="px-1 mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
            Formas de pagamento
          </legend>
          <ul className="space-y-2 list-none p-0 m-0">
            {paymentMethods.map((m) => {
              const enabled = enabledPayments.includes(m.id);
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="text-black text-sm m-0" style={{ fontWeight: 500 }}>{m.label}</p>
                    <p className="text-gray-900 text-xs m-0">{m.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${enabled ? "Desativar" : "Ativar"} ${m.label}`}
                    onClick={() => togglePayment(m.id)}
                    className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${enabled ? "bg-black" : "bg-gray-400"}`}
                    style={{ border: "2px solid #000000", boxShadow: "none" }}
                  >
                    <span
                      className={`absolute top-0 w-3.5 h-3.5 bg-white rounded-full transition-transform ${enabled ? "right-0" : "left-0"}`}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div id={statusId} role="status" aria-live="polite" className="sr-only">
          {saved ? "Configurações sendo salvas" : ""}
        </div>

        <button
          type="submit"
          disabled={saved}
          className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-70"
          style={{ fontWeight: 600 }}
          aria-busy={saved}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" focusable="false" /> Salvo!
            </>
          ) : (
            "Salvar configurações"
          )}
        </button>
      </form>
    </div>
  );
}
