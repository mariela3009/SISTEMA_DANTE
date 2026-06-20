"use client";
import { API_BASE_URL, apiFetch } from "@/app/lib/api";
import { useEffect, useState } from "react";
import KPICardDark from "@/app/components/KPICardDark";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ForecastData {
  days_history: number;
  days_forecast: number;
  predictions: any[];
}

export default function DemandForecastTab() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/ai/demand-forecast`);
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

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <span className="material-symbols-outlined text-green-500">trending_up</span>;
    if (trend === 'down') return <span className="material-symbols-outlined text-red-500">trending_down</span>;
    return <span className="material-symbols-outlined text-yellow-500">trending_flat</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm">Ejecutando modelos predictivos de demanda...</p>
      </div>
    );
  }

  if (!data || data.predictions.length === 0) {
    return (
      <div className="bg-mist border border-latte rounded-xl p-12 text-center">
        <span className="material-symbols-outlined text-5xl opacity-50 block mb-3">auto_graph</span>
        <h3 className="font-bold text-xl text-espresso mb-2">No hay suficientes datos</h3>
        <p className="text-on-surface-variant">Se necesita más historial de ventas para generar proyecciones de demanda por IA.</p>
      </div>
    );
  }

  const selectedPrediction = data.predictions[selectedProductIdx];
  
  // Combine historical and forecast for the chart
  const chartData = [
    ...selectedPrediction.historical_series.map((item: any) => ({
      date: item.date.substring(5), // mm-dd
      histórico: item.quantity,
      proyectado: null
    })),
    ...selectedPrediction.forecast_series.map((item: any) => ({
      date: item.date.substring(5),
      histórico: null,
      proyectado: item.quantity
    }))
  ];

  // Connect the lines by adding the last historical point to the projected series
  if (selectedPrediction.historical_series.length > 0 && selectedPrediction.forecast_series.length > 0) {
    const lastHist = selectedPrediction.historical_series[selectedPrediction.historical_series.length - 1];
    const connectionPoint = {
      date: lastHist.date.substring(5),
      histórico: null,
      proyectado: lastHist.quantity
    };
    chartData.splice(selectedPrediction.historical_series.length, 0, connectionPoint);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-espresso">Predicción de Demanda ({data.days_forecast} Días)</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Algoritmos predictivos estiman la demanda futura basados en los últimos {data.days_history} días de ventas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista de Top Productos */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          <h3 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-2">Top Proyecciones</h3>
          {data.predictions.map((pred: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedProductIdx(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedProductIdx === idx 
                  ? 'bg-primary/5 border-primary shadow-sm' 
                  : 'bg-surface border-latte hover:bg-mist/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-espresso line-clamp-1 flex-1 pr-2">{pred.product.name}</h4>
                {getTrendIcon(pred.metrics.trend)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="bg-mist p-2 rounded-lg">
                  <span className="text-xs text-on-surface-variant block">Proyección</span>
                  <span className="font-bold text-espresso">{pred.metrics.predicted_total} uds</span>
                </div>
                <div className="bg-mist p-2 rounded-lg">
                  <span className="text-xs text-on-surface-variant block">Crecimiento</span>
                  <span className={`font-bold ${pred.metrics.growth_percentage > 0 ? 'text-green-600' : pred.metrics.growth_percentage < 0 ? 'text-red-600' : 'text-espresso'}`}>
                    {pred.metrics.growth_percentage > 0 ? '+' : ''}{pred.metrics.growth_percentage}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Gráfico principal */}
        <div className="lg:col-span-2 bg-surface border border-latte rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-xl text-espresso mb-1">{selectedPrediction.product.name}</h3>
              <p className="text-sm text-on-surface-variant">Confianza del modelo: {selectedPrediction.metrics.confidence}%</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
              {data.days_history} días históricos → {data.days_forecast} días proy.
            </div>
          </div>

          <div className="flex-1 min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6B7280'}} tickMargin={10} minTickGap={30} />
                <YAxis tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="histórico" 
                  stroke="#4B5563" 
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#4B5563', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Venta Histórica"
                />
                
                <Line 
                  type="monotone" 
                  dataKey="proyectado" 
                  stroke="#D97706" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#D97706', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Proyección IA"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-latte">
            <div className="text-center">
              <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">Venta Histórica ({data.days_history}d)</span>
              <span className="text-2xl font-black text-espresso">{selectedPrediction.metrics.historical_total}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">Demanda Prevista ({data.days_forecast}d)</span>
              <span className="text-2xl font-black text-primary">{selectedPrediction.metrics.predicted_total}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-on-surface-variant uppercase font-bold block mb-1">Variación Diaria</span>
              <span className={`text-2xl font-black ${selectedPrediction.metrics.growth_percentage > 0 ? 'text-green-600' : selectedPrediction.metrics.growth_percentage < 0 ? 'text-red-600' : 'text-espresso'}`}>
                {selectedPrediction.metrics.growth_percentage > 0 ? '+' : ''}{selectedPrediction.metrics.growth_percentage}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
