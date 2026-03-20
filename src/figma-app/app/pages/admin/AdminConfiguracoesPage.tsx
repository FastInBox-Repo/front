import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

export default function AdminConfiguracoesPage() {
  const [deliveryDays, setDeliveryDays] = useState<string[]>(["segunda", "quarta", "sexta"]);
  const [minLead, setMinLead] = useState("2");
  const [maxOrders, setMaxOrders] = useState("50");
  const [saved, setSaved] = useState(false);

  const days = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

  const toggleDay = (d: string) =>
    setDeliveryDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handleSave = async () => {
    setSaved(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaved(false);
    toast.success("Configurações salvas!");
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Configurações</h1>
        <p className="text-gray-500 text-sm mt-0.5">Regras operacionais da plataforma</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Dias de entrega</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`px-4 py-2 rounded-md text-sm border capitalize transition-all ${
                  deliveryDays.includes(d)
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
                style={{ fontWeight: 500 }}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">Dias disponíveis para entrega de pedidos</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Regras de pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                Antecedência mínima (dias)
              </label>
              <input
                type="number"
                value={minLead}
                onChange={(e) => setMinLead(e.target.value)}
                min="1"
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
              />
              <p className="text-xs text-gray-400 mt-1">Mínimo de dias para pedidos futuros</p>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                Máx. pedidos/dia na cozinha
              </label>
              <input
                type="number"
                value={maxOrders}
                onChange={(e) => setMaxOrders(e.target.value)}
                min="1"
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
              />
              <p className="text-xs text-gray-400 mt-1">Capacidade máxima diária</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Formas de pagamento</h2>
          <div className="space-y-2">
            {[
              { id: "pix", label: "PIX", desc: "Aprovação instantânea" },
              { id: "cartao", label: "Cartão de crédito", desc: "Aprovação em até 2 dias úteis" },
              { id: "boleto", label: "Boleto bancário", desc: "Aprovação em 1-2 dias úteis" },
            ].map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-black text-sm" style={{ fontWeight: 500 }}>{m.label}</p>
                  <p className="text-gray-400 text-xs">{m.desc}</p>
                </div>
                <div className="w-9 h-5 bg-black rounded-full relative cursor-pointer">
                  <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saved}
          className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-70"
          style={{ fontWeight: 600 }}
        >
          {saved ? <><Check className="w-4 h-4" /> Salvo!</> : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
