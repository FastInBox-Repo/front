import { useId, useState } from "react";
import { mockClinic } from "../../data/mockData";
import { Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const [form, setForm] = useState(mockClinic);
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const uid = useId();

  const handleSave = async () => {
    setSaved(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaved(false);
    toast.success("Configurações salvas!");
  };

  const fields: Array<{ label: string; key: keyof typeof form; autoComplete?: string; type?: string }> = [
    { label: "Nome completo", key: "nutritionistName", autoComplete: "name" },
    { label: "CRN", key: "nutritionistCRN" },
    { label: "E-mail de contato", key: "email", autoComplete: "email", type: "email" },
    { label: "Telefone", key: "phone", autoComplete: "tel", type: "tel" },
    { label: "Endereço", key: "address", autoComplete: "street-address" },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Configurações</h1>
          <p className="text-gray-900 text-sm mt-0.5">Personalize a identidade da sua clínica</p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 border border-gray-300 text-gray-900 px-4 py-2 rounded-md text-sm hover:border-black transition-colors"
          style={{ fontWeight: 500 }}
          type="button"
          aria-pressed={showPreview}
          aria-controls="preview-region"
        >
          {showPreview ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" focusable="false" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" focusable="false" />
          )}
          {showPreview ? "Ocultar prévia" : "Prévia do paciente"}
        </button>
      </header>

      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <fieldset className="bg-white border border-gray-200 rounded-lg p-6 m-0">
            <legend className="px-1 mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
              Identidade da clínica
            </legend>
            <div className="space-y-4">
              <div>
                <label htmlFor={`${uid}-name`} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                  Nome da clínica
                </label>
                <input
                  id={`${uid}-name`}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                  autoComplete="organization"
                />
              </div>
              <div>
                <span
                  className="block text-sm text-gray-900 mb-1.5"
                  style={{ fontWeight: 500 }}
                  id={`${uid}-logo-label`}
                >
                  Logotipo
                </span>
                <label
                  htmlFor={`${uid}-logo`}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black focus-within:border-black transition-colors cursor-pointer block"
                >
                  <span
                    className="w-10 h-10 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-gray-900 text-lg">↑</span>
                  </span>
                  <span className="text-gray-900 text-sm block">Arraste ou clique para enviar</span>
                  <span className="text-gray-900 text-xs mt-0.5 block">SVG, PNG ou JPG até 2MB</span>
                  <input
                    id={`${uid}-logo`}
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg"
                    className="sr-only"
                    aria-labelledby={`${uid}-logo-label`}
                  />
                </label>
              </div>
              <div>
                <label htmlFor={`${uid}-color`} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                  Cor principal (modo monocromático)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`${uid}-color`}
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer p-0.5"
                    aria-label="Seletor visual de cor principal"
                  />
                  <input
                    aria-label="Código hexadecimal da cor principal"
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black font-mono"
                  />
                </div>
                <p id={`${uid}-color-help`} className="text-xs text-gray-900 mt-1">Usado nos botões e destaques da experiência do paciente</p>
              </div>
            </div>
          </fieldset>

          <fieldset className="bg-white border border-gray-200 rounded-lg p-6 m-0">
            <legend className="px-1 mb-4" style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
              Dados do nutricionista
            </legend>
            <div className="space-y-4">
              {fields.map((f) => {
                const fieldId = `${uid}-${f.key}`;
                return (
                  <div key={f.key}>
                    <label htmlFor={fieldId} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                      {f.label}
                    </label>
                    <input
                      id={fieldId}
                      type={f.type || "text"}
                      value={form[f.key] as string}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                      autoComplete={f.autoComplete}
                    />
                  </div>
                );
              })}
            </div>
          </fieldset>

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

        {showPreview && (
          <aside
            id="preview-region"
            className="xl:sticky xl:top-8"
            aria-label="Prévia da experiência do paciente"
          >
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2" aria-hidden="true">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                </div>
                <p className="text-gray-900 text-xs mx-auto m-0">Prévia — Experiência do paciente</p>
              </div>
              <div className="p-6">
                <div
                  className="rounded-lg p-5 mb-4 text-white"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  <p className="text-xs opacity-90 mb-1 m-0">Seu pedido personalizado</p>
                  <p className="m-0" style={{ fontWeight: 800, fontSize: "1.125rem", letterSpacing: "-0.02em" }}>
                    {form.name}
                  </p>
                  <p className="text-xs opacity-90 mt-1 m-0">{form.nutritionistName} · {form.nutritionistCRN}</p>
                </div>

                <div className="space-y-3" aria-hidden="true">
                  <div className="h-4 rounded bg-gray-100" />
                  <div className="h-3 rounded bg-gray-100" />
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
                    <div className="h-2.5 bg-gray-50 rounded mb-1.5" />
                    <div className="h-2.5 bg-gray-50 rounded w-3/4" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <p className="m-0" style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>R$ 220,00</p>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-md text-white text-sm"
                    style={{ backgroundColor: form.primaryColor, fontWeight: 600 }}
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    Confirmar e pagar
                  </button>
                </div>
                <p className="text-center text-gray-900 text-xs mt-4 m-0">Tecnologia FastInBox</p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
