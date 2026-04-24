import { Outlet, NavLink, useNavigate } from "react-router";
import {
  Activity,
  Box,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import { sprintStoreActions } from "../../data/sprintStore";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { to: "/admin/usuarios", icon: Users, label: "Usuários" },
  { to: "/admin/auditoria", icon: Activity, label: "Auditoria" },
  { to: "/admin/diagnostico", icon: ShieldCheck, label: "Diagnóstico" },
  { to: "/admin/configuracoes", icon: Settings, label: "Configurações" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden fi-page-shell">
      <aside className="w-64 bg-black flex flex-col flex-shrink-0 fi-animate-in fi-delay-1">
        <div className="px-6 py-6 border-b border-gray-800">
          <button onClick={() => navigate("/")} className="flex items-center gap-3" aria-label="Ir para home FastInBox">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Box className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white text-sm" style={{ fontWeight: 700 }}>FastInBox</p>
              <p className="text-gray-500 text-xs">Administrador</p>
            </div>
          </button>
          <a
            href="https://fastinbox-repo.github.io/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-xs text-gray-400 hover:text-white transition-colors"
          >
            Central de ajuda
          </a>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={() => {
              sprintStoreActions.logout();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto fi-animate-in fi-delay-2">
        <Outlet />
      </main>
    </div>
  );
}
