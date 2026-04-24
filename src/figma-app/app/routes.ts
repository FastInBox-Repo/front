import { createBrowserRouter, redirect } from "react-router";

import NutricionistaLayout from "./components/layout/NutricionistaLayout";
import CozinhaLayout from "./components/layout/CozinhaLayout";
import AdminLayout from "./components/layout/AdminLayout";

import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";

import DashboardPage from "./pages/nutricionista/DashboardPage";
import PacientesPage from "./pages/nutricionista/PacientesPage";
import NovoPedidoPage from "./pages/nutricionista/NovoPedidoPage";
import PedidoResumoPage from "./pages/nutricionista/PedidoResumoPage";
import ConfiguracoesPage from "./pages/nutricionista/ConfiguracoesPage";

import LandingPage from "./pages/paciente/LandingPage";
import PedidoViewPage from "./pages/paciente/PedidoViewPage";
import PagamentoPage from "./pages/paciente/PagamentoPage";
import SucessoPage from "./pages/paciente/SucessoPage";
import StatusPage from "./pages/paciente/StatusPage";

import CozinhaLoginPage from "./pages/cozinha/CozinhaLoginPage";
import CozinhaDashboardPage from "./pages/cozinha/CozinhaDashboardPage";
import CozinhaPedidoPage from "./pages/cozinha/CozinhaPedidoPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage";
import AdminPedidosPage from "./pages/admin/AdminPedidosPage";
import AdminConfiguracoesPage from "./pages/admin/AdminConfiguracoesPage";
import AdminAuditoriaPage from "./pages/admin/AdminAuditoriaPage";
import AdminDiagnosticoPage from "./pages/admin/AdminDiagnosticoPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/login", Component: LoginPage },
  { path: "/recuperar-senha", Component: ForgotPasswordPage },

  // Nutricionista area
  {
    path: "/nutricionista",
    Component: NutricionistaLayout,
    children: [
      { index: true, loader: () => redirect("/nutricionista/dashboard") },
      { path: "dashboard", Component: DashboardPage },
      { path: "pacientes", Component: PacientesPage },
      { path: "pedidos/novo", Component: NovoPedidoPage },
      { path: "pedidos/:id", Component: PedidoResumoPage },
      { path: "configuracoes", Component: ConfiguracoesPage },
    ],
  },

  // Paciente area
  { path: "/paciente", Component: LandingPage },
  { path: "/paciente/pedido/:code", Component: PedidoViewPage },
  { path: "/paciente/pedido/:code/pagamento", Component: PagamentoPage },
  { path: "/paciente/pedido/:code/sucesso", Component: SucessoPage },
  { path: "/paciente/pedido/:code/status", Component: StatusPage },

  // Cozinha area
  { path: "/cozinha/login", Component: CozinhaLoginPage },
  {
    path: "/cozinha",
    Component: CozinhaLayout,
    children: [
      { index: true, loader: () => redirect("/cozinha/dashboard") },
      { path: "dashboard", Component: CozinhaDashboardPage },
      { path: "pedido/:id", Component: CozinhaPedidoPage },
    ],
  },

  // Admin area
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, loader: () => redirect("/admin/dashboard") },
      { path: "dashboard", Component: AdminDashboardPage },
      { path: "usuarios", Component: AdminUsuariosPage },
      { path: "pedidos", Component: AdminPedidosPage },
      { path: "auditoria", Component: AdminAuditoriaPage },
      { path: "diagnostico", Component: AdminDiagnosticoPage },
      { path: "configuracoes", Component: AdminConfiguracoesPage },
    ],
  },
]);
