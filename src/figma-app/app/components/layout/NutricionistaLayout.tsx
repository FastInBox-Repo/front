import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronDown,
  Box,
} from "lucide-react";
import { useState } from "react";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";

const navItems = [
  { to: "/nutricionista/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/nutricionista/pacientes", icon: Users, label: "Pacientes" },
  { to: "/nutricionista/pedidos/novo", icon: ShoppingBag, label: "Novo Pedido" },
  { to: "/nutricionista/configuracoes", icon: Settings, label: "Configurações" },
];

export default function NutricionistaLayout() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const { clinic, currentUser } = useSprintSession();

  const nutritionistName = currentUser?.name || clinic.nutritionistName;
  const nutritionistCRN = currentUser?.nutritionistCRN || clinic.nutritionistCRN;
  const clinicName = currentUser?.clinicName || clinic.name;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <Box className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white text-sm" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                FastInBox
              </p>
              <p className="text-gray-500 text-xs">Nutricionista</p>
            </div>
          </div>
        </div>

        {/* Clinic info */}
        <div className="px-6 py-4 border-b border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Clínica</p>
          <p className="text-white text-sm" style={{ fontWeight: 500 }}>
            {clinicName}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs" style={{ fontWeight: 600 }}>
                {nutritionistName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs truncate" style={{ fontWeight: 500 }}>
                {nutritionistName}
              </p>
              <p className="text-gray-500 text-xs">{nutritionistCRN}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <button
            onClick={() => {
              sprintStoreActions.logout();
              navigate("/login?role=nutricionista");
            }}
            className="mt-1 flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
