import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  ArrowRight,
  CheckCircle,
  Zap,
  ShieldCheck,
  Users,
  ChefHat,
  BarChart3,
  Search,
  Quote,
  Plus,
  Minus,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useSprintSession } from "../../data/sprintStore";

const benefits = [
  {
    icon: Users,
    title: "Personalização de verdade",
    desc: "Cada pedido respeita o plano alimentar, as preferências e a rotina de cada paciente.",
  },
  {
    icon: ShieldCheck,
    title: "Sua marca em destaque",
    desc: "A experiência valoriza a identidade da sua clínica em cada etapa do pedido.",
  },
  {
    icon: Zap,
    title: "Pedido simples e rápido",
    desc: "O paciente recebe, revisa e conclui o pedido com poucos cliques, sem atrito.",
  },
  {
    icon: ChefHat,
    title: "Produção organizada",
    desc: "Cada pedido chega estruturado para preparo e entrega com mais clareza no dia a dia.",
  },
  {
    icon: BarChart3,
    title: "Acompanhamento claro",
    desc: "Tenha visibilidade do andamento dos pedidos e da experiência do paciente em um só lugar.",
  },
  {
    icon: CheckCircle,
    title: "Experiência premium",
    desc: "Uma jornada elegante, confiável e fácil de usar para quem compra e para quem acompanha.",
  },
];

const steps = [
  { num: "01", title: "Nutricionista monta o pedido", desc: "Define as combinações, orientações e ajustes de cada marmita com rapidez." },
  { num: "02", title: "Paciente recebe o link", desc: "Tudo chega de forma clara para revisão, escolha e confirmação do pedido." },
  { num: "03", title: "Confirma e paga online", desc: "O pagamento acontece no mesmo fluxo, sem trocas manuais ou etapas confusas." },
  { num: "04", title: "Produção e entrega acontecem", desc: "O pedido segue para preparo e acompanhamento com mais organização até a entrega." },
];

const testimonials = [
  {
    name: "Dra. Ana Carvalho",
    role: "Nutricionista · Clínica Nutrition Vida",
    quote:
      "Minha clínica ganhou tempo e profissionalismo. Os pacientes adoram ter o cardápio personalizado com a minha marca em um só lugar.",
  },
  {
    name: "Dr. Carlos Lima",
    role: "Nutricionista · NutriVida",
    quote:
      "Reduzi o atrito de cobrança e de confirmação. Agora cada pedido nasce organizado, com preço claro e entrega previsível.",
  },
  {
    name: "Dra. Juliana Reis",
    role: "Nutricionista · Nutri 360",
    quote:
      "A experiência do paciente ficou impecável. Mais confiança na marca da minha clínica e menos retrabalho no dia a dia.",
  },
];

const faqs = [
  {
    question: "Preciso instalar algo ou contratar equipe técnica?",
    answer:
      "Não. O FastInBox funciona totalmente online, direto no navegador. Sua clínica começa a operar em poucos minutos, sem instalação.",
  },
  {
    question: "Como a identidade da minha clínica aparece na plataforma?",
    answer:
      "Você personaliza logo, nome e cor principal. A partir daí, o paciente vê a experiência do pedido com a marca da sua clínica em destaque.",
  },
  {
    question: "Quais formas de pagamento o paciente pode usar?",
    answer:
      "Oferecemos PIX, cartão de crédito e boleto bancário. Tudo processado com segurança diretamente no fluxo do pedido.",
  },
  {
    question: "Consigo acompanhar o status de cada pedido?",
    answer:
      "Sim. Nutricionista, paciente e produção acompanham cada etapa em tempo real — do pedido criado até a entrega confirmada.",
  },
  {
    question: "A plataforma atende clínicas de qualquer tamanho?",
    answer:
      "Sim. Do consultório individual às clínicas com várias unidades, o FastInBox escala junto com a sua operação, mantendo tudo organizado.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { orders } = useSprintSession();
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleTrackOrder = (event: FormEvent) => {
    event.preventDefault();
    const normalizedCode = trackingCode.trim().toUpperCase();
    if (!normalizedCode) {
      setTrackingError("Informe um código para consultar.");
      return;
    }

    const order = orders.find((item) => item.code.toUpperCase() === normalizedCode);
    if (!order) {
      setTrackingError("Código não encontrado. Verifique e tente novamente.");
      return;
    }

    setTrackingError("");
    navigate(`/paciente/pedido/${order.code}/status`);
  };

  return (
    <div className="min-h-screen bg-white fi-page-shell">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50 fi-animate-in fi-delay-1">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3.5"
            aria-label="Ir para a página inicial FastInBox"
            style={{ border: "none", boxShadow: "none", background: "transparent", padding: 0 }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center bg-black"
              style={{ borderRadius: "6px" }}
            >
              <Box className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-black leading-none" style={{ fontWeight: 800, letterSpacing: "-0.03em", fontSize: "1.1rem" }}>
              FastInBox
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-gray-500 hover:text-black transition-colors text-sm">
              Como funciona
            </a>
            <a href="#beneficios" className="text-gray-500 hover:text-black transition-colors text-sm">
              Benefícios
            </a>
            <a href="#faq" className="text-gray-500 hover:text-black transition-colors text-sm">
              Perguntas frequentes
            </a>
            <a href="#contato" className="text-gray-500 hover:text-black transition-colors text-sm">
              Contato
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
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-24 fi-animate-in fi-delay-2">
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
            <span className="text-gray-500">Sua marca em primeiro plano.</span>
            <br />
            Fluxo completo.
          </h1>
          <p className="text-gray-500 mb-10 max-w-xl" style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
            Sua clínica vende marmitas personalizadas com uma experiência mais elegante, organizada e
            simples para o paciente, do pedido à entrega.
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
      <section className="border-y border-gray-100 bg-gray-50 fi-animate-in fi-delay-3">
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

      {/* Quick access */}
      <section className="max-w-7xl mx-auto px-6 py-20 fi-animate-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-gray-200 rounded-xl p-6">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2" style={{ fontWeight: 700 }}>
              Para quem é
            </p>
            <h2 className="text-black mb-2" style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Uma operação mais simples para clínica, paciente e produção
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              O FastInBox organiza a jornada inteira em um fluxo claro, com menos ruído operacional e mais previsibilidade.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 fi-stagger">
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-left">
                <p className="text-black text-sm" style={{ fontWeight: 700 }}>Nutricionistas e clínicas</p>
                <p className="text-gray-500 text-xs">Criam pedidos com agilidade, acompanham confirmações e mantêm sua própria marca em destaque.</p>
              </div>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-left">
                <p className="text-black text-sm" style={{ fontWeight: 700 }}>Pacientes</p>
                <p className="text-gray-500 text-xs">Recebem um fluxo claro para revisar, pagar e acompanhar cada etapa do pedido.</p>
              </div>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-left">
                <p className="text-black text-sm" style={{ fontWeight: 700 }}>Produção</p>
                <p className="text-gray-500 text-xs">Trabalha com pedidos já validados, o que reduz ruído e melhora a previsibilidade da operação.</p>
              </div>
              <div className="border border-gray-200 rounded-lg px-4 py-3 text-left">
                <p className="text-black text-sm" style={{ fontWeight: 700 }}>Acompanhamento</p>
                <p className="text-gray-500 text-xs">Todos enxergam o andamento do pedido com mais clareza, do início até a entrega.</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2" style={{ fontWeight: 700 }}>
              Busca rápida
            </p>
            <h3 className="text-black mb-2" style={{ fontSize: "1.15rem", fontWeight: 700 }}>
              Rastrear pedido por código
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Informe o código do pedido e abra direto a timeline do paciente.
            </p>
            <form onSubmit={handleTrackOrder} className="space-y-3">
              <input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Ex: FIB-2026-001"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-md px-3 py-2.5 text-sm hover:bg-gray-900 transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Search className="w-4 h-4" /> Abrir status
              </button>
            </form>
            {trackingError ? <p className="text-xs text-red-600 mt-3">{trackingError}</p> : null}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-6 py-24 fi-animate-in">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fi-stagger">
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
      <section id="beneficios" className="bg-black fi-animate-in">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-14">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
              Benefícios
            </p>
            <h2
              className="text-white"
              style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}
            >
              Tudo que você precisa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fi-stagger">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/25"
                style={{ borderColor: "rgba(255,255,255,0.18)" }}
              >
                <b.icon className="w-5 h-5 text-white mb-4" />
                <h3 className="text-white mb-2" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                  {b.title}
                </h3>
                <p className="text-sm" style={{ lineHeight: 1.7, color: "rgba(255,255,255,0.82)" }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="max-w-7xl mx-auto px-6 py-24 fi-animate-in">
        <div className="mb-14">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
            Depoimentos
          </p>
          <h2
            className="text-black"
            style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            Quem usa, recomenda
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl" style={{ lineHeight: 1.7 }}>
            Nutricionistas e clínicas que organizaram a operação e ganharam tempo com o FastInBox.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fi-stagger">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="border border-gray-200 rounded-xl p-6 bg-white hover:border-black transition-colors"
            >
              <Quote className="w-5 h-5 text-gray-300 mb-4" />
              <p className="text-gray-700 text-sm mb-6" style={{ lineHeight: 1.7 }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs" style={{ fontWeight: 700 }}>
                    {t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-black text-sm" style={{ fontWeight: 700 }}>{t.name}</p>
                  <p className="text-gray-500 text-xs truncate">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 border-y border-gray-100 fi-animate-in">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="mb-14 text-center">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
              Perguntas frequentes
            </p>
            <h2
              className="text-black"
              style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}
            >
              O que você precisa saber
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto" style={{ lineHeight: 1.7 }}>
              Respostas diretas para as dúvidas mais comuns sobre a plataforma.
            </p>
          </div>
          <div className="space-y-3 fi-stagger">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <article
                  key={faq.question}
                  className={`border rounded-xl bg-white transition-colors ${isOpen ? "border-black" : "border-gray-200"}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                    aria-expanded={isOpen}
                  >
                    <span className="text-black text-sm" style={{ fontWeight: 600 }}>
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-600 text-sm" style={{ lineHeight: 1.7 }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contato" className="max-w-7xl mx-auto px-6 py-24 fi-animate-in">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-3" style={{ fontWeight: 600 }}>
              Fale com a gente
            </p>
            <h2
              className="text-black mb-4"
              style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}
            >
              Pronto para atender melhor seus pacientes?
            </h2>
            <p className="text-gray-500" style={{ lineHeight: 1.7 }}>
              Nossa equipe ajuda sua clínica a iniciar a operação e tirar qualquer dúvida sobre personalização,
              pagamentos, produção e entrega.
            </p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="mailto:contato@fastinbox.com.br"
              className="border border-gray-200 rounded-xl p-6 bg-white hover:border-black transition-colors block"
            >
              <Mail className="w-5 h-5 text-black mb-4" />
              <p className="text-black text-sm mb-1" style={{ fontWeight: 700 }}>E-mail</p>
              <p className="text-gray-500 text-sm">contato@fastinbox.com.br</p>
              <p className="text-gray-400 text-xs mt-3">Respondemos em até 1 dia útil.</p>
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 rounded-xl p-6 bg-white hover:border-black transition-colors block"
            >
              <MessageCircle className="w-5 h-5 text-black mb-4" />
              <p className="text-black text-sm mb-1" style={{ fontWeight: 700 }}>WhatsApp</p>
              <p className="text-gray-500 text-sm">Atendimento comercial</p>
              <p className="text-gray-400 text-xs mt-3">Seg a Sex · 9h às 18h.</p>
            </a>
            <button
              onClick={() => navigate("/login?role=nutricionista")}
              className="border border-black rounded-xl p-6 bg-black text-left hover:bg-gray-900 transition-colors md:col-span-2"
            >
              <ArrowRight className="w-5 h-5 text-white mb-4" />
              <p className="text-white text-sm mb-1" style={{ fontWeight: 700 }}>Criar conta agora</p>
              <p className="text-gray-300 text-sm">Comece a usar a plataforma em minutos, sem instalação.</p>
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24 fi-animate-in">
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
              onClick={() => navigate("/paciente")}
              className="bg-white text-black border border-gray-300 px-6 py-3 rounded-md hover:border-black transition-colors text-sm"
              style={{ fontWeight: 500 }}
            >
              Ver experiência do paciente
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 fi-animate-in">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
            aria-label="Voltar para o topo"
            style={{ border: "none", boxShadow: "none", background: "transparent", padding: 0 }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center bg-black"
              style={{ borderRadius: "6px" }}
            >
              <Box className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-black text-sm leading-none" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>FastInBox</span>
          </button>
          <p className="text-gray-400 text-sm">
            © 2026 FastInBox. Marmitas personalizadas com a marca da sua clínica.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://fastinbox-repo.github.io/docs/documents/termos-legais.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black text-sm transition-colors"
            >
              Termos
            </a>
            <a
              href="https://fastinbox-repo.github.io/docs/documents/termos-legais.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black text-sm transition-colors"
            >
              Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
