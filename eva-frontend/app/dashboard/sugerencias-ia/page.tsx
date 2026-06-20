"use client";
import { API_BASE_URL } from "@/app/lib/api";
import { useEffect, useState } from "react";
import KPICardDark from "@/app/components/KPICardDark";
import { apiFetch } from "../../lib/api";
import RestockTab from "./RestockTab";
import DemandForecastTab from "./DemandForecastTab";
import WasteAnomaliesTab from "./WasteAnomaliesTab";

/* ─── Types ─────────────────────────────────────────────── */
interface Urgency {
  level: "critical" | "warning" | "attention";
  label: string;
  color: string;
  icon: string;
}

interface SuggestionIdea {
  product_name: string;
  suggested_price: number;
  category_name: string;
  description: string;
  full_recipe: {
    ingredient_id: number;
    ingredient_name: string;
    quantity: number;
    unit: string;
  }[];
}

interface IngredientSuggestion {
  ingredient: {
    id: number;
    name: string;
    unit: string;
    stock_actual: number;
    stock_minimo: number;
    fecha_vencimiento: string;
    dias_restantes: number;
  };
  urgency: Urgency;
  existing_products: { id: number; name: string; is_active: boolean }[];
  suggestions: SuggestionIdea[];
}

interface Stats {
  total_expiring: number;
  critical: number;
  warning: number;
  attention: number;
}

interface Category {
  id: number;
  name: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
const URGENCY_TEXT: Record<string, string> = {
  critical:  "text-red-700",
  warning:   "text-orange-700",
  attention: "text-yellow-700",
};
const URGENCY_BADGE: Record<string, string> = {
  critical:  "bg-red-50 text-red-700 border-red-200",
  warning:   "bg-orange-50 text-orange-700 border-orange-200",
  attention: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

/* ─── Component ──────────────────────────────────────────── */
export default function ExpiringSuggestionsPage() {
  const [data, setData] = useState<{ stats: Stats; suggestions: IngredientSuggestion[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysWindow, setDaysWindow] = useState(14);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'expiring' | 'restock' | 'demand' | 'anomalies'>('expiring');

  const toggleAccordion = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  // Create product modal state
  const [creating, setCreating] = useState<{ idea: SuggestionIdea; ingredient: IngredientSuggestion["ingredient"] } | null>(null);
  const [form, setForm] = useState<{ name: string; price: string; category_id: string; recipe_items: any[] }>({ name: "", price: "", category_id: "", recipe_items: [] });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/ai/expiring-suggestions?days=${daysWindow}`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [daysWindow]);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/categories`)
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : d.data ?? []));
  }, []);

  const openCreateModal = (idea: SuggestionIdea, ingredient: IngredientSuggestion["ingredient"]) => {
    const cat = categories.find(c => c.name === idea.category_name);
    setForm({
      name: idea.product_name,
      price: idea.suggested_price.toFixed(2),
      category_id: cat ? String(cat.id) : "",
      recipe_items: idea.full_recipe ? [...idea.full_recipe] : [],
    });
    setSuccessMsg("");
    setErrorMsg("");
    setCreating({ idea, ingredient });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creating) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/ai/expiring-suggestions/create-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          category_id: parseInt(form.category_id),
          recipe_items: form.recipe_items.map(item => ({
            ingredient_id: item.ingredient_id,
            quantity: parseFloat(item.quantity)
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear el producto");
      setSuccessMsg(`✅ ${data.message}`);
      fetchData(); // refrescar
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4 border-b border-latte/30 pb-2 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('expiring')}
            className={`pb-2 px-2 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'expiring' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-espresso'}`}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            Ideas para Menú
          </button>
          <button 
            onClick={() => setActiveTab('restock')}
            className={`pb-2 px-2 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'restock' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-espresso'}`}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Plan de Abastecimiento
          </button>
          <button 
            onClick={() => setActiveTab('demand')}
            className={`pb-2 px-2 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'demand' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-espresso'}`}
          >
            <span className="material-symbols-outlined">monitoring</span>
            Predicción de Demanda
          </button>
          <button 
            onClick={() => setActiveTab('anomalies')}
            className={`pb-2 px-2 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'anomalies' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-espresso'}`}
          >
            <span className="material-symbols-outlined">policy</span>
            Anomalías en Mermas
          </button>
        </div>
      </div>

      {activeTab === 'demand' ? (
        <DemandForecastTab />
      ) : activeTab === 'anomalies' ? (
        <WasteAnomaliesTab />
      ) : activeTab === 'restock' ? (
        <RestockTab />
      ) : (
        <>
          {/* Subheader for Expiring */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-on-surface-variant mt-1">
                Detecta ingredientes con fecha de vencimiento próxima y sugiere nuevos productos para aprovechar el stock.
              </p>
            </div>

        {/* Days filter */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-on-surface-variant">Ventana:</span>
          {[7, 14, 21].map(d => (
            <button
              key={d}
              onClick={() => setDaysWindow(d)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                daysWindow === d ? "bg-primary text-white" : "bg-latte/20 text-espresso hover:bg-latte/40"
              }`}
            >
              {d} días
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICardDark title="Total por vencer" value={data.stats.total_expiring} icon="hourglass_top" />
          <KPICardDark title="Crítico (≤3 días)" value={data.stats.critical} icon="emergency" />
          <KPICardDark title="Urgente (4-7 días)" value={data.stats.warning} icon="warning" />
          <KPICardDark title="Atención (8+ días)" value={data.stats.attention} icon="schedule" />
        </div>
      )}

      {/* Main content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm">Analizando inventario...</p>
        </div>
      ) : !data || data.suggestions.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-green-500 block mb-3">verified</span>
          <h3 className="font-bold text-green-700 text-lg">¡Todo en orden!</h3>
          <p className="text-green-600 text-sm mt-1">No hay insumos próximos a vencer en los próximos <strong>{daysWindow} días</strong>.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.suggestions.map((item, idx) => {
            const isOpen = expandedIndex === idx;
            return (
              <div key={idx} className="bg-white border border-latte/30 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                {/* Accordion Header (Barra Delgada) */}
                <button 
                  onClick={() => toggleAccordion(idx)}
                  className="w-full text-left p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 hover:bg-mist/50 transition-colors"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`material-symbols-outlined text-[24px] ${URGENCY_TEXT[item.urgency.level]}`}>{item.urgency.icon}</span>
                    <h3 className="font-bold text-lg text-espresso">{item.ingredient.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6 justify-end w-full sm:w-auto">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-0.5">Stock Actual</p>
                      <p className="text-sm font-semibold text-espresso">{item.ingredient.stock_actual} {item.ingredient.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-0.5">Vencimiento</p>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border shadow-sm ${URGENCY_BADGE[item.urgency.level]}`}>
                        {item.urgency.label} — {item.ingredient.dias_restantes} día{item.ingredient.dias_restantes !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="border-t border-latte/30 bg-mist/20 p-5 space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Existing products */}
                    {item.existing_products.length > 0 && (
                      <div className="text-xs text-espresso flex flex-wrap gap-2 items-center">
                        <span className="font-bold uppercase tracking-wider text-[10px]">Ya en menú:</span>
                        {item.existing_products.map(p => (
                          <span key={p.id} className={`px-2 py-0.5 rounded-md border shadow-sm ${p.is_active ? "bg-white text-espresso border-latte" : "bg-gray-100 text-gray-500 border-gray-200 line-through"}`}>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggestions Grid (Horizontal Flat Cards) */}
                    <div>
                      <p className="text-sm font-bold text-espresso uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-terracota text-[18px]">auto_awesome</span>
                        Ideas de productos sugeridos por IA
                      </p>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {item.suggestions.map((idea, sIdx) => (
                          <div key={sIdx} className="bg-white border border-latte/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative">
                            {/* Header: Title, Category, Price & Tooltip */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-base text-espresso truncate">{idea.product_name}</h4>
                                  <div className="group relative flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[16px] text-primary/70 hover:text-primary cursor-help transition-colors">info</span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-espresso text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-relaxed">
                                      {idea.description}
                                      {/* Tooltip arrow */}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-espresso"></div>
                                    </div>
                                  </div>
                                </div>
                                <span className="inline-block mt-1 bg-latte/20 text-espresso px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                  {idea.category_name}
                                </span>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="font-headline-md text-lg font-bold text-espresso">
                                  S/ {idea.suggested_price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Ingredients horizontal pills */}
                            {idea.full_recipe && idea.full_recipe.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {idea.full_recipe.map((ri, i) => (
                                  <span key={i} className="bg-mist border border-latte/50 text-espresso text-[10px] px-2 py-1 rounded-full whitespace-nowrap shadow-sm">
                                    <strong className="text-primary">{ri.quantity}{ri.unit}</strong> {ri.ingredient_name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Discret button aligned to right */}
                            <div className="flex justify-end mt-2 pt-3 border-t border-latte/20">
                              <button
                                onClick={() => openCreateModal(idea, item.ingredient)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary hover:text-white hover:bg-primary border border-primary hover:border-transparent rounded-lg transition-all"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Añadir al Menú
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Product Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !submitting && setCreating(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-latte/30 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-espresso text-lg">Crear Producto</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Usando <strong>{creating.ingredient.name}</strong> ({creating.ingredient.dias_restantes} días restantes)
                </p>
              </div>
              <button onClick={() => setCreating(null)} disabled={submitting} className="text-on-surface-variant hover:text-espresso p-1 rounded-lg">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm font-semibold">{successMsg}</div>
              )}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">{errorMsg}</div>
              )}

              <div>
                <label className="block text-sm font-semibold text-espresso mb-1">Nombre del producto</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-latte rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-1">Precio sugerido (S/)</label>
                  <input
                    type="number" required min="0" step="0.10" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-latte rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-1">Categoría</label>
                  <select
                    required value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-latte rounded-lg text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-espresso mb-2">Receta Completa</label>
                <div className="border border-latte rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto bg-latte/5">
                  {form.recipe_items.length === 0 ? (
                    <p className="text-xs text-on-surface-variant">No hay insumos en la receta.</p>
                  ) : (
                    form.recipe_items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 text-sm font-medium text-espresso bg-white border border-latte px-3 py-1.5 rounded-lg flex justify-between items-center">
                          <span className="truncate">{item.ingredient_name}</span>
                          <span className="text-xs text-on-surface-variant font-normal ml-2">{item.unit}</span>
                        </div>
                        <input
                          type="number" required min="0.001" step="0.001" value={item.quantity}
                          onChange={e => {
                            const newRecipe = [...form.recipe_items];
                            newRecipe[index].quantity = e.target.value;
                            setForm({ ...form, recipe_items: newRecipe });
                          }}
                          className="w-24 px-3 py-1.5 border border-latte rounded-lg text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                <strong>💡 Nota:</strong> El producto se creará activo con la receta completa generada por IA.
                Puedes editarla o modificarla más tarde en <em>Productos y Recetas</em>.
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-latte/30">
                <button type="button" onClick={() => setCreating(null)} disabled={submitting}
                  className="px-4 py-2 text-on-surface-variant hover:text-espresso text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-terracota transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/> Creando...</>
                    : <><span className="material-symbols-outlined text-[16px]">add_circle</span> Crear Producto</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
