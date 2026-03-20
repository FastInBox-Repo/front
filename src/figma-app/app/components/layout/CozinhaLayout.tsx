import { Outlet, NavLink, useNavigate } from "react-router";
import { ChefHat, List, LogOut, Box } from "lucide-react";

const navItems = [
  { to: "/cozinha/dashboard", icon: List, label: "Pedidos" },
];

export default function CozinhaLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-black flex flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Box className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white text-sm" style={{ fontWeight: 700 }}>FastInBox</p>
              <p className="text-gray-500 text-xs">Cozinha</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-gray-400" />
            <p className="text-gray-400 text-sm">Painel da Cozinha</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
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
            onClick={() => navigate("/cozinha/login")}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
