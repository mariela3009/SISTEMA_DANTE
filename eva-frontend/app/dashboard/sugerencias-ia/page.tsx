"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

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
const URGENCY_STYLES: Record<string, string> = {
  critical:  "bg-red-50 border-red-300 text-red-700",
  warning:   "bg-orange-50 border-orange-300 text-orange-700",
  attention: "bg-yellow-50 border-yellow-300 text-yellow-700",
};
const URGENCY_BADGE: Record<string, string> = {
  critical:  "bg-red-100 text-red-700",
  warning:   "bg-orange-100 text-orange-700",
  attention: "bg-yellow-100 text-yellow-700",
};

/* ─── Component ──────────────────────────────────────────── */
export default function ExpiringSuggestionsPage() {
  const [data, setData] = useState<{ stats: Stats; suggestions: IngredientSuggestion[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysWindow, setDaysWindow] = useState(14);
  const [categories, setCategories] = useState<Category[]>([]);

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            Sugerencias IA — Insumos por Vencer
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Detecta ingredientes con fecha de vencimiento próxima y sugiere nuevos productos para aprovechar el stock antes de que se pierda.
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total por vencer", value: data.stats.total_expiring, color: "text-espresso", bg: "bg-latte/20", icon: "hourglass_top" },
            { label: "Crítico (≤3 días)", value: data.stats.critical, color: "text-red-600", bg: "bg-red-50", icon: "emergency" },
            { label: "Urgente (4-7 días)", value: data.stats.warning, color: "text-orange-600", bg: "bg-orange-50", icon: "warning" },
            { label: "Atención (8+ días)", value: data.stats.attention, color: "text-yellow-600", bg: "bg-yellow-50", icon: "schedule" },
          ].map(kpi => (
            <div key={kpi.label} className={`${kpi.bg} border border-latte/30 rounded-xl p-4 flex items-center gap-3`}>
              <span className={`material-symbols-outlined ${kpi.color} text-[28px]`}>{kpi.icon}</span>
              <div>
                <p className="text-xs text-on-surface-variant">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            </div>
          ))}
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
          {data.suggestions.map((item, idx) => (
            <div
              key={idx}
              className={`border rounded-xl overflow-hidden shadow-sm ${URGENCY_STYLES[item.urgency.level]}`}
            >
              {/* Ingredient Header */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-current/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[26px]">{item.urgency.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{item.ingredient.name}</h3>
                    <p className="text-sm opacity-75">
                      Stock: <strong>{item.ingredient.stock_actual} {item.ingredient.unit}</strong>
                      &nbsp;·&nbsp;Vence: <strong>{new Date(item.ingredient.fecha_vencimiento + 'T00:00:00').toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${URGENCY_BADGE[item.urgency.level]}`}>
                    {item.urgency.label} — {item.ingredient.dias_restantes} día{item.ingredient.dias_restantes !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="bg-white/60 p-4 space-y-4">

                {/* Existing products using this ingredient */}
                {item.existing_products.length > 0 && (
                  <div className="text-xs text-on-surface-variant flex flex-wrap gap-2 items-center">
                    <span className="font-semibold">Ya en menú:</span>
                    {item.existing_products.map(p => (
                      <span key={p.id} className={`px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500 line-through"}`}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggestions grid */}
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                    Ideas de productos sugeridos por IA
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.suggestions.map((idea, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white border border-latte/40 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-espresso text-sm">{idea.product_name}</h4>
                            <span className="text-primary font-bold text-sm whitespace-nowrap ml-2">S/ {idea.suggested_price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">{idea.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold">{idea.category_name}</span>
                          </div>
                          {idea.full_recipe && idea.full_recipe.length > 0 && (
                            <div className="mt-3 bg-latte/10 p-2 rounded-lg border border-latte/30">
                              <p className="text-[10px] font-bold text-espresso uppercase mb-1">Receta generada:</p>
                              <ul className="text-[10px] text-on-surface-variant space-y-0.5 list-disc list-inside">
                                {idea.full_recipe.map((ri, i) => (
                                  <li key={i}>{ri.ingredient_name}: <span className="font-semibold text-espresso">{ri.quantity} {ri.unit}</span></li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => openCreateModal(idea, item.ingredient)}
                          className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-espresso text-mist rounded-lg text-xs font-semibold hover:bg-terracota transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          Crear este producto
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
