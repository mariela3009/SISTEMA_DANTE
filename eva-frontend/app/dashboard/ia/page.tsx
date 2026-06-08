"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function IADashboardPage() {
  const [data, setData] = useState<any>({
    demand_forecast: [],
    combo_suggestion: [],
    restock_alert: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const res = await apiFetch("http://localhost:8000/api/ai/dashboard");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Error fetching AI data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAI();
  }, []);

  if (loading) return <div className="p-8 text-center text-espresso font-bold">Cargando modelos predictivos...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">Analítica Predictiva (IA)</h2>
        <p className="text-on-surface-variant font-body-md text-sm md:text-base">Recomendaciones y proyecciones basadas en modelos estocásticos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Demanda */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-latte/30 bg-mist flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">trending_up</span>
            <h3 className="font-headline-md text-lg text-espresso">Predicción de Demanda (Próximos 7 días)</h3>
          </div>
          <div className="p-4 flex-1 min-h-[300px]">
            {data.demand_forecast && data.demand_forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.demand_forecast} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #d4c4b7' }}
                    labelFormatter={(value) => `Fecha: ${value}`}
                  />
                  <Line type="monotone" dataKey="expected_sales" stroke="#ff7043" strokeWidth={3} dot={{r: 6}} activeDot={{r: 8}} name="Ventas Esperadas" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
                No hay datos de predicción disponibles. Ejecuta el motor de IA.
              </div>
            )}
          </div>
        </div>

        {/* Abastecimiento */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-error-container overflow-hidden flex flex-col">
          <div className="p-4 border-b border-error-container bg-error-container/40 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">shopping_cart</span>
            <h3 className="font-headline-md text-lg text-error">Alertas de Abastecimiento</h3>
          </div>
          <div className="p-0 flex-1 overflow-y-auto max-h-[300px]">
            {data.restock_alert && data.restock_alert.length > 0 ? (
              <ul className="divide-y divide-error/10">
                {data.restock_alert.map((alert: any, idx: number) => (
                  <li key={idx} className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-espresso">{alert.ingredient}</span>
                      <span className="text-xs font-bold bg-error text-white px-2 py-0.5 rounded uppercase">{alert.urgency}</span>
                    </div>
                    <p className="text-sm font-mono text-terracota mb-2">Sugerido: {alert.quantity} {alert.unit}</p>
                    <p className="text-xs text-on-surface-variant leading-tight">{alert.reason}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-on-surface-variant">Sin alertas preventivas.</div>
            )}
          </div>
        </div>

      </div>

      {/* Sugerencias de Combos */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
        <div className="p-4 border-b border-latte/30 bg-mist flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">group_work</span>
          <h3 className="font-headline-md text-lg text-espresso">Sugerencias de Combos Comerciales</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.combo_suggestion && data.combo_suggestion.length > 0 ? (
            data.combo_suggestion.map((combo: any, idx: number) => (
              <div key={idx} className="border border-latte border-dashed rounded-xl p-4 flex flex-col hover:bg-mist/30 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex -space-x-2">
                    {combo.products.map((p: string, pIdx: number) => (
                      <div key={pIdx} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm" title={p}>
                        {p.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-sage bg-sage/20 px-2 py-1 rounded-full">{Math.round(combo.confidence * 100)}% Match</span>
                </div>
                <h4 className="font-label-lg font-bold text-espresso mb-1">{combo.products.join(" + ")}</h4>
                <p className="text-xs text-on-surface-variant">{combo.reason}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-on-surface-variant">No hay sugerencias de combos disponibles.</div>
          )}
        </div>
      </div>

    </div>
  );
}
