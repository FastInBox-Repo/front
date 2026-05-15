import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Box,
} from "lucide-react";
import { useState } from "react";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";
import SkipLink from "../a11y/SkipLink";

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

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja encerrar a sessão?")) {
      sprintStoreActions.logout();
      navigate("/login?role=nutricionista");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden fi-page-shell">
      <SkipLink />
      <aside
        className="w-64 bg-black flex flex-col shrink-0 fi-animate-in fi-delay-1"
        aria-label="Navegação da nutricionista"
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
              <p className="text-white text-sm" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                FastInBox
              </p>
              <p className="text-gray-100 text-xs" style={{ fontWeight: 500 }}>Nutricionista</p>
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

        <div className="px-6 py-4 border-b border-gray-700">
          <p className="text-gray-100 text-xs uppercase tracking-wider mb-1" style={{ fontWeight: 600 }} id="clinic-label">
            Clínica
          </p>
          <p className="text-white text-sm" style={{ fontWeight: 600 }} aria-labelledby="clinic-label">
            {clinicName}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Menu da nutricionista">
          <ul className="list-none p-0 m-0 space-y-1">
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
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" focusable="false" />
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
            type="button"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition-colors text-left"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-controls="profile-info"
            aria-label={`Perfil de ${nutritionistName}, CRN ${nutritionistCRN}`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-white text-xs" style={{ fontWeight: 700 }}>
                {nutritionistName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs truncate" style={{ fontWeight: 600 }}>
                {nutritionistName}
              </p>
              <p className="text-gray-100 text-xs" style={{ fontWeight: 500 }}>{nutritionistCRN}</p>
            </div>
            {profileOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-100" aria-hidden="true" focusable="false" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-100" aria-hidden="true" focusable="false" />
            )}
          </button>
          {profileOpen && (
            <div id="profile-info" className="px-3 py-2 text-xs text-gray-100" role="region" aria-label="Detalhes do perfil">
              <p style={{ fontWeight: 500 }}>{nutritionistName}</p>
              <p>{nutritionistCRN}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 px-3 py-2 rounded-md text-gray-100 hover:text-white hover:bg-gray-800 transition-colors text-sm w-full"
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
        aria-label="Conteúdo da nutricionista"
      >
        <Outlet />
      </main>
    </div>
  );
}
