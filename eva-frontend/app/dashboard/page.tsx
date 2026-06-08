"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("eva_token");
        const res = await fetch("http://localhost:8000/api/dashboard/stats", {
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-latte/30 flex flex-col justify-center items-center">
          <span className="material-symbols-outlined text-4xl text-terracota mb-2">payments</span>
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Ingresos Totales</h3>
          <p className="font-headline-xl text-3xl text-espresso">S/ {stats?.ingresos ? Number(stats.ingresos).toFixed(2) : "0.00"}</p>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-latte/30 flex flex-col justify-center items-center">
          <span className="material-symbols-outlined text-4xl text-terracota mb-2">receipt_long</span>
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Ventas Realizadas</h3>
          <p className="font-headline-xl text-3xl text-espresso">{stats?.ventas_totales || 0}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-latte/30 flex flex-col justify-center items-center">
          <span className="material-symbols-outlined text-4xl text-terracota mb-2">local_atm</span>
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Ticket Promedio</h3>
          <p className="font-headline-xl text-3xl text-espresso">S/ {stats?.ticket_promedio ? Number(stats.ticket_promedio).toFixed(2) : "0.00"}</p>
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
