"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { showToast } from "../../components/Toast";

export default function MermasPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ingredient_id: "", quantity: "", reason: ""
  });

  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem("eva_token");
      const res = await fetch(`${API_BASE_URL}/api/inventory/movements?type=salida_merma`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMovements(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("eva_user") || "{}");
    setUserRole(user.role || "");

    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem("eva_token");
        const res = await fetch(`${API_BASE_URL}/api/ingredients`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIngredients(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };
    
    fetchIngredients();
    fetchMovements();
  }, []);

  const handleCreateMerma = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("eva_token");
      const res = await fetch(`${API_BASE_URL}/api/inventory/merma`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ ingredient_id: "", quantity: "", reason: "" });
        fetchMovements();
        showToast("Merma solicitada. Pendiente de aprobación.", "warning");
      } else {
        const data = await res.json();
        showToast(data.message || "Error al registrar merma", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión con el servidor.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`¿Seguro que deseas ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} esta merma?`)) return;

    try {
      const token = localStorage.getItem("eva_token");
      const res = await fetch(`${API_BASE_URL}/api/inventory/merma/${id}/${action}`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        fetchMovements();
        showToast(action === 'approve' ? "Merma aprobada correctamente." : "Merma rechazada.", action === 'approve' ? "success" : "info");
      } else {
        const data = await res.json();
        showToast(data.message || "Error procesando solicitud", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión con el servidor.", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="bg-tertiary-container/30 text-tertiary px-2 py-1 rounded text-xs font-bold uppercase">Pendiente</span>;
      case "approved":
        return <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold uppercase">Aprobada</span>;
      case "rejected":
        return <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Rechazada</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">Registro de Mermas</h2>
          <p className="text-on-surface-variant font-body-md text-sm md:text-base">Solicita el descuento de inventario por productos caducados o accidentados.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-error text-white px-3 md:px-4 py-2 rounded-lg hover:bg-error/80 transition-colors font-label-lg whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          <span className="hidden md:inline">Solicitar Merma</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 border-b border-latte/30 text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Insumo</th>
                <th className="px-6 py-4 font-semibold">Cantidad</th>
                <th className="px-6 py-4 font-semibold">Motivo</th>
                <th className="px-6 py-4 font-semibold">Solicitante</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                {userRole === 'admin' && <th className="px-6 py-4 font-semibold text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/20 font-body-md">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">Cargando mermas...</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">No hay registros de mermas.</td>
                </tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-mist/50 transition-colors">
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(mov.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-label-lg text-espresso">
                      {mov.ingredient?.name}
                    </td>
                    <td className="px-6 py-4 text-error font-bold">
                      - {mov.quantity} {mov.ingredient?.unit}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant max-w-[200px] truncate" title={mov.reason}>
                      {mov.reason}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {mov.user?.name}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(mov.status)}
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 text-right">
                        {mov.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleAction(mov.id, 'approve')}
                              className="text-primary hover:text-white hover:bg-primary px-2 py-1 rounded transition-colors text-xs font-bold border border-primary"
                            >
                              Aprobar
                            </button>
                            <button 
                              onClick={() => handleAction(mov.id, 'reject')}
                              className="text-error hover:text-white hover:bg-error px-2 py-1 rounded transition-colors text-xs font-bold border border-error"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Solicitar Descuento por Merma">
        <form onSubmit={handleCreateMerma} className="space-y-4">
          <div>
            <label className="block font-label-md text-espresso mb-1">Insumo a descontar</label>
            <select 
              required
              value={formData.ingredient_id} onChange={e => setFormData({...formData, ingredient_id: e.target.value})}
              className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-error"
            >
              <option value="">Seleccione un insumo...</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name} (Stock: {ing.stock_actual} {ing.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-label-md text-espresso mb-1">Cantidad Mermada</label>
            <input 
              type="number" step="0.01" required min="0.01"
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
              className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-error"
            />
          </div>
          <div>
            <label className="block font-label-md text-espresso mb-1">Motivo / Explicación</label>
            <textarea 
              required minLength={5} rows={3}
              placeholder="Ej. El empaque se rompió, el producto caducó..."
              value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}
              className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-error"
            ></textarea>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-latte/50 rounded-lg text-espresso hover:bg-mist transition-colors font-label-md"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/80 transition-colors font-label-md disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
