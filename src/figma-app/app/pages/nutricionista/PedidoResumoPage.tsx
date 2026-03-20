import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import { mockOrders, statusLabels, formatCurrency, formatDate } from "../../data/mockData";
import { useState } from "react";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    rascunho: "bg-gray-100 text-gray-500 border-gray-200",
    aguardando_confirmacao: "bg-gray-100 text-gray-600 border-gray-200",
    aguardando_pagamento: "bg-gray-100 text-gray-600 border-gray-200",
    pago: "bg-black text-white border-black",
    em_producao: "bg-gray-800 text-white border-gray-800",
    pronto: "bg-gray-600 text-white border-gray-600",
    em_entrega: "bg-gray-400 text-white border-gray-400",
    entregue: "bg-gray-200 text-gray-700 border-gray-300",
    cancelado: "bg-gray-100 text-gray-400 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded border text-xs ${styles[status] || ""}`} style={{ fontWeight: 500 }}>
      {statusLabels[status as keyof typeof statusLabels]}
    </span>
  );
};

export default function PedidoResumoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const order = mockOrders.find((o) => o.id === id) || mockOrders[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/paciente/pedido/${order.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copiado!");
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/nutricionista/dashboard")}
          className="text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
              {order.code}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Criado em {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/paciente/pedido/${order.code}`)}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-md text-sm hover:border-black transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Prévia
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-md text-sm hover:bg-gray-900 transition-colors"
            style={{ fontWeight: 500 }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-4">
          {/* Patient */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Paciente</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 text-sm" style={{ fontWeight: 600 }}>
                  {order.patientName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div>
                <p className="text-black" style={{ fontWeight: 600 }}>{order.patientName}</p>
                <p className="text-gray-400 text-sm">Entrega: {formatDate(order.deliveryDate)}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          {order.items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-black" style={{ fontWeight: 600 }}>{item.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">
                    {item.quantity}x
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">
                    {item.packaging}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                  Ingredientes
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {item.ingredients.map((ing) => (
                    <div key={ing.id} className="flex items-center justify-between border border-gray-100 rounded-md px-2.5 py-2 bg-gray-50">
                      <div>
                        <p className="text-black text-xs" style={{ fontWeight: 500 }}>{ing.name}</p>
                        <p className="text-gray-400 text-xs capitalize">{ing.category}</p>
                      </div>
                      <span className="text-gray-400 text-xs">{ing.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              {item.observations && (
                <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
                  Obs: {item.observations}
                </p>
              )}
            </div>
          ))}

          {/* Nutritional obs */}
          {order.nutritionalObservations && (
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                Observações nutricionais
              </p>
              <p className="text-gray-600 text-sm" style={{ lineHeight: 1.7 }}>
                {order.nutritionalObservations}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Code */}
          <div className="bg-black rounded-lg p-5 text-center">
            <p className="text-gray-400 text-xs mb-2">Código do pedido</p>
            <p className="text-white" style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "0.08em" }}>
              {order.code}
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Valores</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Preço base</span>
                <span>{formatCurrency(order.basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Margem</span>
                <span>{formatCurrency(order.margin)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="text-black" style={{ fontWeight: 600 }}>Total ao paciente</span>
                <span className="text-black" style={{ fontWeight: 700 }}>{formatCurrency(order.finalPrice)}</span>
              </div>
              {order.paidAt && (
                <p className="text-xs text-gray-400 mt-1">Pago em {formatDate(order.paidAt)}</p>
              )}
            </div>
          </div>

          {/* Status history */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3" style={{ fontWeight: 600 }}>Status</p>
            <StatusBadge status={order.status} />
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                <span className="text-gray-600">Criado: {formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  <span className="text-gray-600">Pago: {formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/paciente/pedido/${order.code}`)}
              className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-md text-sm hover:border-black transition-colors"
              style={{ fontWeight: 500 }}
            >
              <ExternalLink className="w-4 h-4" /> Ver como paciente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
