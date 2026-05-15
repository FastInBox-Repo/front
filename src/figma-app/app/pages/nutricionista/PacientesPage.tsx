import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, X, ChevronRight } from "lucide-react";
import { Patient, formatDate } from "../../data/mockData";
import { toast } from "sonner";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";

const EMPTY_PATIENT: Omit<Patient, "id" | "createdAt" | "ordersCount"> = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
  goal: "",
  restrictions: "",
};

export default function PacientesPage() {
  const navigate = useNavigate();
  const { patients } = useSprintSession();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_PATIENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uid = useId();
  const searchId = `${uid}-search`;
  const errorId = `${uid}-err`;
  const dialogTitleId = `${uid}-dialog-title`;
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (showModal) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setShowModal(false);
      };
      document.addEventListener("keydown", onKey);
      closeRef.current?.focus();
      return () => document.removeEventListener("keydown", onKey);
    }
    if (!showModal && lastFocusedRef.current) {
      lastFocusedRef.current.focus();
    }
  }, [showModal]);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email) {
      setError("Preencha nome e e-mail");
      toast.error("Preencha nome e e-mail");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    await sprintStoreActions.createPatient({ ...form });
    setShowModal(false);
    setForm(EMPTY_PATIENT);
    toast.success("Paciente cadastrado com sucesso!");
  };

  const fields: Array<{ label: string; key: keyof typeof EMPTY_PATIENT; placeholder?: string; type?: string; required?: boolean; autoComplete?: string }> = [
    { label: "Nome completo", key: "name", placeholder: "Ana Silva", required: true, autoComplete: "name" },
    { label: "E-mail", key: "email", placeholder: "ana@email.com", required: true, autoComplete: "email", type: "email" },
    { label: "Telefone", key: "phone", placeholder: "(11) 99999-0000", autoComplete: "tel", type: "tel" },
    { label: "CPF", key: "cpf", placeholder: "000.000.000-00" },
    { label: "Data de nascimento", key: "birthDate", type: "date", autoComplete: "bday" },
    { label: "Objetivo nutricional", key: "goal", placeholder: "Ex: Perda de peso, Hipertrofia..." },
    { label: "Restrições alimentares", key: "restrictions", placeholder: "Ex: Lactose, Glúten..." },
  ];

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Pacientes</h1>
          <p className="text-gray-900 text-sm mt-0.5">{patients.length} pacientes cadastrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md hover:bg-gray-900 transition-colors text-sm"
          style={{ fontWeight: 600 }}
          type="button"
        >
          <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
          Novo Paciente
        </button>
      </header>

      <div className="relative mb-6 max-w-sm">
        <label htmlFor={searchId} className="sr-only">Buscar paciente por nome ou e-mail</label>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none"
          aria-hidden="true"
          focusable="false"
        />
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente..."
          className="w-full border border-gray-300 rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <section className="bg-white border border-gray-200 rounded-lg overflow-hidden" aria-label="Lista de pacientes">
        <table className="w-full">
          <caption className="sr-only">{filtered.length} pacientes encontrados</caption>
          <thead>
            <tr className="border-b border-gray-100">
              {["Paciente", "E-mail", "Telefone", "Objetivo", "Restrições", "Cadastro", "Pedidos", "Ações"].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs text-gray-900 uppercase tracking-wider ${i === 7 ? "sr-only" : ""}`}
                  style={{ fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-900 text-sm">
                  Nenhum paciente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <button
                      type="button"
                      onClick={() => navigate(`/nutricionista/pedidos/novo?paciente=${p.id}`)}
                      className="flex items-center gap-2.5 text-left"
                      style={{ border: "none", boxShadow: "none", background: "transparent" }}
                      aria-label={`Criar pedido para ${p.name}`}
                    >
                      <span
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="text-gray-900 text-xs" style={{ fontWeight: 600 }}>
                          {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                      </span>
                      <span className="text-black text-sm" style={{ fontWeight: 500 }}>{p.name}</span>
                    </button>
                  </th>
                  <td className="px-4 py-3 text-gray-900 text-sm">{p.email}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{p.phone}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm max-w-[140px] truncate">{p.goal}</td>
                  <td className="px-4 py-3">
                    {p.restrictions !== "Nenhuma" ? (
                      <span className="bg-gray-100 text-gray-900 text-xs px-2 py-0.5 rounded border border-gray-300">
                        {p.restrictions}
                      </span>
                    ) : (
                      <span className="text-gray-900 text-xs" aria-label="Sem restrições">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900 text-sm">
                    <time dateTime={p.createdAt}>{formatDate(p.createdAt)}</time>
                  </td>
                  <td className="px-4 py-3 text-black text-sm" style={{ fontWeight: 600 }}>
                    <span className="sr-only">Pedidos: </span>
                    {p.ordersCount}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-700" aria-hidden="true" focusable="false" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
          role="presentation"
        >
          <div
            className="bg-white rounded-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 id={dialogTitleId} style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Novo Paciente</h2>
              <button
                ref={closeRef}
                onClick={() => setShowModal(false)}
                className="text-gray-700 hover:text-black"
                type="button"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" aria-hidden="true" focusable="false" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4" noValidate>
              {error && (
                <div
                  id={errorId}
                  role="alert"
                  aria-live="assertive"
                  className="border-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700"
                  style={{ fontWeight: 600 }}
                >
                  {error}
                </div>
              )}
              {fields.map((f) => {
                const fieldId = `${uid}-${f.key}`;
                return (
                  <div key={f.key}>
                    <label htmlFor={fieldId} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                      {f.label}
                      {f.required && (
                        <>
                          {" "}
                          <span aria-hidden="true" className="text-red-600">*</span>
                          <span className="sr-only"> (obrigatório)</span>
                        </>
                      )}
                    </label>
                    <input
                      id={fieldId}
                      type={f.type || "text"}
                      value={form[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                      required={f.required}
                      autoComplete={f.autoComplete}
                      aria-required={f.required || undefined}
                    />
                  </div>
                );
              })}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-900 py-2.5 rounded-md text-sm hover:border-black transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                  aria-busy={loading}
                >
                  {loading ? "Salvando..." : "Cadastrar paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
