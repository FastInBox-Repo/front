import { useId, useState } from "react";
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
    description: "Acompanhe seus pedidos",
  },
  cozinha: {
    label: "Fábrica",
    redirect: "/cozinha/dashboard",
    description: "Painel de produção",
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
  const [formError, setFormError] = useState<string | null>(null);

  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    password: `${uid}-password`,
    phone: `${uid}-phone`,
    goal: `${uid}-goal`,
    clinic: `${uid}-clinic`,
    crn: `${uid}-crn`,
    formStatus: `${uid}-form-status`,
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError("Preencha todos os campos");
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const user = await sprintStoreActions.login(email, password, role);
    setLoading(false);

    if (!user) {
      setFormError("Credenciais inválidas para o perfil selecionado");
      toast.error("Credenciais inválidas para o perfil selecionado");
      return;
    }

    toast.success(`Bem-vindo, ${roleConfig[role].label}!`);
    navigate(roleConfig[role].redirect);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name || !email || !password) {
      setFormError("Preencha nome, e-mail e senha");
      toast.error("Preencha nome, e-mail e senha");
      return;
    }

    if (role === "nutricionista" && !clinicName) {
      setFormError("Informe o nome da clínica");
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
      setFormError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(`${roleConfig[role].label} cadastrado com sucesso!`);
    navigate(roleConfig[role].redirect);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <a href="#login-form" className="sr-only sr-only-focusable">Pular para o formulário</a>

      {/* Left panel (decorative) */}
      <aside
        className="hidden lg:flex lg:w-1/2 bg-black flex-col p-12"
        aria-label="Apresentação do FastInBox"
        data-dark-surface
      >
        <div className="flex items-center gap-3.5 mb-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-white" aria-hidden="true">
            <Box className="h-[18px] w-[18px] text-black" aria-hidden="true" focusable="false" />
          </div>
          <span className="text-white leading-none" style={{ fontWeight: 800, letterSpacing: "-0.03em", fontSize: "1.1rem" }}>
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
          <p className="text-gray-100" style={{ lineHeight: 1.7 }}>
            Marmitas personalizadas com a sua marca. Fluxo completo do pedido à entrega.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-4">
          {[
            { value: "2.4k+", label: "Marmitas" },
            { value: "180+", label: "Nutricionistas" },
            { value: "98%", label: "Satisfação" },
          ].map((s) => (
            <div key={s.label} className="border border-gray-600 rounded-lg p-4 bg-white/5">
              <dt className="text-white" style={{ fontSize: "1.5rem", fontWeight: 800 }}>{s.value}</dt>
              <dd className="text-gray-100 text-xs mt-1" style={{ fontWeight: 500 }}>{s.label}</dd>
            </div>
          ))}
        </dl>
      </aside>

      {/* Right panel */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-6 py-12" tabIndex={-1}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-black" aria-hidden="true">
              <Box className="h-[18px] w-[18px] text-white" aria-hidden="true" focusable="false" />
            </div>
            <span className="leading-none" style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>FastInBox</span>
          </div>

          <header className="mb-8">
            <h1 className="text-black mb-1" style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h1>
            <p className="text-gray-800 text-sm">
              {mode === "login"
                ? "Selecione seu perfil e faça login"
                : "Cadastro rápido para começar"}
            </p>
          </header>

          <div className="grid grid-cols-2 gap-2 mb-4" role="tablist" aria-label="Modo de acesso">
            <button
              onClick={() => setMode("login")}
              className={`px-3 py-2 rounded-md text-sm border transition-all ${
                mode === "login" ? "bg-black text-white border-black" : "bg-white text-gray-900 border-gray-300"
              }`}
              style={{ fontWeight: 600 }}
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              aria-controls="login-form"
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("register")}
              className={`px-3 py-2 rounded-md text-sm border transition-all ${
                mode === "register" ? "bg-black text-white border-black" : "bg-white text-gray-900 border-gray-300"
              }`}
              style={{ fontWeight: 600 }}
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              aria-controls="login-form"
            >
              Cadastrar
            </button>
          </div>

          {/* Role selector */}
          <fieldset className="mb-6 border-0 p-0 m-0">
            <legend className="sr-only">Selecione seu perfil</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Perfil de acesso">
              {(Object.keys(roleConfig) as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-2.5 rounded-md border text-sm text-left transition-all ${
                    role === r
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-900 border-gray-300 hover:border-black"
                  }`}
                  style={{ fontWeight: 600 }}
                  type="button"
                  role="radio"
                  aria-checked={role === r}
                >
                  {roleConfig[r].label}
                  <span
                    className={`block text-xs mt-0.5 ${role === r ? "text-gray-100" : "text-gray-800"}`}
                    style={{ fontWeight: 500 }}
                  >
                    {roleConfig[r].description}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <form
            id="login-form"
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="space-y-4"
            noValidate
            aria-describedby={formError ? ids.formStatus : undefined}
          >
            {formError && (
              <div
                id={ids.formStatus}
                role="alert"
                aria-live="assertive"
                className="border-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700"
                style={{ fontWeight: 600 }}
              >
                {formError}
              </div>
            )}

            {mode === "register" && (
              <>
                <div>
                  <label htmlFor={ids.name} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                    Nome <span aria-hidden="true" className="text-red-600">*</span>
                    <span className="sr-only"> (obrigatório)</span>
                  </label>
                  <input
                    id={ids.name}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "cozinha" ? "Fábrica Central" : "Seu nome"}
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                    required
                    autoComplete="name"
                    aria-required="true"
                  />
                </div>

                {role === "nutricionista" && (
                  <>
                    <div>
                      <label htmlFor={ids.clinic} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                        Clínica <span aria-hidden="true" className="text-red-600">*</span>
                        <span className="sr-only"> (obrigatório)</span>
                      </label>
                      <input
                        id={ids.clinic}
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Nome da clínica"
                        className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                        autoComplete="organization"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor={ids.crn} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                        CRN <span className="text-gray-700">(opcional)</span>
                      </label>
                      <input
                        id={ids.crn}
                        type="text"
                        value={nutritionistCRN}
                        onChange={(e) => setNutritionistCRN(e.target.value)}
                        placeholder="CRN-3 00000"
                        className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </>
                )}

                {role === "paciente" && (
                  <>
                    <div>
                      <label htmlFor={ids.phone} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                        Telefone
                      </label>
                      <input
                        id={ids.phone}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-0000"
                        className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                        autoComplete="tel"
                        inputMode="tel"
                      />
                    </div>
                    <div>
                      <label htmlFor={ids.goal} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                        Objetivo nutricional <span className="text-gray-700">(opcional)</span>
                      </label>
                      <input
                        id={ids.goal}
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Ex: Hipertrofia, emagrecimento"
                        className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label htmlFor={ids.email} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                E-mail <span aria-hidden="true" className="text-red-600">*</span>
                <span className="sr-only"> (obrigatório)</span>
              </label>
              <input
                id={ids.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
                required
                autoComplete="email"
                inputMode="email"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor={ids.password} className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 600 }}>
                Senha <span aria-hidden="true" className="text-red-600">*</span>
                <span className="sr-only"> (obrigatório)</span>
              </label>
              <div className="relative">
                <input
                  id={ids.password}
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors pr-10"
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800 hover:text-black"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPass}
                  style={{ border: "none", boxShadow: "none", background: "transparent" }}
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" focusable="false" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" focusable="false" />
                  )}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <Link
                  to="/recuperar-senha"
                  className="text-xs text-gray-800 hover:text-black transition-colors underline underline-offset-2"
                  style={{ fontWeight: 500 }}
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
              style={{ fontWeight: 600 }}
              aria-busy={loading}
            >
              {loading ? (mode === "login" ? "Entrando..." : "Cadastrando...") : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-800">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1 hover:text-black transition-colors underline underline-offset-2"
              style={{ fontWeight: 500 }}
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" focusable="false" /> Voltar ao início
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
