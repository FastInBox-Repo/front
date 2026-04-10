import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Box, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppRole, sprintStoreActions } from "../../data/sprintStore";

type Role = Extract<AppRole, "nutricionista" | "paciente" | "cozinha">;

const roleConfig: Record<Role, { label: string; redirect: string; description: string }> = {
  nutricionista: {
    label: "Nutricionista",
    redirect: "/nutricionista/dashboard",
    description: "Acesse o painel da sua clínica",
  },
  paciente: {
    label: "Paciente",
    redirect: "/paciente",
    description: "Acompanhe seus pedidos em cards",
  },
  cozinha: {
    label: "Fábrica",
    redirect: "/cozinha/dashboard",
    description: "Kanban operacional de produção",
  },
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawRole = searchParams.get("role") as Role | null;
  const defaultRole: Role = rawRole && rawRole in roleConfig ? rawRole : "nutricionista";
  const [role, setRole] = useState<Role>(defaultRole);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [nutritionistCRN, setNutritionistCRN] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const user = sprintStoreActions.login(email, password, role);
    setLoading(false);

    if (!user) {
      toast.error("Credenciais inválidas para o perfil selecionado");
      return;
    }

    toast.success(`Bem-vindo, ${roleConfig[role].label}!`);
    navigate(roleConfig[role].redirect);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }

    if (role === "nutricionista" && !clinicName) {
      toast.error("Informe o nome da clínica");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const result = sprintStoreActions.registerUser({
      role,
      name,
      email,
      password,
      clinicName,
      nutritionistCRN,
      phone,
      goal,
    });

    setLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(`${roleConfig[role].label} cadastrado com sucesso!`);
    navigate(roleConfig[role].redirect);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const user = sprintStoreActions.demoLogin(role);
      setLoading(false);
      if (!user) {
        toast.error("Não há usuário demo para esse perfil ainda");
        return;
      }
      navigate(roleConfig[role].redirect);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col p-12">
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <Box className="w-4 h-4 text-black" />
          </div>
          <span className="text-white" style={{ fontWeight: 800, letterSpacing: "-0.04em", fontSize: "1.1rem" }}>
            FastInBox
          </span>
        </div>

        <div className="my-auto">
          <p
            className="text-white mb-6"
            style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}
          >
            A plataforma que conecta nutricionistas, pacientes e cozinhas.
          </p>
          <p className="text-gray-400" style={{ lineHeight: 1.7 }}>
            Marmitas personalizadas com a sua marca. Fluxo completo do pedido à entrega.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "2.4k+", label: "Marmitas" },
            { value: "180+", label: "Nutricionistas" },
            { value: "98%", label: "Satisfação" },
          ].map((s) => (
            <div key={s.label} className="border border-gray-800 rounded-lg p-4">
              <p className="text-white" style={{ fontSize: "1.5rem", fontWeight: 800 }}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontWeight: 800, letterSpacing: "-0.04em" }}>FastInBox</span>
          </div>

          <div className="mb-8">
            <h1 className="text-black mb-1" style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === "login"
                ? "Selecione seu perfil e faça login"
                : "Cadastro rápido para iniciar a Sprint 1"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setMode("login")}
              className={`px-3 py-2 rounded-md text-sm border transition-all ${
                mode === "login" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200"
              }`}
              style={{ fontWeight: 600 }}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("register")}
              className={`px-3 py-2 rounded-md text-sm border transition-all ${
                mode === "register" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200"
              }`}
              style={{ fontWeight: 600 }}
            >
              Cadastrar
            </button>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {(Object.keys(roleConfig) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-2.5 rounded-md border text-sm text-left transition-all ${
                  role === r
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
                style={{ fontWeight: 500 }}
              >
                {roleConfig[r].label}
                <span className={`block text-xs mt-0.5 ${role === r ? "text-gray-400" : "text-gray-400"}`}
                  style={{ fontWeight: 400 }}>
                  {roleConfig[r].description}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "cozinha" ? "Fábrica Central" : "Seu nome"}
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {role === "nutricionista" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                        Clínica
                      </label>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Nome da clínica"
                        className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                        CRN (opcional)
                      </label>
                      <input
                        type="text"
                        value={nutritionistCRN}
                        onChange={(e) => setNutritionistCRN(e.target.value)}
                        placeholder="CRN-3 00000"
                        className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </>
                )}

                {role === "paciente" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-0000"
                        className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                        Objetivo nutricional (opcional)
                      </label>
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Ex: Hipertrofia, emagrecimento"
                        className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <Link to="/recuperar-senha" className="text-xs text-gray-500 hover:text-black transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
              style={{ fontWeight: 600 }}
            >
              {loading ? (mode === "login" ? "Entrando..." : "Cadastrando...") : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          {mode === "login" && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-gray-50 px-2">
                  ou acesso rápido (demo)
                </div>
              </div>

              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-md text-sm hover:border-black transition-colors disabled:opacity-50"
                style={{ fontWeight: 500 }}
              >
                {loading ? "Redirecionando..." : `Entrar como ${roleConfig[role].label} (demo)`}
              </button>
            </>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            <Link to="/" className="flex items-center justify-center gap-1 hover:text-black transition-colors">
              <ArrowLeft className="w-3 h-3" /> Voltar ao início
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
