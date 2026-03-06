export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center gap-8 rounded-[2rem] border border-white/60 bg-white/75 p-8 shadow-[0_30px_120px_rgba(65,88,80,0.18)] backdrop-blur sm:p-12">
        <div className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-900">
          FastInBox bootstrap
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Frontend iniciado com Next.js, TypeScript e base pronta para o
            white label.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Este projeto foi configurado para evoluir a experiencia da clinica,
            do paciente e da operacao FastInBox sem conflitar com o ambiente
            local do Sportickets.
          </p>
        </div>

        <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="font-medium text-slate-950">Stack</p>
            <p>Next.js 15, React 19, TypeScript e App Router.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="font-medium text-slate-950">Ambiente local</p>
            <p>Frontend em 3001 com proxy para backend em 4001.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <p className="font-medium text-slate-950">Status</p>
            <p>Bootstrap concluido. Desenvolvimento funcional ainda nao iniciado.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
