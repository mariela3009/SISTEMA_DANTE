"use client";
import { API_BASE_URL } from "@/app/lib/api";
import { useEffect, useState } from "react";
import KPICardDark from "@/app/components/KPICardDark";
import { apiFetch } from "../../lib/api";

export default function RestockTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/ai/restock-suggestions`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUrgencyClasses = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'emergency';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getUrgencyLabel = (urgency: string, item: any) => {
    if (urgency === 'critical') return 'Crítico (≤3 días)';
    if (urgency === 'warning') return 'Advertencia (≤7 días)';
    if (item.metrics.days_remaining > 15 && item.ingredient.stock_actual <= item.ingredient.stock_minimo) {
      return 'Atención (Stock Bajo)';
    }
    return 'Atención (≤15 días)';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-espresso">Plan de Abastecimiento (30 Días)</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Basado en el historial de consumo, estas son las cantidades recomendadas a comprar para mantener stock operativo.
          </p>
        </div>
      </div>

      {data && data.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICardDark title="Insumos a Comprar" value={data.stats.total} icon="shopping_cart" />
          <KPICardDark title="Urgencia Crítica" value={data.stats.critical} icon="emergency" />
          <KPICardDark title="Advertencias" value={data.stats.warning} icon="warning" />
          <KPICardDark title="Atención Regular" value={data.stats.attention} icon="info" />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm">Analizando consumo y proyecciones...</p>
        </div>
      ) : !data || data.suggestions.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-green-500 block mb-3">verified</span>
          <h3 className="font-bold text-xl text-green-800 mb-2">¡Todo en orden!</h3>
          <p className="text-green-700">No hay recomendaciones de abastecimiento urgente en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.suggestions.map((item: any, idx: number) => (
            <div key={idx} className={`rounded-xl border shadow-sm p-5 flex flex-col ${getUrgencyClasses(item.suggestion.urgency)}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{item.ingredient.name}</h3>
                  <div className="flex items-center gap-1 text-sm opacity-80">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    Stock: {item.ingredient.stock_actual} {item.ingredient.unit} (Mín: {item.ingredient.stock_minimo})
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="material-symbols-outlined text-3xl opacity-80">{getUrgencyIcon(item.suggestion.urgency)}</span>
                  <span className="text-[10px] font-bold uppercase mt-1 opacity-90">{getUrgencyLabel(item.suggestion.urgency, item)}</span>
                </div>
              </div>

              <div className="bg-white/50 rounded-lg p-3 mb-4 space-y-2 text-sm text-espresso/80 border border-black/5">
                <div className="flex justify-between">
                  <span>Consumo Diario Promedio:</span>
                  <span className="font-bold">{item.metrics.daily_consumption} {item.ingredient.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Días Restantes Estimados:</span>
                  <span className="font-bold">{item.metrics.days_remaining} días</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-black/10 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold opacity-80 block">Comprar</span>
                  <span className="text-2xl font-black">
                    {item.suggestion.quantity_to_buy} <span className="text-sm font-normal opacity-80">{item.ingredient.unit}</span>
                  </span>
                </div>
                <button className="bg-white text-espresso px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-shadow text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  Añadir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
