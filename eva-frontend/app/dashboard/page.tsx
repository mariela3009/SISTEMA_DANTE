"use client";
import { API_BASE_URL } from "@/app/lib/api";
import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import KPICardDark from "@/app/components/KPICardDark";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("eva_token");
        const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Cargando métricas...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-lg text-3xl text-espresso mb-1">Resumen del Día</h2>
        <p className="text-on-surface-variant font-body-md">Métricas operativas de la fecha: {stats?.today || "Hoy"}</p>
      </div>

      {/* KPI Cards con Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICardDark 
          title="Ingresos Totales" 
          value={`S/ ${stats?.ingresos ? Number(stats.ingresos).toFixed(2) : "0.00"}`} 
          icon="payments"
          trend={stats?.trend_data?.length > 1 ? `${(((stats.trend_data[stats.trend_data.length-1].ingresos - stats.trend_data[stats.trend_data.length-2].ingresos) / (stats.trend_data[stats.trend_data.length-2].ingresos || 1)) * 100).toFixed(1)}%` : ""}
          trendLabel="Crecimiento"
        />
        <KPICardDark 
          title="Ventas Realizadas" 
          value={stats?.ventas_totales || 0} 
          icon="receipt_long"
        />
        <KPICardDark 
          title="Ticket Promedio" 
          value={`S/ ${stats?.ticket_promedio ? Number(stats.ticket_promedio).toFixed(2) : "0.00"}`} 
          icon="local_atm"
        />
      </div>

      {/* Gráficos de Tendencias (Estilo Dashboard Beige/Marrón) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Trend Area Chart */}
        <div className="bg-[#EAE1D0] rounded-xl shadow-md border border-[#D5C2A5] overflow-hidden p-6 relative">
          <h3 className="font-label-md text-espresso uppercase tracking-wider mb-6 font-bold">Tendencia de Ingresos Semanal</h3>
          <div className="h-64">
            {stats?.trend_data && stats.trend_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trend_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#6F4E37" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6F4E37" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#6F4E37', color: '#FFF', borderRadius: '8px', border: 'none' }} />
                  <Area 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#5C4033" 
                    strokeWidth={3}
                    fill="#7B5C46" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#6F4E37]">Sin datos suficientes</div>
            )}
          </div>
        </div>

        {/* Top Vendidos Bar Chart */}
        <div className="bg-[#EAE1D0] rounded-xl shadow-md border border-[#D5C2A5] overflow-hidden p-6 relative">
          <h3 className="font-label-md text-espresso uppercase tracking-wider mb-6 font-bold">Top 5 Productos Vendidos</h3>
          <div className="h-64">
            {stats?.top_vendidos && stats.top_vendidos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_vendidos} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" stroke="#6F4E37" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#6F4E37" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip cursor={{fill: '#D5C2A5'}} contentStyle={{ backgroundColor: '#6F4E37', color: '#FFF', borderRadius: '8px', border: 'none' }} />
                  <Bar dataKey="qty" fill="#5C4033" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#6F4E37]">Sin datos suficientes</div>
            )}
          </div>
        </div>
      </div>

      {/* Alertas y Top Ventas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Alertas de Stock */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-error-container overflow-hidden">
          <div className="bg-error-container/40 px-6 py-4 border-b border-error-container flex items-center gap-2">
            <span className="material-symbols-outlined text-error">warning</span>
            <h3 className="font-headline-md text-lg text-error">Alertas de Inventario</h3>
          </div>
          <div className="p-0">
            {stats?.alertas_insumos && stats.alertas_insumos.length > 0 ? (
              <ul className="divide-y divide-latte/20">
                {stats.alertas_insumos.map((insumo: any) => (
                  <li key={insumo.id} className="px-6 py-3 flex justify-between items-center">
                    <span className="font-label-lg text-espresso">{insumo.name}</span>
                    <span className="font-label-md bg-error/10 text-error px-2 py-1 rounded-md">
                      Stock: {insumo.stock_actual} {insumo.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-latte/50 mb-2 block">check_circle</span>
                No hay insumos con stock crítico.
              </div>
            )}
          </div>
        </div>

        {/* Top Vendidos */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
          <div className="bg-mist px-6 py-4 border-b border-latte/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-terracota">star</span>
            <h3 className="font-headline-md text-lg text-espresso">Top 5 Más Vendidos</h3>
          </div>
          <div className="p-0">
            {stats?.top_vendidos && stats.top_vendidos.length > 0 ? (
              <ul className="divide-y divide-latte/20">
                {stats.top_vendidos.map((prod: any, idx: number) => (
                  <li key={idx} className="px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-latte/20 flex items-center justify-center text-espresso font-label-md text-xs">{idx + 1}</span>
                      <span className="font-label-lg text-espresso">{prod.name}</span>
                    </div>
                    <span className="font-body-md text-on-surface-variant">{prod.qty} uds.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center text-on-surface-variant">
                Aún no hay ventas registradas hoy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
