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
import SkipLink from "../a11y/SkipLink";

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

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja encerrar a sessão?")) {
      sprintStoreActions.logout();
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden fi-page-shell">
      <SkipLink />
      <aside
        className="w-64 bg-black flex flex-col shrink-0 fi-animate-in fi-delay-1"
        aria-label="Navegação administrativa"
        data-dark-surface
      >
        <div className="px-6 py-6 border-b border-gray-700">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
            aria-label="Ir para a página inicial do FastInBox"
            type="button"
          >
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Box className="w-4 h-4 text-black" aria-hidden="true" focusable="false" />
            </div>
            <div>
              <p className="text-white text-sm" style={{ fontWeight: 700 }}>FastInBox</p>
              <p className="text-gray-100 text-xs" style={{ fontWeight: 500 }}>Administrador</p>
            </div>
          </button>
          <a
            href="https://fastinbox-repo.github.io/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-xs text-gray-100 hover:text-white transition-colors"
            style={{ fontWeight: 500 }}
            aria-label="Central de ajuda (abre em nova aba)"
          >
            Central de ajuda
            <span className="sr-only"> (abre em nova janela)</span>
          </a>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Menu administrativo principal">
          <ul className="space-y-1 list-none p-0 m-0">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-white text-black"
                        : "text-gray-100 hover:text-white hover:bg-gray-800"
                    }`
                  }
                  style={{ fontWeight: 500 }}
                  end
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4" aria-hidden="true" focusable="false" />
                      <span>{label}</span>
                      {isActive && <span className="sr-only"> (página atual)</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-100 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full"
            style={{ fontWeight: 500 }}
            type="button"
            aria-label="Sair da conta"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" focusable="false" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main
        id="main-content"
        className="flex-1 overflow-auto fi-animate-in fi-delay-2"
        tabIndex={-1}
        aria-label="Conteúdo administrativo"
      >
        <Outlet />
      </main>
    </div>
  );
}
