import { Outlet, NavLink, useNavigate } from "react-router";
import { ChefHat, List, LogOut, Box } from "lucide-react";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";

const navItems = [
  { to: "/cozinha/dashboard", icon: List, label: "Pedidos" },
];

export default function CozinhaLayout() {
  const navigate = useNavigate();
  const { currentUser } = useSprintSession();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden fi-page-shell">
      <aside className="w-64 bg-black flex flex-col flex-shrink-0 fi-animate-in fi-delay-1">
        <div className="px-6 py-6 border-b border-gray-700">
          <button onClick={() => navigate("/")} className="flex items-center gap-3" aria-label="Ir para home FastInBox">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Box className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white text-sm" style={{ fontWeight: 700 }}>FastInBox</p>
              <p className="text-gray-200 text-xs" style={{ fontWeight: 500 }}>Fábrica</p>
            </div>
          </button>
          <a
            href="https://fastinbox-repo.github.io/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-xs text-gray-200 hover:text-white transition-colors"
            style={{ fontWeight: 500 }}
          >
            Central de ajuda
          </a>
        </div>

        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-gray-200" />
            <p className="text-gray-100 text-sm" style={{ fontWeight: 500 }}>{currentUser?.name || "Painel da Fábrica"}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? "bg-white text-black" : "text-gray-200 hover:text-white hover:bg-gray-800"
                }`
              }
              style={{ fontWeight: 500 }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={() => {
              sprintStoreActions.logout();
              navigate("/login?role=cozinha");
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full"
            style={{ fontWeight: 500 }}
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
