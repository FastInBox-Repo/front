import { useState } from "react";
import { mockClinic } from "../../data/mockData";
import { Check, Eye } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const [form, setForm] = useState(mockClinic);
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaved(false);
    toast.success("Configurações salvas!");
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Configurações</h1>
          <p className="text-gray-500 text-sm mt-0.5">Personalize a identidade da sua clínica</p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm hover:border-black transition-colors"
          style={{ fontWeight: 500 }}
        >
          <Eye className="w-4 h-4" /> {showPreview ? "Ocultar prévia" : "Prévia do paciente"}
        </button>
      </div>

      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
        {/* Form */}
        <div className="space-y-6">
          {/* Clinic identity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Identidade da clínica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                  Nome da clínica
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                  Logotipo
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">↑</span>
                  </div>
                  <p className="text-gray-400 text-sm">Arraste ou clique para enviar</p>
                  <p className="text-gray-300 text-xs mt-0.5">SVG, PNG ou JPG até 2MB</p>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                  Cor principal (modo monocromático)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-md border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="flex-1 border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black font-mono"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Usado nos botões e destaques da experiência do paciente</p>
              </div>
            </div>
          </div>

          {/* Nutritionist info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Dados do nutricionista</h2>
            <div className="space-y-4">
              {[
                { label: "Nome completo", key: "nutritionistName" },
                { label: "CRN", key: "nutritionistCRN" },
                { label: "E-mail de contato", key: "email" },
                { label: "Telefone", key: "phone" },
                { label: "Endereço", key: "address" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                    {f.label}
                  </label>
                  <input
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                  />
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

        {/* Preview */}
        {showPreview && (
          <div className="xl:sticky xl:top-8">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                </div>
                <p className="text-gray-400 text-xs mx-auto">Prévia — Experiência do paciente</p>
              </div>
              <div className="p-6">
                {/* Mock patient header */}
                <div
                  className="rounded-lg p-5 mb-4 text-white"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  <p className="text-xs opacity-70 mb-1">Seu pedido personalizado</p>
                  <p style={{ fontWeight: 800, fontSize: "1.125rem", letterSpacing: "-0.02em" }}>
                    {form.name}
                  </p>
                  <p className="text-xs opacity-70 mt-1">{form.nutritionistName} · {form.nutritionistCRN}</p>
                </div>

                <div className="space-y-3">
                  {["Marmita Hipertrofia", "5x · Embalagem 1000ml"].map((line, i) => (
                    <div key={i} className={`h-${i === 0 ? "4" : "3"} rounded bg-gray-100`} />
                  ))}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
                    <div className="h-2.5 bg-gray-50 rounded mb-1.5" />
                    <div className="h-2.5 bg-gray-50 rounded w-3/4" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <p style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>R$ 220,00</p>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-md text-white text-sm"
                    style={{ backgroundColor: form.primaryColor, fontWeight: 600 }}
                  >
                    Confirmar e pagar
                  </button>
                </div>
                <p className="text-center text-gray-300 text-xs mt-4">Tecnologia FastInBox</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
