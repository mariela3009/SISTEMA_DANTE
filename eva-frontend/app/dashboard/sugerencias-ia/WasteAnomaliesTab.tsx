"use client";
import { API_BASE_URL, apiFetch } from "@/app/lib/api";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WasteData {
  days_window: number;
  total_anomalies: number;
  data: any[];
}

export default function WasteAnomaliesTab() {
  const [data, setData] = useState<WasteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIngredientIdx, setSelectedIngredientIdx] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/ai/waste-anomalies`);
      if (res && res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm">Analizando desviaciones estadísticas de mermas...</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-green-500 block mb-3">verified</span>
        <h3 className="font-bold text-xl text-green-800 mb-2">Mermas Controladas</h3>
        <p className="text-green-700">No se han detectado anomalías o picos inusuales de desperdicio en los últimos {data?.days_window || 60} días.</p>
      </div>
    );
  }

  const selectedData = data.data[selectedIngredientIdx];
  
  const chartData = selectedData.chart_data.map((item: any) => ({
    date: item.date,
    cantidad: item.quantity,
    is_anomaly: item.is_anomaly,
    z_score: item.z_score
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-espresso">Detección de Anomalías ({data.days_window} Días)</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Se encontraron <span className="font-bold text-terracota">{data.total_anomalies} incidentes</span> matemáticamente atípicos basados en el promedio de uso.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Ingredientes con Anomalías */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          <h3 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-2">Ingredientes Afectados</h3>
          {data.data.map((ingData: any, idx: number) => {
            const hasHighSeverity = ingData.incidents.some((i: any) => i.severity === 'high');
            return (
              <button
                key={idx}
                onClick={() => setSelectedIngredientIdx(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedIngredientIdx === idx 
                    ? 'bg-red-50 border-red-200 shadow-sm' 
                    : 'bg-surface border-latte hover:bg-mist/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-espresso line-clamp-1 flex-1 pr-2">{ingData.ingredient.name}</h4>
                  <span className={`material-symbols-outlined ${hasHighSeverity ? 'text-red-600' : 'text-orange-500'}`}>
                    warning
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-3">
                  <span className="text-on-surface-variant">Incidentes: <span className="font-bold text-terracota">{ingData.incidents.length}</span></span>
                  <span className="text-xs px-2 py-1 bg-white rounded-md border border-latte/50 shadow-sm">
                    Media: {ingData.mean} {ingData.ingredient.unit}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Gráfico principal y Detalles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-latte rounded-xl p-5 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-xl text-espresso mb-1">
                  Mermas de {selectedData.ingredient.name}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Media esperada: <b>{selectedData.mean}</b> {selectedData.ingredient.unit} / día (Desviación: ±{selectedData.std_dev})
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6B7280'}} tickMargin={10} minTickGap={20} />
                  <YAxis tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} ${selectedData.ingredient.unit} (Z-Score: ${props.payload.z_score})`,
                      'Cantidad Mermada'
                    ]}
                  />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                    {
                      chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.is_anomaly ? '#ef4444' : '#d1d5db'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-surface border border-latte rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-espresso mb-4">Detalle de Anomalías Detectadas</h3>
            <div className="space-y-3">
              {selectedData.incidents.map((incident: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 rounded-lg bg-red-50 border border-red-100">
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${incident.severity === 'high' ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'}`}>
                    <span className="material-symbols-outlined text-sm">priority_high</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-espresso text-sm">
                      {incident.date} <span className="ml-2 font-normal text-on-surface-variant text-xs">Z-Score: {incident.z_score}</span>
                    </h4>
                    <p className="text-sm mt-1 text-espresso">
                      Se registró una merma de <b>{incident.quantity} {selectedData.ingredient.unit}</b>, cuando lo normal es <b>{incident.expected}</b>.
                    </p>
                    <p className="text-xs text-terracota mt-2 font-medium">
                      {incident.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
