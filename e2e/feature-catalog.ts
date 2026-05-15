export interface FeatureCatalogEntry {
  area: "Publico" | "Nutricionista" | "Paciente" | "Cozinha" | "Admin";
  title: string;
  summary: string;
  steps: string[];
}

export const featureCatalog: Record<string, FeatureCatalogEntry> = {
  "01-home-tracking": {
    area: "Publico",
    title: "Home publica e rastreio de pedido",
    summary:
      "Valida a landing page institucional do FastInBox e o atalho de rastreio que abre direto a timeline de um pedido a partir do codigo informado.",
    steps: [
      "Abre a home publica e confirma o hero principal",
      "Navega pelas ancoras de Como funciona, Beneficios e FAQ",
      "Expande uma pergunta do FAQ",
      "Informa um codigo de pedido (FIB-2026-001) no atalho de rastreio",
      "Confirma que a rota redireciona para o status do pedido do paciente",
    ],
  },
  "02-auth-login": {
    area: "Publico",
    title: "Login multi-perfil + erro com credencial invalida",
    summary:
      "Garante que os tres perfis publicos (nutricionista, paciente e cozinha) conseguem autenticar com sucesso e que credenciais invalidas permanecem na tela de login.",
    steps: [
      "Faz login como nutricionista (ana@nutritionvida.com.br) e valida redirecionamento",
      "Refaz o fluxo como paciente seedado",
      "Refaz o fluxo como cozinha (fabrica@fastinbox.com.br)",
      "Tenta uma combinacao invalida e confirma que segue em /login",
    ],
  },
  "03-auth-register": {
    area: "Publico",
    title: "Cadastro de novo paciente",
    summary:
      "Cobre o auto-atendimento de cadastro: o paciente preenche os dados minimos e a plataforma cria a conta + direciona para a area logada.",
    steps: [
      "Acessa /login?role=paciente",
      "Alterna para a aba Cadastrar via role=tab",
      "Seleciona o perfil Paciente",
      "Preenche nome, telefone, objetivo, e-mail e senha",
      "Clica em Criar conta e valida redirecionamento para /paciente",
    ],
  },
  "04-auth-forgot-password": {
    area: "Publico",
    title: "Recuperacao de senha",
    summary:
      "Confirma o fluxo de auto-recuperacao com a tela de sucesso (E-mail enviado) e o atalho de retorno ao login.",
    steps: [
      "Abre /recuperar-senha",
      "Submete um e-mail valido (ana@nutritionvida.com.br)",
      "Aguarda a confirmacao 'E-mail enviado'",
      "Volta para a tela de login pelo atalho",
    ],
  },
  "05-nutri-dashboard": {
    area: "Nutricionista",
    title: "Dashboard do nutricionista",
    summary:
      "Verifica os indicadores principais do nutricionista: pacientes ativos, rascunhos, pagos, em producao e faturamento.",
    steps: [
      "Login como nutricionista",
      "Confirma os cards de metricas (Pacientes, Pagos, Faturamento)",
      "Navega rapidamente para a area de Pacientes pelo menu lateral",
      "Volta para o dashboard",
    ],
  },
  "06-nutri-pacientes": {
    area: "Nutricionista",
    title: "Gestao de pacientes",
    summary:
      "Cobre a tabela de pacientes (busca + lista) e o cadastro completo via modal lateral.",
    steps: [
      "Login como nutricionista e acesso a /nutricionista/pacientes",
      "Pesquisa por 'Maria' e limpa o filtro",
      "Abre o modal 'Novo Paciente'",
      "Preenche nome, e-mail, telefone e CPF e confirma cadastro",
      "Valida que o novo paciente aparece na listagem",
    ],
  },
  "07-nutri-novo-pedido": {
    area: "Nutricionista",
    title: "Wizard de novo pedido",
    summary:
      "Percorre os quatro passos do wizard (Paciente, Marmitas, Precos, Revisao) garantindo que cada etapa avanca corretamente.",
    steps: [
      "Login como nutricionista",
      "Abre /nutricionista/pedidos/novo",
      "Seleciona um paciente",
      "Avanca para as etapas seguintes ate a revisao",
    ],
  },
  "08-nutri-pedido-resumo": {
    area: "Nutricionista",
    title: "Resumo de pedido",
    summary:
      "Abre um pedido existente a partir do dashboard e confirma que o nutricionista visualiza codigo, status e acoes disponiveis.",
    steps: [
      "Login como nutricionista",
      "Busca pelo link FIB- no dashboard ou abre /nutricionista/pedidos/1",
      "Confirma que a pagina exibe titulo, codigo e status",
    ],
  },
  "09-nutri-configuracoes": {
    area: "Nutricionista",
    title: "Configuracoes da clinica",
    summary:
      "Valida a tela de personalizacao da clinica (marca, identidade e preferencias) e o botao de salvar.",
    steps: [
      "Login como nutricionista",
      "Abre /nutricionista/configuracoes",
      "Altera o primeiro campo editavel",
      "Aciona o botao Salvar (quando disponivel)",
    ],
  },
  "10-paciente-landing": {
    area: "Paciente",
    title: "Landing do paciente",
    summary:
      "Garante que o paciente desconectado consegue consultar um pedido a partir da landing publica /paciente.",
    steps: [
      "Acessa /paciente sem sessao",
      "Informa um codigo de pedido (FIB-2026-001)",
      "Confirma redirecionamento para a tela do pedido",
    ],
  },
  "11-paciente-pedido": {
    area: "Paciente",
    title: "Visualizacao e confirmacao de pedido",
    summary:
      "Abre o pedido na visao do paciente com itens, observacoes e CTA principal (Confirmar / Prosseguir / Pagar).",
    steps: [
      "Acessa diretamente /paciente/pedido/FIB-2026-001",
      "Confirma que o conteudo do pedido carrega",
      "Aciona o CTA principal quando disponivel",
    ],
  },
  "12-paciente-pagamento": {
    area: "Paciente",
    title: "Escolha de metodo de pagamento",
    summary:
      "Demonstra a alternancia entre as tres formas de pagamento (PIX, cartao e boleto) e o disparo do pagamento.",
    steps: [
      "Abre /paciente/pedido/FIB-2026-001/pagamento",
      "Alterna entre PIX, Cartao e Boleto",
      "Aciona o botao final de pagamento",
    ],
  },
  "13-paciente-status": {
    area: "Paciente",
    title: "Timeline de status do pedido",
    summary:
      "Acompanha em tempo real a evolucao do pedido (producao, entrega) na visao do paciente.",
    steps: [
      "Abre /paciente/pedido/FIB-2026-001/status",
      "Confirma a presenca da timeline (producao / entrega / preparo)",
    ],
  },
  "14-cozinha-login": {
    area: "Cozinha",
    title: "Login da fabrica",
    summary:
      "Cobre o login dedicado da cozinha em /cozinha/login e o acesso ao painel operacional.",
    steps: [
      "Acessa /cozinha/login",
      "Preenche usuario e senha",
      "Confirma redirecionamento para /cozinha/dashboard",
    ],
  },
  "15-cozinha-dashboard": {
    area: "Cozinha",
    title: "Painel de producao (kanban)",
    summary:
      "Verifica o kanban da cozinha com as colunas Novo, Em producao, Pronto, Em entrega e Entregue.",
    steps: [
      "Login como cozinha",
      "Abre /cozinha/dashboard",
      "Confirma a presenca das 5 colunas do fluxo",
    ],
  },
  "16-cozinha-pedido": {
    area: "Cozinha",
    title: "Atualizacao de pedido em producao",
    summary:
      "Abre um pedido a partir do kanban e movimenta o status (producao -> pronto -> entrega).",
    steps: [
      "Login como cozinha",
      "Abre o primeiro card do kanban ou /cozinha/pedido/1",
      "Aciona o botao de avanco de status",
    ],
  },
  "17-admin-dashboard": {
    area: "Admin",
    title: "Dashboard administrativo",
    summary:
      "Mostra a visao global da operacao FastInBox com pedidos totais, faturamento e pacientes ativos.",
    steps: [
      "Acessa /admin/dashboard (rota administrativa)",
      "Confirma o titulo e os cards principais",
    ],
  },
  "18-admin-usuarios": {
    area: "Admin",
    title: "Gestao de usuarios e papeis",
    summary:
      "Lista todos os usuarios da plataforma, permite busca e acionamento do CTA de novo usuario.",
    steps: [
      "Abre /admin/usuarios",
      "Pesquisa por 'Ana' e limpa o filtro",
      "Aciona o botao 'Novo usuario'",
    ],
  },
  "19-admin-pedidos": {
    area: "Admin",
    title: "Auditoria de pedidos",
    summary:
      "Consulta global de pedidos com filtros por status / clinica e visao consolidada.",
    steps: [
      "Abre /admin/pedidos",
      "Aplica um filtro de status (quando disponivel)",
    ],
  },
  "20-admin-auditoria": {
    area: "Admin",
    title: "Trilha de auditoria",
    summary:
      "Mostra a trilha de eventos da plataforma (logins, criacoes, alteracoes) com filtros por ator e periodo.",
    steps: [
      "Abre /admin/auditoria",
      "Aplica filtros sequenciais nos selects disponiveis",
    ],
  },
  "21-admin-diagnostico": {
    area: "Admin",
    title: "Diagnostico de sistema",
    summary:
      "Executa checagens automaticas de saude (banco, fila, integracoes) e oferece um botao de re-execucao.",
    steps: [
      "Abre /admin/diagnostico",
      "Aciona o botao de re-executar checagens",
    ],
  },
  "22-admin-configuracoes": {
    area: "Admin",
    title: "Configuracoes globais",
    summary:
      "Cobre os parametros globais da plataforma e o toggle de preferencias administrativas.",
    steps: [
      "Abre /admin/configuracoes",
      "Alterna um toggle/switch da pagina",
    ],
  },
};
