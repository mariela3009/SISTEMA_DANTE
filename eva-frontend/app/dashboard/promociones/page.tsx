"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { apiFetch } from "../../lib/api";
import { showToast } from "../../components/Toast";

export default function PromocionesPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editPromo, setEditPromo] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    discount_percentage: 0,
    start_date: "",
    end_date: "",
    is_active: true,
    product_ids: [] as number[]
  });

  const fetchData = async () => {
    try {
      const [promoRes, prodRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/api/promotions`),
        apiFetch(`${API_BASE_URL}/api/products?active=1`)
      ]);

      if (promoRes.ok && prodRes.ok) {
        setPromotions(await promoRes.json());
        setProducts(await prodRes.json());
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

  const resetForm = () => {
    setFormData({
      name: "", discount_percentage: 0, start_date: "", end_date: "", is_active: true, product_ids: []
    });
    setEditPromo(null);
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (promo: any) => {
    setFormData({
      name: promo.name,
      discount_percentage: promo.discount_percentage,
      start_date: promo.start_date.substring(0, 16),
      end_date: promo.end_date.substring(0, 16),
      is_active: promo.is_active,
      product_ids: promo.products ? promo.products.map((p: any) => p.id) : []
    });
    setEditPromo(promo);
    setIsModalOpen(true);
  };

  const handleProductToggle = (id: number) => {
    setFormData(prev => {
      const isSelected = prev.product_ids.includes(id);
      if (isSelected) {
        return { ...prev, product_ids: prev.product_ids.filter(p => p !== id) };
      } else {
        return { ...prev, product_ids: [...prev.product_ids, id] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Format dates to append seconds if not present (datetime required)
    const payload = {
      ...formData,
      start_date: formData.start_date.length === 16 ? `${formData.start_date}:00` : formData.start_date,
      end_date: formData.end_date.length === 16 ? `${formData.end_date}:00` : formData.end_date,
    };

    try {
      const url = editPromo 
        ? `${API_BASE_URL}/api/promotions/${editPromo.id}`
        : `${API_BASE_URL}/api/promotions`;
        
      const res = await apiFetch(url, {
        method: editPromo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchData();
        showToast(editPromo ? "Promoción actualizada correctamente." : "Promoción creada correctamente.", "success");
      } else {
        const data = await res.json();
        if (data.errors) {
          const first = Object.values(data.errors)[0] as string[];
          showToast(first[0], "error");
        } else {
          showToast(data.message || "Error al guardar promoción", "error");
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Error de conexión con el servidor.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar esta promoción?")) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/promotions/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">Promociones Programadas</h2>
          <p className="text-on-surface-variant font-body-md text-sm md:text-base">Gestiona descuentos temporales aplicables a productos.</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-terracota transition-colors font-label-lg whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">loyalty</span>
          <span className="hidden md:inline">Nueva Promoción</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 border-b border-latte/30 text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold text-right">Descuento</th>
                <th className="px-6 py-4 font-semibold">Vigencia</th>
                <th className="px-6 py-4 font-semibold">Productos</th>
                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/20 font-body-md">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">Cargando promociones...</td></tr>
              ) : promotions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">No hay promociones creadas.</td></tr>
              ) : (
                promotions.map((promo) => {
                  const isActiveNow = promo.is_active && new Date(promo.start_date) <= new Date() && new Date(promo.end_date) >= new Date();
                  
                  return (
                    <tr key={promo.id} className="hover:bg-mist/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-espresso">{promo.name}</td>
                      <td className="px-6 py-4 text-right font-bold text-terracota">-{promo.discount_percentage}%</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-on-surface-variant">Del: {new Date(promo.start_date).toLocaleString()}</div>
                        <div className="text-on-surface-variant">Al: {new Date(promo.end_date).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-latte/20 text-espresso text-xs px-2 py-1 rounded-full font-bold">
                          {promo.products?.length || 0} ítems
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isActiveNow ? (
                          <span className="bg-sage/20 text-sage px-2 py-1 rounded text-xs font-bold uppercase">Vigente</span>
                        ) : promo.is_active ? (
                          <span className="bg-tertiary-container/30 text-tertiary px-2 py-1 rounded text-xs font-bold uppercase">Programada / Vencida</span>
                        ) : (
                          <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Inactiva</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEdit(promo)} className="text-primary hover:text-terracota p-1">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(promo.id)} className="text-error hover:text-error/80 p-1 ml-2">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editPromo ? "Editar Promoción" : "Nueva Promoción"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-label-md text-espresso mb-1">Nombre de la Promoción</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:border-primary" placeholder="Ej. Black Friday" />
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Descuento (%)</label>
              <input type="number" required min="1" max="100" value={formData.discount_percentage} onChange={e => setFormData({...formData, discount_percentage: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg focus:border-primary" />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-latte text-primary focus:ring-primary" />
                <span className="font-label-md text-espresso">Activa / Habilitada</span>
              </label>
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Fecha de Inicio</label>
              <input type="datetime-local" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:border-primary" />
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Fecha de Fin</label>
              <input type="datetime-local" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:border-primary" />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block font-label-md text-espresso mb-2">Productos Participantes</label>
            <div className="max-h-48 overflow-y-auto border border-latte/30 rounded-lg p-2 space-y-1 bg-surface-container-lowest">
              {products.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-mist rounded cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.product_ids.includes(p.id)}
                    onChange={() => handleProductToggle(p.id)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-body-md text-espresso">{p.name} <span className="text-xs text-on-surface-variant">(S/ {p.price.toFixed(2)})</span></span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-espresso hover:bg-mist">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-terracota disabled:opacity-50">
              {isSubmitting ? "Guardando..." : "Guardar Promoción"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
