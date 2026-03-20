import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, X, ChevronRight } from "lucide-react";
import { mockPatients, Patient, formatDate } from "../../data/mockData";
import { toast } from "sonner";

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
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_PATIENT);
  const [patients, setPatients] = useState(mockPatients);
  const [loading, setLoading] = useState(false);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Preencha nome e e-mail");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    const newPatient: Patient = {
      ...form,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      ordersCount: 0,
    };
    setPatients((prev) => [newPatient, ...prev]);
    setShowModal(false);
    setForm(EMPTY_PATIENT);
    toast.success("Paciente cadastrado com sucesso!");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Pacientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{patients.length} pacientes cadastrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md hover:bg-gray-900 transition-colors text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Paciente", "E-mail", "Telefone", "Objetivo", "Restrições", "Cadastro", "Pedidos", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wider"
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
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                  Nenhum paciente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/nutricionista/pedidos/novo?paciente=${p.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 text-xs" style={{ fontWeight: 600 }}>
                          {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <span className="text-black text-sm" style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{p.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{p.phone}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm max-w-[140px] truncate">{p.goal}</td>
                  <td className="px-4 py-3">
                    {p.restrictions !== "Nenhuma" ? (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200">
                        {p.restrictions}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-black text-sm" style={{ fontWeight: 600 }}>
                    {p.ordersCount}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Novo Paciente</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {[
                { label: "Nome completo *", key: "name", placeholder: "Ana Silva" },
                { label: "E-mail *", key: "email", placeholder: "ana@email.com" },
                { label: "Telefone", key: "phone", placeholder: "(11) 99999-0000" },
                { label: "CPF", key: "cpf", placeholder: "000.000.000-00" },
                { label: "Data de nascimento", key: "birthDate", type: "date" },
                { label: "Objetivo nutricional", key: "goal", placeholder: "Ex: Perda de peso, Hipertrofia..." },
                { label: "Restrições alimentares", key: "restrictions", placeholder: "Ex: Lactose, Glúten..." },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type || "text"}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-md text-sm hover:border-black transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                  style={{ fontWeight: 600 }}
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
