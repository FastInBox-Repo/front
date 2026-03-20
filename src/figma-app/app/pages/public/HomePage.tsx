import { useNavigate } from "react-router";
import { Box, ArrowRight, CheckCircle, Zap, ShieldCheck, Users, ChefHat, BarChart3 } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Personalização total",
    desc: "Cada marmita é montada individualmente com base no plano nutricional do paciente.",
  },
  {
    icon: ShieldCheck,
    title: "White label nativo",
    desc: "Sua clínica em destaque. A FastInBox opera nos bastidores, invisível ao paciente.",
  },
  {
    icon: Zap,
    title: "Fluxo automatizado",
    desc: "Do pedido ao pagamento e à cozinha: tudo em um único fluxo digital, sem papelada.",
  },
  {
    icon: ChefHat,
    title: "Cozinha integrada",
    desc: "O painel da cozinha recebe os pedidos pagos em tempo real, com todos os detalhes.",
  },
  {
    icon: BarChart3,
    title: "Métricas operacionais",
    desc: "Acompanhe pedidos, faturamento e status de entregas em um único painel admin.",
  },
  {
    icon: CheckCircle,
    title: "Experiência premium",
    desc: "Interface limpa, pagamento embutido e acompanhamento de pedido para o paciente.",
  },
];

const steps = [
  { num: "01", title: "Nutricionista cria pedido", desc: "Monta marmitas personalizadas com ingredientes, embalagem e observações nutricionais." },
  { num: "02", title: "Sistema gera código único", desc: "Um link exclusivo é enviado ao paciente para revisão e confirmação do pedido." },
  { num: "03", title: "Paciente confirma e paga", desc: "O paciente revisa, edita se permitido, confirma e realiza o pagamento online." },
  { num: "04", title: "Cozinha produz e entrega", desc: "Após pagamento, o pedido aparece no painel da cozinha com todos os detalhes." },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <Box className="w-4 h-4 text-white" />
            </div>
            <span className="text-black" style={{ fontWeight: 800, letterSpacing: "-0.04em", fontSize: "1.1rem" }}>
              FastInBox
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-gray-500 hover:text-black transition-colors text-sm">
              Como funciona
            </a>
            <a href="#beneficios" className="text-gray-500 hover:text-black transition-colors text-sm">
              Benefícios
            </a>
            <button
              onClick={() => navigate("/login")}
              className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900 transition-colors"
              style={{ fontWeight: 500 }}
            >
              Entrar
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 mb-8">
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <span className="text-xs text-gray-600" style={{ fontWeight: 500 }}>
              Plataforma white label para nutricionistas
            </span>
          </div>
          <h1
            className="text-black mb-6"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Marmitas personalizadas.
            <br />
            <span className="text-gray-400">Sua marca.</span>
            <br />
            Fluxo completo.
          </h1>
          <p className="text-gray-500 mb-10 max-w-xl" style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
            A FastInBox é a infraestrutura que conecta nutricionistas, pacientes e cozinhas em um único
            fluxo digital — do pedido personalizado até a entrega.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/login?role=nutricionista")}
              className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-md hover:bg-gray-900 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Sou Nutricionista
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/paciente")}
              className="flex items-center justify-center gap-2 bg-white text-black border border-gray-300 px-6 py-3.5 rounded-md hover:border-black transition-colors"
              style={{ fontWeight: 600 }}
            >
              Sou Paciente
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2.400+", label: "Marmitas entregues" },
              { value: "180+", label: "Nutricionistas ativos" },
              { value: "98%", label: "Satisfação dos pacientes" },
              { value: "100%", label: "White label" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-black mb-1"
                  style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em" }}
                >
                  {s.value}
                </p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-14">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
            Fluxo
          </p>
          <h2
            className="text-black"
            style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            Como funciona
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="border border-gray-200 rounded-lg p-6 bg-white hover:border-black transition-colors"
            >
              <p
                className="text-gray-200 mb-4"
                style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}
              >
                {step.num}
              </p>
              <h3 className="text-black mb-2" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm" style={{ lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="bg-black">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-14">
            <p className="text-gray-600 text-sm uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
              Benefícios
            </p>
            <h2
              className="text-white"
              style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}
            >
              Tudo que você precisa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                <b.icon className="w-5 h-5 text-white mb-4" />
                <h3 className="text-white mb-2" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                  {b.title}
                </h3>
                <p className="text-gray-400 text-sm" style={{ lineHeight: 1.6 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="border border-gray-200 rounded-xl p-12 text-center">
          <h2
            className="text-black mb-4"
            style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            Pronto para começar?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Configure sua clínica em minutos e comece a vender marmitas personalizadas com sua própria marca.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login?role=nutricionista")}
              className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Começar agora <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/cozinha/login")}
              className="bg-white text-black border border-gray-300 px-6 py-3 rounded-md hover:border-black transition-colors text-sm"
              style={{ fontWeight: 500 }}
            >
              Acesso Cozinha
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-white text-black border border-gray-300 px-6 py-3 rounded-md hover:border-black transition-colors text-sm"
              style={{ fontWeight: 500 }}
            >
              Acesso Admin
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <Box className="w-3 h-3 text-white" />
            </div>
            <span className="text-black text-sm" style={{ fontWeight: 700 }}>FastInBox</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 FastInBox. Infraestrutura white label para nutricionistas.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-black text-sm transition-colors">Termos</a>
            <a href="#" className="text-gray-400 hover:text-black text-sm transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
