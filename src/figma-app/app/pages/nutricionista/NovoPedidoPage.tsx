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
    const createdOrder = await sprintStoreActions.createOrder({
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
      <header className="mb-8">
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em" }}>Novo Pedido</h1>
        <p className="text-gray-900 text-sm mt-0.5">Monte marmitas personalizadas para seu paciente</p>
      </header>

      {step < 4 && (
        <>
          {/* Steps */}
          <ol
            className="flex items-center gap-0 mb-8 list-none p-0"
            aria-label="Etapas do pedido"
          >
            {STEP_LABELS.map((label, idx) => {
              const completed = idx < step;
              const current = idx === step;
              return (
                <li key={label} className="flex items-center" aria-current={current ? "step" : undefined}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all ${
                        current || completed
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-900 border-gray-300"
                      }`}
                      style={{ fontWeight: 600 }}
                      aria-hidden="true"
                    >
                      {completed ? <Check className="w-3 h-3" aria-hidden="true" focusable="false" /> : idx + 1}
                    </span>
                    <span
                      className={`text-sm ${current ? "text-black" : completed ? "text-gray-900" : "text-gray-900"}`}
                      style={{ fontWeight: current ? 600 : 400 }}
                    >
                      <span className="sr-only">{completed ? "Concluído: " : current ? "Etapa atual: " : "Próxima: "}</span>
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <span className={`h-px w-8 mx-3 ${completed ? "bg-black" : "bg-gray-300"}`} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Step content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            {/* Step 0: Patient */}
            {step === 0 && (
              <section aria-labelledby="step-patient-title">
                <h2 id="step-patient-title" style={{ fontWeight: 600, marginBottom: "1rem" }}>Selecionar paciente</h2>
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 border-0 p-0 m-0">
                  <legend className="sr-only">Selecione o paciente</legend>
                  {patients.map((p) => {
                    const checked = selectedPatientId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                          checked
                            ? "border-black bg-gray-50"
                            : "border-gray-300 hover:border-black"
                        }`}
                      >
                        <span
                          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
                          aria-hidden="true"
                        >
                          <span className="text-gray-900 text-xs" style={{ fontWeight: 600 }}>
                            {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-black text-sm" style={{ fontWeight: 500 }}>{p.name}</span>
                          <span className="block text-gray-900 text-xs truncate">{p.email}</span>
                          <span className="block text-gray-900 text-xs">{p.goal}</span>
                          {p.restrictions !== "Nenhuma" && (
                            <span className="inline-block mt-1 bg-gray-100 text-gray-900 text-xs px-1.5 py-0.5 rounded border border-gray-300">
                              <span aria-hidden="true">⚠ </span>
                              <span className="sr-only">Atenção, restrição: </span>
                              {p.restrictions}
                            </span>
                          )}
                        </span>
                        {checked && (
                          <Check className="w-4 h-4 text-black ml-auto shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
                        )}
                      </button>
                    );
                  })}
                </fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="delivery-date" className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                      Data prevista de entrega
                    </label>
                    <input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="factory-select" className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                      Fábrica responsável
                    </label>
                    <div className="relative">
                      <select
                        id="factory-select"
                        value={selectedFactoryId}
                        onChange={(e) => setSelectedFactoryId(e.target.value)}
                        className="w-full appearance-none border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black bg-white pr-8"
                      >
                        {factoryUsers.map((factory) => (
                          <option key={factory.id} value={factory.id}>
                            {factory.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none"
                        aria-hidden="true"
                        focusable="false"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-7">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={allowEditing}
                      aria-labelledby="allow-edit-label"
                      onClick={() => setAllowEditing(!allowEditing)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${
                        allowEditing ? "bg-black border-black" : "bg-gray-400 border-gray-400"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                          allowEditing ? "translate-x-4" : "translate-x-0.5"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    <span id="allow-edit-label" className="text-sm text-gray-900" style={{ fontWeight: 500 }}>
                      Permitir edição pelo paciente
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Step 1: Items */}
            {step === 1 && (
              <section aria-labelledby="step-items-title">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="step-items-title" style={{ fontWeight: 600 }}>Marmitas do pedido</h2>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-sm text-gray-900 hover:text-black border border-gray-300 hover:border-black px-3 py-1.5 rounded-md transition-colors"
                    style={{ fontWeight: 500 }}
                    type="button"
                    aria-label="Adicionar nova marmita ao pedido"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" focusable="false" /> Adicionar marmita
                  </button>
                </div>

                <ul className="space-y-6 list-none p-0 m-0">
                  {items.map((item, idx) => (
                    <li key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3
                          className="text-xs text-gray-900 uppercase tracking-wider m-0"
                          style={{ fontWeight: 600 }}
                        >
                          Marmita {idx + 1}
                        </h3>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-700 hover:text-black"
                            type="button"
                            aria-label={`Remover marmita ${idx + 1}`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" focusable="false" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label htmlFor={`name-${item.id}`} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>Nome</label>
                          <input
                            id={`name-${item.id}`}
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            placeholder="Ex: Marmita Hipertrofia"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label htmlFor={`qty-${item.id}`} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>Quantidade</label>
                          <input
                            id={`qty-${item.id}`}
                            type="number"
                            min={1}
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-xs text-gray-900 uppercase tracking-wider"
                            style={{ fontWeight: 600 }}
                            id={`ing-label-${item.id}`}
                          >
                            Ingredientes
                          </span>
                          <button
                            onClick={() => addIngredient(item.id)}
                            className="text-xs text-gray-900 hover:text-black flex items-center gap-1 transition-colors"
                            type="button"
                            aria-label={`Adicionar ingrediente à marmita ${idx + 1}`}
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" focusable="false" /> Adicionar
                          </button>
                        </div>
                        <ul className="space-y-2 list-none p-0 m-0" aria-labelledby={`ing-label-${item.id}`}>
                          {item.ingredients.map((ing, ingIdx) => (
                            <li key={ing.id} className="flex items-center gap-2">
                              <label className="sr-only" htmlFor={`cat-${ing.id}`}>Categoria do ingrediente {ingIdx + 1}</label>
                              <select
                                id={`cat-${ing.id}`}
                                value={ing.category}
                                onChange={(e) => updateIngredient(item.id, ing.id, "category", e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-2 text-xs focus:outline-none focus:border-black bg-white w-28"
                              >
                                {categories.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <label className="sr-only" htmlFor={`ing-${ing.id}`}>Nome do ingrediente {ingIdx + 1}</label>
                              <input
                                id={`ing-${ing.id}`}
                                value={ing.name}
                                onChange={(e) => updateIngredient(item.id, ing.id, "name", e.target.value)}
                                placeholder="Ingrediente"
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                              />
                              <label className="sr-only" htmlFor={`qty-ing-${ing.id}`}>Quantidade do ingrediente {ingIdx + 1}</label>
                              <input
                                id={`qty-ing-${ing.id}`}
                                value={ing.quantity}
                                onChange={(e) => updateIngredient(item.id, ing.id, "quantity", e.target.value)}
                                placeholder="100g"
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                              />
                              <button
                                onClick={() => removeIngredient(item.id, ing.id)}
                                className="text-gray-700 hover:text-black transition-colors"
                                type="button"
                                aria-label={`Remover ingrediente ${ingIdx + 1}`}
                              >
                                <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`pkg-${item.id}`} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>Embalagem</label>
                          <div className="relative">
                            <select
                              id={`pkg-${item.id}`}
                              value={item.packaging}
                              onChange={(e) => updateItem(item.id, "packaging", e.target.value)}
                              className="w-full appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black bg-white pr-8"
                            >
                              {packagingOptions.map((p) => <option key={p}>{p}</option>)}
                            </select>
                            <ChevronDown
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 pointer-events-none"
                              aria-hidden="true"
                              focusable="false"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`obs-${item.id}`} className="block text-xs text-gray-900 mb-1" style={{ fontWeight: 500 }}>Observações</label>
                          <input
                            id={`obs-${item.id}`}
                            value={item.observations}
                            onChange={(e) => updateItem(item.id, "observations", e.target.value)}
                            placeholder="Sem sal, sem glúten..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <label htmlFor="nutri-obs" className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                    Observações nutricionais gerais
                  </label>
                  <textarea
                    id="nutri-obs"
                    value={nutritionalObservations}
                    onChange={(e) => setNutritionalObservations(e.target.value)}
                    placeholder="Instruções gerais de preparação, armazenamento, contexto do paciente..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
                  />
                </div>
              </section>
            )}

            {/* Step 2: Prices */}
            {step === 2 && (
              <section aria-labelledby="step-price-title">
                <h2 id="step-price-title" style={{ fontWeight: 600, marginBottom: "1rem" }}>Precificação</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label htmlFor="base-price" className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                      Preço base (R$)
                    </label>
                    <input
                      id="base-price"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={basePrice / 100 || ""}
                      onChange={(e) => setBasePrice(Math.round(Number(e.target.value) * 100))}
                      placeholder="0,00"
                      className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                      aria-describedby="base-price-help"
                    />
                    <p id="base-price-help" className="text-xs text-gray-900 mt-1">Custo de produção</p>
                  </div>
                  <div>
                    <label htmlFor="margin-price" className="block text-sm text-gray-900 mb-1.5" style={{ fontWeight: 500 }}>
                      Margem / Comissão (R$)
                    </label>
                    <input
                      id="margin-price"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      value={margin / 100 || ""}
                      onChange={(e) => setMargin(Math.round(Number(e.target.value) * 100))}
                      placeholder="0,00"
                      className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                      aria-describedby="margin-help"
                    />
                    <p id="margin-help" className="text-xs text-gray-900 mt-1">Sua comissão sobre o pedido</p>
                  </div>
                  <output className="bg-black rounded-lg p-4 flex flex-col justify-center" data-dark-surface aria-live="polite" aria-label="Preço final ao paciente">
                    <p className="text-gray-100 text-xs mb-1">Preço final ao paciente</p>
                    <p className="text-white" style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
                      {formatCurrency(finalPrice)}
                    </p>
                    {basePrice > 0 && (
                      <p className="text-gray-100 text-xs mt-1">
                        Margem: {((margin / finalPrice) * 100).toFixed(1)}%
                      </p>
                    )}
                  </output>
                </div>

                <aside className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-2.5" role="note" aria-label="Informação">
                  <Info className="w-4 h-4 text-gray-700 mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
                  <p className="text-sm text-gray-900 m-0" style={{ lineHeight: 1.6 }}>
                    O preço final será exibido para o paciente durante a confirmação e pagamento.
                    O preço base e a margem são visíveis apenas para você.
                  </p>
                </aside>
              </section>
            )}

            {/* Step 3: Review */}
            {step === 3 && selectedPatient && (
              <section aria-labelledby="step-review-title">
                <h2 id="step-review-title" style={{ fontWeight: 600, marginBottom: "1rem" }}>Revisão do pedido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <article className="border border-gray-200 rounded-lg p-4" aria-labelledby="rev-patient-title">
                    <h3 id="rev-patient-title" className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                      Paciente
                    </h3>
                    <p className="text-black m-0" style={{ fontWeight: 500 }}>{selectedPatient.name}</p>
                    <p className="text-gray-900 text-sm m-0">{selectedPatient.email}</p>
                    <p className="text-gray-900 text-sm m-0">{selectedPatient.goal}</p>
                    {deliveryDate && (
                      <p className="text-gray-900 text-sm mt-1 m-0">
                        Entrega: <time dateTime={deliveryDate}>{deliveryDate.split("-").reverse().join("/")}</time>
                      </p>
                    )}
                    <p className="text-gray-900 text-sm mt-1 m-0">
                      Fábrica: {selectedFactory?.name || "Não definida"}
                    </p>
                  </article>
                  <article className="border border-gray-200 rounded-lg p-4" aria-labelledby="rev-prices-title">
                    <h3 id="rev-prices-title" className="text-xs text-gray-900 uppercase tracking-wider mb-2" style={{ fontWeight: 600 }}>
                      Valores
                    </h3>
                    <dl className="space-y-1 m-0">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-900">Preço base</dt>
                        <dd className="text-black m-0">{formatCurrency(basePrice)}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-900">Margem</dt>
                        <dd className="text-black m-0">{formatCurrency(margin)}</dd>
                      </div>
                      <div className="flex justify-between text-sm border-t border-gray-100 pt-1 mt-1">
                        <dt className="text-black" style={{ fontWeight: 600 }}>Total ao paciente</dt>
                        <dd className="text-black m-0" style={{ fontWeight: 700 }}>{formatCurrency(finalPrice)}</dd>
                      </div>
                    </dl>
                  </article>
                </div>
                <ul className="list-none p-0 m-0">
                  {items.map((item) => (
                    <li key={item.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-black text-sm m-0" style={{ fontWeight: 600 }}>
                          {item.name}
                        </h3>
                        <span className="text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {item.quantity}x · {item.packaging}
                        </span>
                      </div>
                      <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                        {item.ingredients.filter((i) => i.name).map((ing) => (
                          <li key={ing.id} className="text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-900">
                            {ing.name} {ing.quantity}
                          </li>
                        ))}
                      </ul>
                      {item.observations && (
                        <p className="text-xs text-gray-900 mt-2 m-0">Obs: {item.observations}</p>
                      )}
                    </li>
                  ))}
                </ul>
                {nutritionalObservations && (
                  <aside className="border border-gray-200 rounded-lg p-4" aria-labelledby="rev-notes-title">
                    <h3 id="rev-notes-title" className="text-xs text-gray-900 uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
                      Observações nutricionais
                    </h3>
                    <p className="text-gray-900 text-sm m-0">{nutritionalObservations}</p>
                  </aside>
                )}
              </section>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center justify-between" aria-label="Navegação entre etapas">
            <button
              onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate("/nutricionista/dashboard"))}
              className="border border-gray-300 text-gray-900 px-4 py-2.5 rounded-md text-sm hover:border-black transition-colors"
              style={{ fontWeight: 500 }}
              type="button"
            >
              {step === 0 ? "Cancelar" : "Voltar"}
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
                style={{ fontWeight: 600 }}
                type="button"
              >
                Continuar <ArrowRight className="w-4 h-4" aria-hidden="true" focusable="false" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
                style={{ fontWeight: 600 }}
                type="button"
                aria-busy={submitting}
              >
                {submitting ? "Enviando para a fábrica..." : "Criar pedido e enviar para fábrica"}
              </button>
            )}
          </nav>
        </>
      )}

      {/* Step 4: Success + Code */}
      {step === 4 && (
        <section
          className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-lg mx-auto"
          role="status"
          aria-live="polite"
          aria-labelledby="step-success-title"
        >
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <Check className="w-6 h-6 text-white" aria-hidden="true" focusable="false" />
          </div>
          <h2 id="step-success-title" style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.02em" }} className="mb-2">
            Pedido criado!
          </h2>
          <p className="text-gray-900 text-sm mb-6">
            Pedido enviado para {selectedFactory?.name || "fábrica"}. Compartilhe o código com {selectedPatient?.name || "o paciente"} para acompanhamento.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-900 mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }} id="generated-code-label">Código do pedido</p>
            <p
              className="text-black"
              style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "0.1em" }}
              aria-labelledby="generated-code-label"
            >
              {generatedCode}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 flex items-center gap-2">
            <span className="flex-1 text-sm text-gray-900 truncate text-left" aria-label="Link de acompanhamento">
              {window.location.origin}/paciente/pedido/{generatedCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-md text-xs hover:bg-gray-900 shrink-0"
              style={{ fontWeight: 500 }}
              type="button"
              aria-label={copied ? "Link copiado" : "Copiar link de acompanhamento"}
            >
              {copied ? (
                <Check className="w-3 h-3" aria-hidden="true" focusable="false" />
              ) : (
                <Copy className="w-3 h-3" aria-hidden="true" focusable="false" />
              )}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate(createdOrderId ? `/nutricionista/pedidos/${createdOrderId}` : "/nutricionista/dashboard")
              }
              className="flex-1 border border-gray-300 text-gray-900 py-2.5 rounded-md text-sm hover:border-black transition-colors"
              style={{ fontWeight: 500 }}
              type="button"
            >
              Ver resumo
            </button>
            <button
              onClick={() => navigate("/nutricionista/dashboard")}
              className="flex-1 bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-900 transition-colors"
              style={{ fontWeight: 600 }}
              type="button"
            >
              Ir ao dashboard
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
