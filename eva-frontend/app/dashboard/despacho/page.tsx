"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function DespachoPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToCancel, setItemToCancel] = useState<number | null>(null);

  /**
   * fetchOrders()
   * Obtiene la lista de pedidos en tiempo real desde el backend.
   * Se ejecuta de forma automática cada 5 segundos para mantener la pantalla actualizada.
   */
  const fetchOrders = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/kitchen`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, []);

  /**
   * changeStatus()
   * Permite marcar un producto individual como "Entregado".
   * Se oculta de la pantalla una vez que todos los productos del pedido se entregan.
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

  /**
   * confirmCancel()
   * Función para cancelar un producto específico (ej. si el cliente se arrepiente o no hay stock).
   * Envía una notificación inmediata a la cocina para que detengan la preparación.
   */
  const confirmCancel = async () => {
    if (itemToCancel === null) return;
    
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/kitchen/${itemToCancel}/cancel`, {
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
    } finally {
      setItemToCancel(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': 
        return <span className="text-[10px] bg-latte/30 text-espresso px-2 py-0.5 rounded font-bold uppercase">Pendiente</span>;
      case 'preparing': 
        return <span className="text-[10px] bg-tertiary-container/50 text-tertiary px-2 py-0.5 rounded font-bold uppercase animate-pulse">Preparando</span>;
      case 'ready': 
        return <span className="text-[10px] bg-sage text-white px-2 py-0.5 rounded font-bold uppercase shadow-sm">Listo</span>;
      case 'cancelled':
        return <span className="text-[10px] bg-error/20 text-error px-2 py-0.5 rounded font-bold uppercase shadow-sm">Cancelado</span>;
      default: 
        return null;
    }
  };

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center text-espresso font-semibold">Cargando monitor de pedidos...</div>;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-headline-lg text-3xl text-espresso mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">takeout_dining</span>
            Monitor de Pedidos (Caja)
          </h2>
          <p className="text-on-surface-variant font-body-md">Sigue el estado de preparación y entrega los pedidos a tus clientes.</p>
        </div>
        <div className="flex items-center gap-2 bg-mist px-4 py-2 rounded-full border border-latte/30">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sage"></span>
          </span>
          <span className="font-label-md text-espresso font-bold text-sm">Actualizado en vivo</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
            <span className="material-symbols-outlined text-6xl mb-4">check_circle</span>
            <p className="font-label-lg font-semibold text-xl">Todos los pedidos han sido entregados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {orders.map(order => {
              // Excluir cancelados y entregados para saber si el pedido está listo para entregar en su totalidad
              const activeItems = order.items.filter((i: any) => !i.is_cancelled && i.status !== 'delivered');
              const allReady = activeItems.length > 0 && activeItems.every((i: any) => i.status === 'ready');
              
              return (
                <div key={order.sale_id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all ${allReady ? 'border-sage/50 ring-2 ring-sage/20 shadow-sage/10' : 'border-latte/40'}`}>
                  
                  {/* Header de la Tarjeta */}
                  <div className={`p-3 flex justify-between items-center border-b ${allReady ? 'bg-sage/10 border-sage/20' : 'bg-mist border-latte/20'}`}>
                    <div>
                      <span className="font-bold text-espresso text-lg">Orden #{order.sale_id}</span>
                      <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-primary max-w-[120px] truncate" title={order.client_name}>
                        {order.client_name}
                      </div>
                      {allReady && (
                        <div className="text-[10px] font-bold text-sage uppercase mt-1 bg-sage/20 inline-block px-1.5 rounded">¡Pedido Listo!</div>
                      )}
                    </div>
                  </div>

                  {/* Lista de Items */}
                  <div className="p-3 space-y-2 flex-1">
                    {order.items.map((item: any) => (
                      <div key={item.id} className={`flex justify-between items-center gap-2 p-2 rounded-lg border transition-colors ${item.is_cancelled ? 'bg-surface-container-lowest border-latte/10 opacity-60' : 'bg-surface-container-lowest border-latte/20 hover:bg-mist/50'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`font-bold px-1.5 rounded text-xs ${item.is_cancelled ? 'text-on-surface-variant bg-latte/10' : 'text-espresso bg-latte/20'}`}>{item.quantity}x</span>
                          <span className={`font-medium text-sm truncate ${item.is_cancelled ? 'text-on-surface-variant line-through' : 'text-espresso'}`} title={item.product_name}>
                            {item.product_name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {item.is_cancelled 
                            ? <span className="text-[10px] bg-error/20 text-error px-2 py-0.5 rounded font-bold uppercase shadow-sm">Cancelado</span>
                            : getStatusBadge(item.status)
                          }
                          
                          {/* Botón de Entregar Individual */}
                          {item.status === 'ready' && !item.is_cancelled && (
                            <button 
                              onClick={() => changeStatus(item.id, 'delivered')}
                              className="ml-1 bg-primary text-white p-1 rounded-md hover:bg-terracota transition-colors shadow-sm"
                              title="Marcar como entregado al cliente"
                            >
                              <span className="material-symbols-outlined text-[16px] block">check</span>
                            </button>
                          )}

                          {/* Botón de Cancelar Individual */}
                          {item.status !== 'delivered' && !item.is_cancelled && (
                            <button 
                              onClick={() => setItemToCancel(item.id)}
                              className="ml-1 bg-error/10 text-error p-1 rounded-md hover:bg-error hover:text-white transition-colors shadow-sm"
                              title="Cancelar este producto"
                            >
                              <span className="material-symbols-outlined text-[16px] block">cancel</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer para Entrega Rápida si todo está listo */}
                  {allReady && (
                    <div className="p-3 bg-sage/5 border-t border-sage/20">
                      <button 
                        onClick={() => {
                          order.items.forEach((item: any) => {
                            if (item.status === 'ready') changeStatus(item.id, 'delivered');
                          });
                        }}
                        className="w-full py-2 bg-sage text-white rounded-lg font-bold text-sm shadow-sm hover:bg-sage/90 flex justify-center items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">room_service</span>
                        Entregar Pedido Completo
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Cancelación */}
      {itemToCancel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-latte scale-in-center">
            <div className="p-4 bg-error text-white flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Cancelar Producto
              </h3>
              <button onClick={() => setItemToCancel(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>
            
            <div className="p-6 bg-surface-container-lowest text-center">
              <span className="material-symbols-outlined text-6xl text-error mb-4">cancel</span>
              <p className="font-bold text-lg text-espresso mb-2">¿Estás seguro de cancelar este producto?</p>
              <p className="text-on-surface-variant text-sm mb-6">
                Esto enviará una <strong className="text-error">alerta inmediata</strong> a la cocina para detener la preparación y no podrá deshacerse.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setItemToCancel(null)}
                  className="px-6 py-2.5 rounded-full font-bold text-espresso bg-mist hover:bg-latte transition-colors"
                >
                  Regresar
                </button>
                <button 
                  onClick={confirmCancel}
                  className="px-6 py-2.5 rounded-full font-bold text-white bg-error hover:bg-red-700 shadow-md transition-colors flex items-center gap-2"
                >
                  Sí, Cancelar Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
