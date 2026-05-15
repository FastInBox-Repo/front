import { useId, useState } from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const mockUsers = [
  { id: "u1", name: "Dra. Ana Carvalho", email: "ana@nutritionvida.com.br", role: "nutricionista", clinic: "Clínica Nutrition Vida", status: "ativo", since: "2025-10-01" },
  { id: "u2", name: "Dr. Carlos Lima", email: "carlos@nutrivida.com.br", role: "nutricionista", clinic: "NutriVida", status: "ativo", since: "2025-11-15" },
  { id: "u3", name: "Cozinha Principal", email: "cozinha@fastinbox.com.br", role: "cozinha", clinic: "—", status: "ativo", since: "2025-10-01" },
  { id: "u4", name: "Admin Sistema", email: "admin@fastinbox.com.br", role: "admin", clinic: "—", status: "ativo", since: "2025-10-01" },
  { id: "u5", name: "Dra. Juliana Reis", email: "juliana@nutri360.com.br", role: "nutricionista", clinic: "Nutri 360", status: "inativo", since: "2026-01-10" },
];

const roleBadge: Record<string, string> = {
  nutricionista: "bg-gray-100 text-gray-900 border-gray-300",
  cozinha: "bg-gray-800 text-white border-gray-800",
  admin: "bg-black text-white border-black",
};

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState("");
  const searchId = useId();
  const tableId = `${searchId}-table`;

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Usuários</h1>
          <p className="text-gray-900 text-sm mt-0.5">{mockUsers.length} usuários no sistema</p>
        </div>
        <button
          onClick={() => toast.success("Em breve: formulário de cadastro de usuário")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
          style={{ fontWeight: 600 }}
          type="button"
        >
          <Plus className="w-4 h-4" aria-hidden="true" focusable="false" /> Novo usuário
        </button>
      </header>

      <div className="relative mb-6 max-w-sm">
        <label htmlFor={searchId} className="sr-only">Buscar usuário por nome ou e-mail</label>
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
          placeholder="Buscar usuário..."
          className="w-full border border-gray-300 rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
          aria-controls={tableId}
        />
      </div>

      <section
        id={tableId}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        aria-label="Lista de usuários"
        aria-live="polite"
      >
        <table className="w-full">
          <caption className="sr-only">{filtered.length} usuários encontrados</caption>
          <thead>
            <tr className="border-b border-gray-100">
              {["Nome", "E-mail", "Perfil", "Clínica", "Desde", "Status", "Ações"].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs text-gray-900 uppercase tracking-wider ${i === 6 ? "sr-only" : ""}`}
                  style={{ fontWeight: 600 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-xs text-gray-900" style={{ fontWeight: 600 }}>
                        {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </span>
                    <span className="text-black text-sm" style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </th>
                <td className="px-4 py-3 text-gray-900 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize ${roleBadge[u.role]}`} style={{ fontWeight: 500 }}>
                    <span className="sr-only">Perfil: </span>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900 text-sm">{u.clinic}</td>
                <td className="px-4 py-3 text-gray-900 text-sm">
                  <time dateTime={u.since}>{u.since.split("-").reverse().join("/")}</time>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      u.status === "ativo" ? "bg-gray-100 text-gray-900" : "bg-gray-50 text-gray-900"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    <span className="sr-only">Status: </span>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-gray-700 hover:text-black transition-colors"
                    type="button"
                    aria-label={`Mais ações para ${u.name}`}
                  >
                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" focusable="false" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
