# FastInBox Front

Frontend web da FastInBox, plataforma SaaS white label para nutricionistas venderem marmitas personalizadas aos seus pacientes com operacao integrada entre clinica, paciente, cozinha e administracao.

## Objetivo do MVP

Validar o fluxo principal do produto:

1. nutricionista cadastra paciente
2. nutricionista monta o pedido personalizado
3. sistema gera codigo ou link unico
4. paciente revisa, confirma e paga
5. pedido pago segue para a cozinha
6. cozinha acompanha producao e entrega
7. administracao monitora a operacao

## Escopo de interface

- Home institucional com proposta de valor e entrada por perfil
- Login e recuperacao de senha
- Area do nutricionista para pacientes, pedidos e white label da clinica
- Area do paciente para revisao, confirmacao, pagamento e acompanhamento
- Painel operacional da cozinha com atualizacao rapida de status
- Dashboard administrativo com metricas e monitoramento

## Direcao visual

- Estetica moderna, premium e funcional
- Paleta monocromatica: preto, branco e tons de cinza
- Layout blockado, alto contraste e hierarquia forte
- Cards robustos, bordas visiveis e cantos discretamente arredondados
- Componentes reutilizaveis com grid base de 8px
- Experiencia do paciente priorizando a marca da clinica; FastInBox em segundo plano

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Ambiente local

- App: `http://localhost:3001`
- Backend esperado: `http://localhost:4001`
- Proxy local previsto: `/backend/*`

## Principios de implementacao

- menor diff possivel e sem quebra de comportamento existente
- componentes consistentes e reutilizaveis
- feedbacks claros de loading, vazio, erro e sucesso
- separacao objetiva entre perfis e jornadas
- design pronto para producao, sem visual generico de dashboard
