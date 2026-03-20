import { useState } from "react";
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
  nutricionista: "bg-gray-100 text-gray-700 border-gray-200",
  cozinha: "bg-gray-800 text-white border-gray-800",
  admin: "bg-black text-white border-black",
};

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Usuários</h1>
          <p className="text-gray-500 text-sm mt-0.5">{mockUsers.length} usuários no sistema</p>
        </div>
        <button
          onClick={() => toast.success("Em breve: formulário de cadastro de usuário")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Novo usuário
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuário..."
          className="w-full border border-gray-200 rounded-md pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["Nome", "E-mail", "Perfil", "Clínica", "Desde", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-600" style={{ fontWeight: 600 }}>
                        {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                    <span className="text-black text-sm" style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize ${roleBadge[u.role]}`} style={{ fontWeight: 500 }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">{u.clinic}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {u.since.split("-").reverse().join("/")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      u.status === "ativo" ? "bg-gray-100 text-gray-700" : "bg-gray-50 text-gray-400"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-gray-300 hover:text-black transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
