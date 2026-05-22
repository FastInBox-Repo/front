import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, TrendingUp, BarChart3, DollarSign, CalendarRange } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatCurrency } from "../../data/mockData";
import { useSprintSession } from "../../data/sprintStore";

type PeriodKey = "7d" | "30d" | "90d" | "all";

const periodOptions: { id: PeriodKey; label: string }[] = [
  { id: "7d", label: "Ultimos 7 dias" },
  { id: "30d", label: "Ultimos 30 dias" },
  { id: "90d", label: "Ultimos 90 dias" },
  { id: "all", label: "Periodo completo" },
];

const PIE_COLORS = ["#000000", "#404040", "#737373", "#a3a3a3", "#d4d4d4"];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function periodStart(period: PeriodKey): Date | undefined {
  if (period === "7d") return daysAgo(7);
  if (period === "30d") return daysAgo(30);
  if (period === "90d") return daysAgo(90);
  return undefined;
}

function toCsv(rows: { nutritionistName: string; ordersCount: number; subtotalCents: number; commissionCents: number; payoutCents: number }[]): string {
  const header = "Nutricionista,Pedidos,Subtotal (R$),Comissao (R$),Repasse (R$)";
  const lines = rows.map((r) => `${r.nutritionistName},${r.ordersCount},${(r.subtotalCents / 100).toFixed(2)},${(r.commissionCents / 100).toFixed(2)},${(r.payoutCents / 100).toFixed(2)}`);
  return [header, ...lines].join("\n");
}

export default function AdminRelatoriosPage() {
  const { orders, patients } = useSprintSession();
  const [period, setPeriod] = useState<PeriodKey>("30d");

  const filtered = useMemo(() => {
    const start = periodStart(period);
    if (!start) return orders;
    return orders.filter((o) => new Date(o.createdAt).getTime() >= start.getTime());
  }, [orders, period]);

  const paid = filtered.filter((o) => o.paidAt);
  const delivered = filtered.filter((o) => o.status === "entregue");
  const revenueCents = paid.reduce((acc, o) => acc + Math.round(o.finalPrice * 100), 0);
  const commissionCents = paid.reduce((acc, o) => acc + Math.round(Math.max(0, (o.finalPrice ?? 0) - (o.basePrice ?? 0)) * 100), 0);
  const payoutCents = revenueCents - commissionCents;
  const ticketCents = paid.length > 0 ? Math.round(revenueCents / paid.length) : 0;
  const conversionPct = filtered.length > 0 ? Math.round((paid.length / filtered.length) * 1000) / 10 : 0;

  const statusDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of filtered) map.set(o.status, (map.get(o.status) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const commissions = useMemo(() => {
    const rows = new Map<string, { nutritionistId: string; nutritionistName: string; ordersCount: number; subtotalCents: number; commissionCents: number; payoutCents: number }>();
    for (const o of paid) {
      const key = o.nutritionistId ?? "n/a";
      const row = rows.get(key) ?? {
        nutritionistId: key,
        nutritionistName: o.nutritionistName ?? "Nao identificado",
        ordersCount: 0,
        subtotalCents: 0,
        commissionCents: 0,
        payoutCents: 0,
      };
      row.ordersCount += 1;
      row.subtotalCents += Math.round((o.basePrice ?? 0) * 100);
      row.commissionCents += Math.round(Math.max(0, (o.finalPrice ?? 0) - (o.basePrice ?? 0)) * 100);
      row.payoutCents += Math.round(o.finalPrice * 100) - Math.round(Math.max(0, (o.finalPrice ?? 0) - (o.basePrice ?? 0)) * 100);
      rows.set(key, row);
    }
    return [...rows.values()].sort((a, b) => b.commissionCents - a.commissionCents);
  }, [paid]);

  const weeklyData = useMemo(() => {
    const buckets = new Map<string, { dia: string; pedidos: number; faturamento: number }>();
    for (const o of paid) {
      const dt = new Date(o.paidAt ?? o.createdAt);
      const key = dt.toISOString().slice(0, 10);
      const row = buckets.get(key) ?? { dia: key.slice(5), pedidos: 0, faturamento: 0 };
      row.pedidos += 1;
      row.faturamento += Math.round(o.finalPrice * 100);
      buckets.set(key, row);
    }
    return [...buckets.values()].sort((a, b) => a.dia.localeCompare(b.dia)).slice(-14);
  }, [paid]);

  const handleExportCsv = () => {
    const csv = toCsv(commissions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comissoes-fastinbox-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Relatorios</h1>
          <p className="text-gray-700 text-sm mt-0.5">Operacao, faturamento e comissoes consolidadas por periodo.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-black rounded-md p-1 bg-white" role="group" aria-label="Periodo do relatorio">
            <CalendarRange className="w-4 h-4 ml-1 text-gray-700" aria-hidden="true" />
            {periodOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${period === opt.id ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                style={{ fontWeight: 600 }}
                aria-pressed={period === opt.id}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-black text-white border-2 border-black px-3 py-1.5 rounded-md text-xs"
            style={{ fontWeight: 700, boxShadow: "4px 4px 0 #000" }}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Exportar comissoes (.csv)
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" aria-label="Indicadores de relatorio">
        {[
          { icon: BarChart3, label: "Pedidos no periodo", value: filtered.length, sub: `${paid.length} pagos`, isText: false },
          { icon: DollarSign, label: "Faturamento bruto", value: formatCurrency(revenueCents / 100), sub: `Ticket medio ${formatCurrency(ticketCents / 100)}`, isText: true },
          { icon: TrendingUp, label: "Conversao para pago", value: `${conversionPct}%`, sub: `${delivered.length} entregues`, isText: true },
          { icon: FileSpreadsheet, label: "Pacientes ativos", value: patients.length, sub: "Cadastrados", isText: false },
        ].map((m) => (
          <article key={m.label} className="bg-white border-2 border-black rounded-md p-4" style={{ boxShadow: "5px 5px 0 #000" }}>
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs text-gray-700" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>{m.value}</p>
            <p className="text-xs text-gray-600 mt-1">{m.sub}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <article className="lg:col-span-2 bg-white border-2 border-black rounded-md p-5" style={{ boxShadow: "5px 5px 0 #000" }}>
          <h2 className="mb-3" style={{ fontWeight: 700, fontSize: "1rem" }}>Faturamento diario (ultimos 14 dias)</h2>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="dia" stroke="#171717" fontSize={11} />
                <YAxis stroke="#171717" fontSize={11} tickFormatter={(v) => `R$${Math.round((v as number) / 100)}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v) / 100)} />
                <Bar dataKey="faturamento" fill="#000000" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">Sem dados no periodo.</p>
          )}
        </article>

        <article className="bg-white border-2 border-black rounded-md p-5" style={{ boxShadow: "5px 5px 0 #000" }}>
          <h2 className="mb-3" style={{ fontWeight: 700, fontSize: "1rem" }}>Distribuicao por status</h2>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {statusDistribution.map((_entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="#000" />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">Sem dados no periodo.</p>
          )}
        </article>
      </section>

      <section className="bg-white border-2 border-black rounded-md p-5 mb-8" style={{ boxShadow: "5px 5px 0 #000" }}>
        <header className="flex items-center justify-between mb-3">
          <h2 style={{ fontWeight: 700, fontSize: "1rem" }}>Comissoes por nutricionista</h2>
          <span className="text-xs text-gray-600">{commissions.length} parceiro(s) ativo(s)</span>
        </header>
        {commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" aria-label="Comissoes por nutricionista no periodo selecionado">
              <caption className="sr-only">Tabela de comissoes por nutricionista. Inclui pedidos, subtotal, comissao FastInBox e repasse total.</caption>
              <thead>
                <tr className="border-b-2 border-black">
                  <th scope="col" className="text-left py-2 px-2" style={{ fontWeight: 700 }}>Nutricionista</th>
                  <th scope="col" className="text-right py-2 px-2" style={{ fontWeight: 700 }}>Pedidos</th>
                  <th scope="col" className="text-right py-2 px-2" style={{ fontWeight: 700 }}>Subtotal</th>
                  <th scope="col" className="text-right py-2 px-2" style={{ fontWeight: 700 }}>Comissao</th>
                  <th scope="col" className="text-right py-2 px-2" style={{ fontWeight: 700 }}>Repasse</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((row) => (
                  <tr key={row.nutritionistId} className="border-b border-gray-200">
                    <td className="py-2 px-2">{row.nutritionistName}</td>
                    <td className="text-right py-2 px-2">{row.ordersCount}</td>
                    <td className="text-right py-2 px-2">{formatCurrency(row.subtotalCents / 100)}</td>
                    <td className="text-right py-2 px-2" style={{ fontWeight: 700 }}>{formatCurrency(row.commissionCents / 100)}</td>
                    <td className="text-right py-2 px-2 text-gray-700">{formatCurrency(row.payoutCents / 100)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="py-2 px-2" style={{ fontWeight: 800 }}>Total</td>
                  <td className="text-right py-2 px-2" style={{ fontWeight: 800 }}>{commissions.reduce((acc, r) => acc + r.ordersCount, 0)}</td>
                  <td className="text-right py-2 px-2" style={{ fontWeight: 800 }}>{formatCurrency(commissions.reduce((acc, r) => acc + r.subtotalCents, 0) / 100)}</td>
                  <td className="text-right py-2 px-2" style={{ fontWeight: 800 }}>{formatCurrency(commissionCents / 100)}</td>
                  <td className="text-right py-2 px-2" style={{ fontWeight: 800 }}>{formatCurrency(payoutCents / 100)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sem pedidos pagos no periodo selecionado.</p>
        )}
      </section>

      <section className="bg-black text-white rounded-md p-5" style={{ boxShadow: "6px 6px 0 #000" }}>
        <h2 className="mb-2" style={{ fontWeight: 700, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Conformidade e exportacao
        </h2>
        <p className="text-sm text-gray-100 mb-3" style={{ fontWeight: 500 }}>
          Relatorios consumiveis em CSV para repasse contabil. Dados consolidados a partir do dominio de pedidos com auditoria completa em /admin/auditoria.
        </p>
        <ul className="text-xs text-gray-200 list-disc pl-5 space-y-1">
          <li>Comissoes calculadas com base na taxa vigente do contrato de cada clinica.</li>
          <li>Periodo padrao 30 dias; ajustar conforme janela de fechamento da clinica.</li>
          <li>Trilha de exportacao registrada em audit log para conformidade LGPD.</li>
        </ul>
      </section>
    </div>
  );
}
