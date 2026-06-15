"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/audit-logs`);
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created": return <span className="bg-sage/20 text-sage px-2 py-1 rounded text-xs font-bold uppercase">Creado</span>;
      case "updated": return <span className="bg-tertiary-container/30 text-tertiary px-2 py-1 rounded text-xs font-bold uppercase">Modificado</span>;
      case "deleted": return <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Eliminado</span>;
      default: return <span className="bg-latte/20 text-espresso px-2 py-1 rounded text-xs font-bold uppercase">{action}</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-espresso font-bold">Cargando registros inmutables...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">Pista de Auditoría (Logs Inmutables)</h2>
        <p className="text-on-surface-variant font-body-md text-sm md:text-base">Historial inalterable de todos los cambios de base de datos.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 border-b border-latte/30 text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Tabla Afectada</th>
                <th className="px-6 py-4 font-semibold">Acción</th>
                <th className="px-6 py-4 font-semibold">Detalles Técnicos (JSON)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/20 font-body-md">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No hay registros de auditoría aún.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-mist/50 transition-colors align-top">
                    <td className="px-6 py-4 text-xs font-mono text-on-surface-variant whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-espresso">
                      {log.user?.name || "Sistema"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-latte/20 px-2 py-0.5 rounded">{log.table_name}</span>
                      <span className="text-xs text-on-surface-variant ml-2">ID: {log.record_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        {log.old_values && Object.keys(log.old_values).length > 0 && (
                          <div className="bg-error/5 p-2 rounded border border-error/20 flex-1">
                            <span className="text-[10px] uppercase font-bold text-error mb-1 block">Valor Anterior</span>
                            <pre className="text-[10px] text-on-surface-variant overflow-x-auto">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_values && Object.keys(log.new_values).length > 0 && (
                          <div className="bg-sage/5 p-2 rounded border border-sage/20 flex-1">
                            <span className="text-[10px] uppercase font-bold text-sage mb-1 block">Valor Nuevo</span>
                            <pre className="text-[10px] text-on-surface-variant overflow-x-auto">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
