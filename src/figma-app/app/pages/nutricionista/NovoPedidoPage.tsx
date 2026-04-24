import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, X, ChevronDown, Info, ArrowRight, Copy, Check } from "lucide-react";
import { MarmitaItem, formatCurrency } from "../../data/mockData";
import { toast } from "sonner";
import { sprintStoreActions, useSprintSession } from "../../data/sprintStore";

type IngredientEntry = MarmitaItem["ingredients"][number];

const categories = ["proteina", "carboidrato", "vegetal", "gordura", "tempero"];
const packagingOptions = [
  "Embalagem 650ml",
  "Embalagem 800ml",
  "Embalagem 900ml",
  "Embalagem 1000ml",
  "Embalagem 1100ml",
  "Embalagem 1200ml (XG)",
];

const STEP_LABELS = ["Paciente", "Marmitas", "Preços", "Revisão"];

export default function NovoPedidoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { patients, users, clinic, currentUser } = useSprintSession();
  const preselectedPatient = searchParams.get("paciente") || "";
  const factoryUsers = users.filter((user) => user.role === "cozinha");

  const [step, setStep] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatient);
  const [selectedFactoryId, setSelectedFactoryId] = useState(factoryUsers[0]?.id || "");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [nutritionalObservations, setNutritionalObservations] = useState("");
  const [allowEditing, setAllowEditing] = useState(false);
  const [items, setItems] = useState<MarmitaItem[]>([
    {
      id: "m1",
      name: "Marmita Personalizada",
      quantity: 5,
      ingredients: [{ id: "i1", name: "", quantity: "", category: "proteina" }],
      packaging: "Embalagem 900ml",
      observations: "",
    },
  ]);
  const [basePrice, setBasePrice] = useState(0);
  const [margin, setMargin] = useState(0);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const finalPrice = basePrice + margin;
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedFactory = factoryUsers.find((factory) => factory.id === selectedFactoryId);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        name: "Nova Marmita",
        quantity: 5,
        ingredients: [{ id: `i${Date.now()}`, name: "", quantity: "", category: "proteina" }],
        packaging: "Embalagem 900ml",
        observations: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof MarmitaItem, value: unknown) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const addIngredient = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              ingredients: [
                ...i.ingredients,
                { id: `i${Date.now()}`, name: "", quantity: "", category: "proteina" },
              ],
            }
          : i
      )
    );
  };

  const removeIngredient = (itemId: string, ingId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, ingredients: i.ingredients.filter((ig) => ig.id !== ingId) }
          : i
      )
    );
  };

  const updateIngredient = (itemId: string, ingId: string, field: keyof IngredientEntry, value: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              ingredients: i.ingredients.map((ig) =>
                ig.id === ingId ? { ...ig, [field]: value } : ig
              ),
            }
          : i
      )
    );
  };

  const handleNext = () => {
    if (step === 0 && !selectedPatientId) {
      toast.error("Selecione um paciente");
      return;
    }
    if (step === 0 && !selectedFactoryId) {
      toast.error("Selecione uma fábrica");
      return;
    }
    if (step === 1) {
      const invalid = items.some((it) => !it.name || it.ingredients.some((ig) => !ig.name));
      if (invalid) {
        toast.error("Preencha todos os campos das marmitas e ingredientes");
        return;
      }
    }
    if (step === 2 && finalPrice === 0) {
      toast.error("Defina o preço do pedido");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("Faça login para criar o pedido");
      navigate("/login?role=nutricionista");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const createdOrder = sprintStoreActions.createOrder({
      patientId: selectedPatientId,
      nutritionistId: currentUser.id,
      nutritionistName: currentUser.name,
      clinicName: currentUser.clinicName || clinic.name,
      items,
      basePrice,
      finalPrice,
      margin,
      deliveryDate,
      nutritionalObservations,
      allowEditing,
      factoryId: selectedFactoryId,
      factoryName: selectedFactory?.name,
    });
    setCreatedOrderId(createdOrder.id);
    setGeneratedCode(createdOrder.code);
    setSubmitting(false);
    setStep(4);
    toast.success("Pedido criado e enviado para a fábrica!");
  };

  const handleCopy = () => {
    const link = `${window.location.origin}/paciente/pedido/${generatedCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copiado!");
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Novo Pedido</h1>
        <p className="text-gray-500 text-sm mt-0.5">Monte marmitas personalizadas para seu paciente</p>
      </div>

      {step < 4 && (
        <>
          {/* Steps */}
          <div className="flex items-center gap-0 mb-8">
            {STEP_LABELS.map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all ${
                      idx === step
                        ? "bg-black text-white border-black"
                        : idx < step
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {idx < step ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <span
                    className={`text-sm ${idx === step ? "text-black" : idx < step ? "text-gray-600" : "text-gray-400"}`}
                    style={{ fontWeight: idx === step ? 600 : 400 }}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className={`h-px w-8 mx-3 ${idx < step ? "bg-black" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            {/* Step 0: Patient */}
            {step === 0 && (
              <div>
                <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>Selecionar paciente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {patients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedPatientId === p.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-xs" style={{ fontWeight: 600 }}>
                          {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-black text-sm" style={{ fontWeight: 500 }}>{p.name}</p>
                        <p className="text-gray-400 text-xs truncate">{p.email}</p>
                        <p className="text-gray-400 text-xs">{p.goal}</p>
                        {p.restrictions !== "Nenhuma" && (
                          <span className="inline-block mt-1 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded border border-gray-200">
                            ⚠ {p.restrictions}
                          </span>
                        )}
                      </div>
                      {selectedPatientId === p.id && (
                        <Check className="w-4 h-4 text-black ml-auto flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                      Data prevista de entrega
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                      Fábrica responsável
                    </label>
                    <div className="relative">
                      <select
                        value={selectedFactoryId}
                        onChange={(e) => setSelectedFactoryId(e.target.value)}
                        className="w-full appearance-none border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black bg-white pr-8"
                      >
                        {factoryUsers.map((factory) => (
                          <option key={factory.id} value={factory.id}>
                            {factory.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-7">
                    <button
                      type="button"
                      onClick={() => setAllowEditing(!allowEditing)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
                        allowEditing ? "bg-black border-black" : "bg-gray-200 border-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          allowEditing ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>
                      Permitir edição pelo paciente
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Items */}
            {step === 1 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontWeight: 600 }}>Marmitas do pedido</h2>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black border border-gray-200 hover:border-black px-3 py-1.5 rounded-md transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar marmita
                  </button>
                </div>

                <div className="space-y-6">
                  {items.map((item, idx) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                          Marmita {idx + 1}
                        </span>
                        {items.length > 1 && (
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-black">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>Nome</label>
                          <input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            placeholder="Ex: Marmita Hipertrofia"
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>Quantidade</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-gray-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                            Ingredientes
                          </label>
                          <button
                            onClick={() => addIngredient(item.id)}
                            className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Adicionar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {item.ingredients.map((ing) => (
                            <div key={ing.id} className="flex items-center gap-2">
                              <select
                                value={ing.category}
                                onChange={(e) => updateIngredient(item.id, ing.id, "category", e.target.value)}
                                className="border border-gray-200 rounded-md px-2 py-2 text-xs focus:outline-none focus:border-black bg-white w-28"
                              >
                                {categories.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <input
                                value={ing.name}
                                onChange={(e) => updateIngredient(item.id, ing.id, "name", e.target.value)}
                                placeholder="Ingrediente"
                                className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                              />
                              <input
                                value={ing.quantity}
                                onChange={(e) => updateIngredient(item.id, ing.id, "quantity", e.target.value)}
                                placeholder="100g"
                                className="w-20 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                              />
                              <button
                                onClick={() => removeIngredient(item.id, ing.id)}
                                className="text-gray-300 hover:text-black transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>Embalagem</label>
                          <div className="relative">
                            <select
                              value={item.packaging}
                              onChange={(e) => updateItem(item.id, "packaging", e.target.value)}
                              className="w-full appearance-none border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black bg-white pr-8"
                            >
                              {packagingOptions.map((p) => <option key={p}>{p}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>Observações</label>
                          <input
                            value={item.observations}
                            onChange={(e) => updateItem(item.id, "observations", e.target.value)}
                            placeholder="Sem sal, sem glúten..."
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                    Observações nutricionais gerais
                  </label>
                  <textarea
                    value={nutritionalObservations}
                    onChange={(e) => setNutritionalObservations(e.target.value)}
                    placeholder="Instruções gerais de preparação, armazenamento, contexto do paciente..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Prices */}
            {step === 2 && (
              <div>
                <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>Precificação</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                      Preço base (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={basePrice / 100 || ""}
                      onChange={(e) => setBasePrice(Math.round(Number(e.target.value) * 100))}
                      placeholder="0,00"
                      className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                    <p className="text-xs text-gray-400 mt-1">Custo de produção</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>
                      Margem / Comissão (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={margin / 100 || ""}
                      onChange={(e) => setMargin(Math.round(Number(e.target.value) * 100))}
                      placeholder="0,00"
                      className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                    <p className="text-xs text-gray-400 mt-1">Sua comissão sobre o pedido</p>
                  </div>
                  <div className="bg-black rounded-lg p-4 flex flex-col justify-center">
                    <p className="text-gray-400 text-xs mb-1">Preço final ao paciente</p>
                    <p className="text-white" style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
                      {formatCurrency(finalPrice)}
                    </p>
                    {basePrice > 0 && (
                      <p className="text-gray-400 text-xs mt-1">
                        Margem: {((margin / finalPrice) * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-500" style={{ lineHeight: 1.6 }}>
                    O preço final será exibido para o paciente durante a confirmação e pagamento. 
                    O preço base e a margem são visíveis apenas para você.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && selectedPatient && (
              <div>
                <h2 style={{ fontWeight: 600, marginBottom: "1rem" }}>Revisão do pedido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                      Paciente
                    </p>
                    <p className="text-black" style={{ fontWeight: 500 }}>{selectedPatient.name}</p>
                    <p className="text-gray-500 text-sm">{selectedPatient.email}</p>
                    <p className="text-gray-500 text-sm">{selectedPatient.goal}</p>
                    {deliveryDate && (
                      <p className="text-gray-500 text-sm mt-1">
                        Entrega: {deliveryDate.split("-").reverse().join("/")}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      Fábrica: {selectedFactory?.name || "Não definida"}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                      Valores
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Preço base</span>
                        <span className="text-black">{formatCurrency(basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Margem</span>
                        <span className="text-black">{formatCurrency(margin)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-gray-100 pt-1 mt-1">
                        <span className="text-black" style={{ fontWeight: 600 }}>Total ao paciente</span>
                        <span className="text-black" style={{ fontWeight: 700 }}>{formatCurrency(finalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-black text-sm" style={{ fontWeight: 600 }}>
                        {item.name}
                      </p>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {item.quantity}x · {item.packaging}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.ingredients.filter((i) => i.name).map((ing) => (
                        <span key={ing.id} className="text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                          {ing.name} {ing.quantity}
                        </span>
                      ))}
                    </div>
                    {item.observations && (
                      <p className="text-xs text-gray-400 mt-2">Obs: {item.observations}</p>
                    )}
                  </div>
                ))}
                {nutritionalObservations && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                      Observações nutricionais
                    </p>
                    <p className="text-gray-600 text-sm">{nutritionalObservations}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 0 ? setStep((s) => s - 1) : navigate("/nutricionista/dashboard")}
              className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-md text-sm hover:border-black transition-colors"
              style={{ fontWeight: 500 }}
            >
              {step === 0 ? "Cancelar" : "Voltar"}
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                {submitting ? "Enviando para a fábrica..." : "Criar pedido e enviar para fábrica"}
              </button>
            )}
          </div>
        </>
      )}

      {/* Step 4: Success + Code */}
      {step === 4 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-white" />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.02em" }} className="mb-2">
            Pedido criado!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Pedido enviado para {selectedFactory?.name || "fábrica"}. Compartilhe o código com {selectedPatient?.name || "o paciente"} para acompanhamento.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>Código do pedido</p>
            <p className="text-black" style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "0.1em" }}>
              {generatedCode}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 flex items-center gap-2">
            <span className="flex-1 text-sm text-gray-500 truncate text-left">
              {window.location.origin}/paciente/pedido/{generatedCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-md text-xs hover:bg-gray-900 flex-shrink-0"
              style={{ fontWeight: 500 }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(createdOrderId ? `/nutricionista/pedidos/${createdOrderId}` : "/nutricionista/dashboard")}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-md text-sm hover:border-black transition-colors"
              style={{ fontWeight: 500 }}
            >
              Ver resumo
            </button>
            <button
              onClick={() => navigate("/nutricionista/dashboard")}
              className="flex-1 bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
              style={{ fontWeight: 600 }}
            >
              Ir ao dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
