"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function CocinaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/kitchen`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Long polling: recargar cada 5 segundos
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const changeStatus = async (itemId: number, newStatus: string) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/kitchen/${itemId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const cancelItem = async (itemId: number) => {
    if (!confirm("¿Seguro que deseas cancelar esta orden y devolver los insumos?")) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/kitchen/${itemId}/cancel`, {
        method: "POST"
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.message || "Error al cancelar orden");
      }
    } catch (err) {
      console.error("Error al cancelar:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-error/10 border-error/30 text-error';
      case 'preparing': return 'bg-tertiary-container/30 border-tertiary/30 text-tertiary';
      case 'ready': return 'bg-sage/20 border-sage/40 text-sage';
      default: return 'bg-latte/20 border-latte text-espresso';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'PENDIENTE';
      case 'preparing': return 'PREPARANDO';
      case 'ready': return 'LISTO';
      default: return status;
    }
  };

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center text-espresso font-semibold">Cargando comandas...</div>;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-headline-lg text-3xl text-espresso mb-1">Monitor de Cocina (KDS)</h2>
          <p className="text-on-surface-variant font-body-md">Gestión de comandas en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2 bg-mist px-4 py-2 rounded-full border border-latte/30">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sage"></span>
          </span>
          <span className="font-label-md text-espresso font-bold text-sm">Sincronizado</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
            <span className="material-symbols-outlined text-6xl mb-4">skillet</span>
            <p className="font-label-lg font-semibold text-xl">No hay comandas activas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            {orders.map(order => (
              <div key={order.sale_id} className="bg-surface-container-lowest rounded-xl shadow-md border border-latte/40 overflow-hidden flex flex-col">
                <div className="bg-espresso text-mist p-3 flex justify-between items-center shrink-0">
                  <div className="flex flex-col">
                    <span className="font-headline-md font-bold text-lg">Orden #{order.sale_id}</span>
                    <span className="text-xs font-mono opacity-80">{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold truncate max-w-[150px]">{order.client_name}</span>
                    <span className="text-xs opacity-80">Por: {order.user_name}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1">
                  {order.items.map((item: any) => (
                    <div key={item.id} className={`p-3 rounded-lg border flex flex-col gap-3 ${getStatusColor(item.status)}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <span className="font-bold text-lg bg-white/50 px-2 rounded">{item.quantity}x</span>
                          <span className="font-label-lg font-bold text-lg leading-tight">{item.product_name}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end mt-2 flex-wrap">
                        {(item.status === 'pending' || item.status === 'preparing') && (
                          <button 
                            onClick={() => cancelItem(item.id)}
                            className="bg-error/10 text-error px-2 py-1.5 rounded-md font-bold text-xs uppercase hover:bg-error/20 flex items-center gap-1 border border-error/30"
                            title="Cancelar orden y devolver insumos"
                          >
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Cancelar
                          </button>
                        )}
                        {item.status === 'pending' && (
                          <button 
                            onClick={() => changeStatus(item.id, 'preparing')}
                            className="bg-tertiary text-white px-3 py-1.5 rounded-md font-bold text-xs uppercase shadow-sm hover:opacity-90 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">skillet</span>
                            Preparar
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button 
                            onClick={() => changeStatus(item.id, 'ready')}
                            className="bg-sage text-white px-3 py-1.5 rounded-md font-bold text-xs uppercase shadow-sm hover:opacity-90 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">done_all</span>
                            Marcar Listo
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <button 
                            onClick={() => changeStatus(item.id, 'delivered')}
                            className="bg-espresso text-white px-3 py-1.5 rounded-md font-bold text-xs uppercase shadow-sm hover:opacity-90 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">room_service</span>
                            Entregar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
