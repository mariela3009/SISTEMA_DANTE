"use client";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { apiFetch } from "../../lib/api";

export default function InventarioPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [pendingMermas, setPendingMermas] = useState<any[]>([]);

  // Create Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", unit: "ml", stock_minimo: 0, stock_actual: 0, fecha_vencimiento: ""
  });

  // Action states
  const [editIngredient, setEditIngredient] = useState<any>(null);
  const [entradaIngredient, setEntradaIngredient] = useState<any>(null);
  const [entradaData, setEntradaData] = useState({ quantity: 0, cost_per_unit: 0 });

  // Merma states
  const [isMermaModalOpen, setIsMermaModalOpen] = useState(false);
  const [mermaData, setMermaData] = useState({ product_id: "", quantity: 1, reason: "" });

  const fetchIngredients = async () => {
    try {
      const url = new URL("http://localhost:8000/api/ingredients");
      if (searchTerm) url.searchParams.append("search", searchTerm);
      if (statusFilter) url.searchParams.append("status", statusFilter);

      const res = await apiFetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setIngredients(data.data); // data.data because of pagination
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMermas = async () => {
    try {
      const res = await apiFetch("http://localhost:8000/api/inventory/movements?status=pending");
      if (res.ok) {
        const data = await res.json();
        setPendingMermas(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiFetch("http://localhost:8000/api/products");
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchPendingMermas();
    fetchProducts();
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sin_stock":
        return <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Sin Stock</span>;
      case "stock_bajo":
        return <span className="bg-terracota/20 text-terracota px-2 py-1 rounded text-xs font-bold uppercase">Stock Bajo</span>;
      case "vencido":
        return <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Vencido</span>;
      case "por_vencer":
        return <span className="bg-tertiary-container/30 text-tertiary px-2 py-1 rounded text-xs font-bold uppercase">Por Vencer</span>;
      default:
        return <span className="bg-latte/20 text-espresso px-2 py-1 rounded text-xs font-bold uppercase">Normal</span>;
    }
  };

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiFetch("http://localhost:8000/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", unit: "ml", stock_minimo: 0, stock_actual: 0, fecha_vencimiento: "" });
        fetchIngredients();
      } else {
        const data = await res.json();
        alert(data.message || "Error al crear insumo");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editIngredient) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`http://localhost:8000/api/ingredients/${editIngredient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setEditIngredient(null);
        fetchIngredients();
      } else {
        alert("Error al editar insumo");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIngredient = async (item: any) => {
    if (!confirm(`¿Estás seguro de que deseas desactivar el insumo "${item.name}"?`)) return;
    
    try {
      const res = await apiFetch(`http://localhost:8000/api/ingredients/${item.id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Insumo desactivado correctamente.");
        fetchIngredients();
      } else {
        alert(data.message || "Error al desactivar el insumo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red.");
    }
  };

  const handleEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entradaIngredient) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`http://localhost:8000/api/inventory/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ ingredient_id: entradaIngredient.id, ...entradaData }]
        })
      });
      if (res.ok) {
        setEntradaIngredient(null);
        setEntradaData({ quantity: 0, cost_per_unit: 0 });
        fetchIngredients();
      } else {
        alert("Error al registrar entrada");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (ing: any) => {
    setFormData({ 
      name: ing.name, unit: ing.unit, stock_minimo: ing.stock_minimo, 
      stock_actual: ing.stock_actual, fecha_vencimiento: ing.fecha_vencimiento || "" 
    });
    setEditIngredient(ing);
  };

  const handleMerma = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`http://localhost:8000/api/inventory/merma-producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mermaData)
      });
      if (res.ok) {
        setIsMermaModalOpen(false);
        setMermaData({ product_id: "", quantity: 1, reason: "" });
        fetchPendingMermas();
        alert("Merma solicitada correctamente. Pendiente de aprobación.");
      } else {
        const data = await res.json();
        alert(data.message || "Error al solicitar merma");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveMerma = async (movementId: number, approve: boolean) => {
    try {
      const endpoint = approve ? "approve" : "reject";
      const res = await apiFetch(`http://localhost:8000/api/inventory/merma/${movementId}/${endpoint}`, {
        method: "POST"
      });
      if (res.ok) {
        fetchPendingMermas();
        fetchIngredients();
      } else {
        const data = await res.json();
        alert(data.message || "Error procesando la merma");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">Inventario (Insumos)</h2>
          <p className="text-on-surface-variant font-body-md text-sm md:text-base">Gestiona los insumos y materias primas de la cafetería.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMermaModalOpen(true)}
            className="flex items-center gap-2 bg-error text-white px-3 md:px-4 py-2 rounded-lg hover:bg-error/90 transition-colors font-label-lg whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
            <span className="hidden md:inline">Mermar Producto</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-terracota transition-colors font-label-lg whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden md:inline">Nuevo Insumo</span>
          </button>
        </div>
      </div>

      {/* Pending Mermas section */}
      {pendingMermas.length > 0 && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4">
          <h3 className="text-error font-bold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Mermas Pendientes de Aprobación
          </h3>
          <div className="space-y-2">
            {pendingMermas.map(merma => (
              <div key={merma.id} className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-sm text-espresso">Insumo: {merma.ingredient?.name}</p>
                  <p className="text-xs text-on-surface-variant">Cant: {merma.quantity} {merma.ingredient?.unit} - Razón: {merma.reason}</p>
                  <p className="text-[10px] text-on-surface-variant/70">Solicitado por: {merma.user?.name}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveMerma(merma.id, true)} className="bg-sage text-white px-3 py-1.5 rounded text-xs font-bold hover:opacity-90">Aprobar</button>
                  <button onClick={() => handleApproveMerma(merma.id, false)} className="bg-espresso text-white px-3 py-1.5 rounded text-xs font-bold hover:opacity-90">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-latte/30 flex flex-col md:flex-row gap-4 bg-mist">
          <div className="relative flex-1 md:max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
            <input 
              type="text" 
              placeholder="Buscar insumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-latte/50 rounded-lg focus:outline-none focus:border-primary text-body-md"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-latte/50 rounded-lg focus:outline-none focus:border-primary text-body-md text-espresso"
          >
            <option value="">Todos los estados</option>
            <option value="stock_bajo">Stock Bajo</option>
            <option value="sin_stock">Sin Stock</option>
            <option value="por_vencer">Por Vencer</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 border-b border-latte/30 text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Insumo</th>
                <th className="px-6 py-4 font-semibold text-right">Stock Actual</th>
                <th className="px-6 py-4 font-semibold text-right">Costo Prom.</th>
                <th className="px-6 py-4 font-semibold text-right">Stock Mínimo</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/20 font-body-md">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">Cargando inventario...</td>
                </tr>
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">No se encontraron insumos.</td>
                </tr>
              ) : (
                ingredients.map((item) => (
                  <tr key={item.id} className="hover:bg-mist/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-label-lg text-espresso">{item.name}</p>
                      {item.fecha_vencimiento && (
                        <p className="text-xs text-on-surface-variant">Vence: {item.fecha_vencimiento}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-espresso">
                      {item.stock_actual} <span className="text-sm font-normal text-on-surface-variant">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-on-surface-variant">
                      S/ {item.costo_promedio ? Number(item.costo_promedio).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-right text-on-surface-variant">
                      {item.stock_minimo} {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(item.status)}
                        {!item.is_active && (
                          <span className="bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase">Inactivo</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setEntradaIngredient(item)}
                        className="text-primary hover:text-terracota p-1" title="Registrar Entrada"
                      >
                        <span className="material-symbols-outlined">add_box</span>
                      </button>
                      <button 
                        onClick={() => openEdit(item)}
                        className="text-on-surface-variant hover:text-espresso p-1 ml-2" title="Editar"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteIngredient(item)}
                        className="text-error hover:text-error/85 p-1 ml-2" title="Desactivar Insumo"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Insumo">
        <form onSubmit={handleCreateIngredient} className="space-y-4">
          <div>
            <label className="block font-label-md text-espresso mb-1">Nombre del Insumo</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-espresso mb-1">Unidad de Medida</label>
              <select 
                value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="ml">Mililitros (ml)</option>
                <option value="gr">Gramos (gr)</option>
                <option value="unidad">Unidades</option>
              </select>
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Stock Actual Inicial</label>
              <input 
                type="number" step="0.01" required min="0"
                value={formData.stock_actual} onChange={e => setFormData({...formData, stock_actual: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-espresso mb-1">Stock Mínimo</label>
              <input 
                type="number" step="0.01" required min="0"
                value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Fecha Vencimiento (opcional)</label>
              <input 
                type="date"
                value={formData.fecha_vencimiento} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})}
                className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
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
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-terracota transition-colors font-label-md disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Insumo"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editIngredient} onClose={() => setEditIngredient(null)} title="Editar Insumo">
        <form onSubmit={handleUpdateIngredient} className="space-y-4">
          <div>
            <label className="block font-label-md text-espresso mb-1">Nombre del Insumo</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-espresso mb-1">Unidad</label>
              <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="ml">Mililitros</option>
                <option value="gr">Gramos</option>
                <option value="unidad">Unidades</option>
              </select>
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Stock Mínimo</label>
              <input type="number" step="0.01" required min="0" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setEditIngredient(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg">{isSubmitting ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* Entrada Modal */}
      <Modal isOpen={!!entradaIngredient} onClose={() => setEntradaIngredient(null)} title={`Registrar Entrada: ${entradaIngredient?.name}`}>
        <form onSubmit={handleEntrada} className="space-y-4">
          <p className="text-sm text-on-surface-variant mb-4">Añade stock directamente al inventario (ej. llegada de proveedor).</p>
          <div>
            <label className="block font-label-md text-espresso mb-1">Cantidad a ingresar ({entradaIngredient?.unit})</label>
            <input type="number" step="0.01" required min="0.01" value={entradaData.quantity} onChange={e => setEntradaData({...entradaData, quantity: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-label-md text-espresso mb-1">Costo por Unidad de Medida (S/) (Opcional)</label>
            <input type="number" step="0.01" min="0" value={entradaData.cost_per_unit} onChange={e => setEntradaData({...entradaData, cost_per_unit: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setEntradaIngredient(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg">{isSubmitting ? "Guardando..." : "Registrar Entrada"}</button>
          </div>
        </form>
      </Modal>

      {/* Merma Modal */}
      <Modal isOpen={isMermaModalOpen} onClose={() => setIsMermaModalOpen(false)} title="Solicitar Merma de Producto">
        <form onSubmit={handleMerma} className="space-y-4">
          <p className="text-sm text-on-surface-variant mb-4">Mermar un producto terminado (ej. un café derramado) descontará automáticamente sus insumos de la receta.</p>
          <div>
            <label className="block font-label-md text-espresso mb-1">Producto</label>
            <select 
              required value={mermaData.product_id} 
              onChange={e => setMermaData({...mermaData, product_id: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Seleccione un producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-label-md text-espresso mb-1">Cantidad a mermar</label>
            <input type="number" step="1" required min="1" value={mermaData.quantity} onChange={e => setMermaData({...mermaData, quantity: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-label-md text-espresso mb-1">Motivo / Razón</label>
            <textarea required minLength={5} value={mermaData.reason} onChange={e => setMermaData({...mermaData, reason: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej. Accidente en cocina, producto en mal estado..."></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsMermaModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-error text-white rounded-lg">{isSubmitting ? "Enviando..." : "Solicitar Merma"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
