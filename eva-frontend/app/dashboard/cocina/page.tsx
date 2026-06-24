"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function CocinaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState<any | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  /**
   * fetchOrders()
   * Obtiene la lista de pedidos activos directamente desde el backend.
   * Se ejecuta al cargar la página y luego automáticamente cada 3 segundos (Long polling).
   */
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

  /**
   * fetchAlerts()
   * Revisa si Caja/Despacho ha cancelado algún producto que ya estaba en la cocina.
   * Si encuentra una alerta, detiene la pantalla y reproduce un sonido de emergencia.
   */
  const fetchAlerts = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/kitchen/alerts`);
      if (res.ok) {
        const alerts = await res.json();
        if (alerts && alerts.length > 0) {
          // Si hay varias, tomamos la primera
          setEmergencyAlert(alerts[0]);
          playAlertSound();
        }
      }
    } catch (err) {
      console.error("Error fetching kitchen alerts:", err);
    }
  };

  const playAlertSound = () => {
    // Intentar reproducir sonido nativo si el navegador lo permite
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // 880 Hz
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const acknowledgeAlert = async (alertId: number) => {
    try {
      await apiFetch(`${API_BASE_URL}/api/kitchen/alerts/${alertId}/acknowledge`, {
        method: "POST"
      });
      setEmergencyAlert(null);
      fetchOrders(); // Actualizar comandas, el cancelado ya no debería estar
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAlerts();
    // Long polling: recargar cada 3 segundos para órdenes y alertas
    const intervalId = setInterval(() => {
      fetchOrders();
      fetchAlerts();
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  /**
   * changeStatus()
   * Avanza el estado de un producto individualmente.
   * Flujo: 'pending' (Pendiente) -> 'preparing' (Preparando) -> 'ready' (Listo).
   * Al enviarse al backend, esto también actualiza la pantalla de Despacho (Caja).
   */
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


  const getStatusColor = (item: any) => {
    if (item.is_cancelled) return 'bg-espresso/10 border-espresso/30 text-espresso opacity-60 grayscale';
    switch(item.status) {
      case 'pending': return 'bg-error/10 border-error/30 text-error';
      case 'preparing': return 'bg-tertiary-container/30 border-tertiary/30 text-tertiary';
      case 'ready': return 'bg-sage/20 border-sage/40 text-sage';
      default: return 'bg-latte/20 border-latte text-espresso';
    }
  };

  const getStatusText = (item: any) => {
    if (item.is_cancelled) return 'CANCELADO';
    switch(item.status) {
      case 'pending': return 'PENDIENTE';
      case 'preparing': return 'PREPARANDO';
      case 'ready': return 'LISTO';
      default: return item.status;
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/kitchen/history/cancelled`);
      if (res.ok) {
        setHistoryItems(await res.json());
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    fetchHistory();
  };

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center text-espresso font-semibold">Cargando comandas...</div>;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col relative">
      
      {/* Alerta de Emergencia */}
      {emergencyAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-error text-white animate-pulse">
          <div className="bg-black/20 absolute inset-0"></div>
          <div className="relative z-10 flex flex-col items-center justify-center max-w-3xl p-8 bg-error rounded-3xl shadow-2xl border-4 border-yellow-300">
            <span className="material-symbols-outlined text-[100px] text-yellow-300 mb-4 drop-shadow-lg">warning</span>
            <h1 className="text-5xl md:text-6xl font-black uppercase text-yellow-300 text-center tracking-widest drop-shadow-md mb-6">
              ¡Detener Preparación!
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-center mb-10 leading-relaxed">
              El producto <span className="bg-black/30 px-3 py-1 rounded mx-2 inline-block font-black">{emergencyAlert.product_name}</span> 
              del Pedido <span className="underline decoration-4 underline-offset-4 font-black">#{emergencyAlert.sale_id}</span> ha sido CANCELADO por Caja.
            </p>
            <button 
              onClick={() => acknowledgeAlert(emergencyAlert.id)}
              className="bg-white text-error font-black text-2xl px-12 py-5 rounded-full hover:bg-yellow-300 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95"
            >
              ENTENDIDO / CERRAR ALERTA
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-headline-lg text-3xl text-espresso mb-1">Monitor de Cocina (KDS)</h2>
          <p className="text-on-surface-variant font-body-md">Gestión de comandas en tiempo real.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={openHistory}
            className="flex items-center gap-2 bg-white text-espresso px-4 py-2 rounded-full border border-latte/40 hover:bg-mist transition-colors shadow-sm font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            Historial de Cancelados
          </button>
          <div className="flex items-center gap-2 bg-mist px-4 py-2 rounded-full border border-latte/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sage"></span>
            </span>
            <span className="font-label-md text-espresso font-bold text-sm">Sincronizado</span>
          </div>
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
                    <div key={item.id} className={`p-3 rounded-lg border flex flex-col gap-3 relative overflow-hidden ${getStatusColor(item)}`}>
                      
                      {item.is_cancelled && (
                        <div className="absolute inset-0 bg-espresso/5 flex items-center justify-center z-0 pointer-events-none">
                          <span className="text-4xl font-black text-espresso/10 -rotate-12 select-none tracking-widest">CANCELADO</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-start gap-3">
                          <span className={`font-bold text-lg px-2 rounded ${item.is_cancelled ? 'bg-transparent border border-espresso/30' : 'bg-white/50'}`}>{item.quantity}x</span>
                          <span className={`font-label-lg font-bold text-lg leading-tight ${item.is_cancelled ? 'line-through decoration-2 decoration-error/50' : ''}`}>{item.product_name}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end mt-2 flex-wrap relative z-10">
                        {(!item.is_cancelled && item.status === 'pending') && (
                          <button 
                            onClick={() => changeStatus(item.id, 'preparing')}
                            className="bg-tertiary text-white px-3 py-1.5 rounded-md font-bold text-xs uppercase shadow-sm hover:opacity-90 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">skillet</span>
                            Preparar
                          </button>
                        )}
                        {(!item.is_cancelled && item.status === 'preparing') && (
                          <button 
                            onClick={() => changeStatus(item.id, 'ready')}
                            className="bg-sage text-white px-3 py-1.5 rounded-md font-bold text-xs uppercase shadow-sm hover:opacity-90 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">done_all</span>
                            Marcar Listo
                          </button>
                        )}
                        {(!item.is_cancelled && item.status === 'ready') && (
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

      {/* Modal Historial de Cancelados */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 bg-espresso text-mist flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <span className="material-symbols-outlined">history</span>
                Historial de Productos Cancelados (Hoy)
              </h3>
              <button onClick={() => setShowHistory(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-surface-container-lowest">
              {historyItems.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant opacity-60">
                  <span className="material-symbols-outlined text-5xl mb-2">check_circle</span>
                  <p className="font-bold">No hay cancelaciones el día de hoy.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((hi: any) => (
                    <div key={hi.id} className="bg-white border border-latte p-4 rounded-xl shadow-sm flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-error/10 text-error p-3 rounded-full flex shrink-0">
                          <span className="material-symbols-outlined">cancel</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-espresso">{hi.quantity}x {hi.product_name}</span>
                            <span className="text-xs bg-mist px-2 py-0.5 rounded text-on-surface-variant font-bold border border-latte/50">Orden #{hi.sale_id}</span>
                          </div>
                          <p className="text-sm text-on-surface-variant mt-0.5">Cancelado a las {hi.cancelled_at} por {hi.user_name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
