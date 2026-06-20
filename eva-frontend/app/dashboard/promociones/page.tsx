"use client";
import { API_BASE_URL } from "@/app/lib/api";
import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { apiFetch } from "../../lib/api";
import { showToast } from "../../components/Toast";

export default function PromocionesPage() {
  const [activeTab, setActiveTab] = useState<'ofertas' | 'ia'>('ofertas');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : (data.data || []));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">campaign</span>
            Ofertas Comerciales
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestiona descuentos, promociones y combos para atraer más clientes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-latte/30 pb-2">
        <button
          onClick={() => setActiveTab('ofertas')}
          className={`pb-2 px-2 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'ofertas' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-espresso'}`}
        >
          <span className="material-symbols-outlined">loyalty</span>
          Mis Ofertas
        </button>
        <button
          onClick={() => setActiveTab('ia')}
          className={`pb-2 px-2 text-lg font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'ia' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-espresso'}`}
        >
          <span className="material-symbols-outlined text-indigo-500">auto_awesome</span>
          Sugerencias IA
        </button>
      </div>

      <div className={activeTab === 'ofertas' ? 'block' : 'hidden'}>
        <OfertasTab products={products} />
      </div>
      <div className={activeTab === 'ia' ? 'block' : 'hidden'}>
        <SugerenciasIaTab onApplySuggestion={(sugg) => {
          document.dispatchEvent(new CustomEvent('applyAiCombo', { detail: sugg }));
          setActiveTab('ofertas');
        }} />
      </div>
    </div>
  );
}

// ─── OFERTAS UNIFICADAS (PROMOCIONES Y COMBOS) ──────────────────────────────

function OfertasTab({ products }: { products: any[] }) {
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state
  const [editOffer, setEditOffer] = useState<any>(null);
  const [offerType, setOfferType] = useState<'promotion' | 'combo'>('promotion');

  const emptyForm = {
    name: "", description: "", image_url: "", special_price: "", 
    discount_percentage: 0, is_active: true, start_date: "", end_date: "", 
    product_ids: [] as number[], // for promotions
    items: [] as { product_id: number; quantity: number }[] // for combos
  };
  const [formData, setFormData] = useState({ ...emptyForm });

  const fetchOfertas = async () => {
    setLoading(true);
    try {
      const [resPromos, resCombos] = await Promise.all([
        apiFetch(`${API_BASE_URL}/api/promotions`),
        apiFetch(`${API_BASE_URL}/api/combos`)
      ]);
      
      const promosData = resPromos.ok ? await resPromos.json() : [];
      const combosData = resCombos.ok ? await resCombos.json() : [];

      const combined = [
        ...promosData.map((p: any) => ({ ...p, offer_type: 'promotion' })),
        ...combosData.map((c: any) => ({ ...c, offer_type: 'combo' }))
      ];

      // Ordenar por fecha de creación (si la tuvieran) o simplemente por nombre
      combined.sort((a, b) => a.name.localeCompare(b.name));
      setOfertas(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfertas();

    const handleApplyAiCombo = (e: any) => {
      const sugg = e.detail;
      setOfferType('combo');
      setEditOffer(null);
      setFormData({
        ...emptyForm,
        name: sugg.suggested_name,
        special_price: String(sugg.suggested_price),
        items: sugg.items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity }))
      });
      setIsModalOpen(true);
    };

    document.addEventListener('applyAiCombo', handleApplyAiCombo);
    return () => document.removeEventListener('applyAiCombo', handleApplyAiCombo);
  }, []);

  const resetForm = () => { 
    setFormData({ ...emptyForm }); 
    setEditOffer(null); 
    setOfferType('promotion');
  };

  const openEdit = (offer: any) => {
    setOfferType(offer.offer_type);
    setEditOffer(offer);
    
    setFormData({
      ...emptyForm,
      name: offer.name,
      description: offer.description || "",
      image_url: offer.image_url || "",
      special_price: offer.special_price || "",
      discount_percentage: offer.discount_percentage || 0,
      is_active: offer.is_active,
      start_date: offer.start_date?.substring(0, 16) || "",
      end_date: offer.end_date?.substring(0, 16) || "",
      product_ids: offer.offer_type === 'promotion' ? (offer.products ? offer.products.map((p: any) => p.id) : []) : [],
      items: offer.offer_type === 'combo' ? (offer.items ? offer.items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity })) : []) : []
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = async (offer: any) => {
    if (!confirm(`¿Deseas eliminar esta ${offer.offer_type === 'combo' ? 'oferta' : 'promoción'}?`)) return;
    try {
      const endpoint = offer.offer_type === 'combo' ? 'combos' : 'promotions';
      const res = await apiFetch(`${API_BASE_URL}/api/${endpoint}/${offer.id}`, { method: "DELETE" });
      if (res.ok) { 
        fetchOfertas(); 
        showToast("Oferta eliminada.", "info"); 
      }
    } catch (e) { console.error(e); }
  };

  // Funciones específicas para Combo
  const toggleComboItemProduct = (productId: number) => {
    setFormData(prev => {
      const exists = prev.items.find(i => i.product_id === productId);
      if (exists) return { ...prev, items: prev.items.filter(i => i.product_id !== productId) };
      return { ...prev, items: [...prev.items, { product_id: productId, quantity: 1 }] };
    });
  };

  const updateComboItemQty = (productId: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.product_id === productId ? { ...i, quantity } : i)
    }));
  };

  const getComboOriginalTotal = () =>
    formData.items.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.product_id);
      return sum + (prod?.price || 0) * item.quantity;
    }, 0);

  // Funciones específicas para Promoción
  const handlePromoProductToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(id)
        ? prev.product_ids.filter(p => p !== id)
        : [...prev.product_ids, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let payload: any = {};
    let endpoint = "";

    if (offerType === 'promotion') {
      endpoint = "promotions";
      payload = {
        name: formData.name,
        discount_percentage: formData.discount_percentage,
        is_active: formData.is_active,
        start_date: formData.start_date.length === 16 ? `${formData.start_date}:00` : formData.start_date,
        end_date: formData.end_date.length === 16 ? `${formData.end_date}:00` : formData.end_date,
        product_ids: formData.product_ids
      };
    } else {
      endpoint = "combos";
      if (formData.items.length < 2) { 
        showToast("Un combo debe tener al menos 2 productos.", "error"); 
        setIsSubmitting(false); 
        return; 
      }
      payload = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        special_price: parseFloat(String(formData.special_price)) || 0,
        is_active: formData.is_active,
        start_date: formData.start_date ? (formData.start_date.length === 16 ? `${formData.start_date}:00` : formData.start_date) : null,
        end_date: formData.end_date ? (formData.end_date.length === 16 ? `${formData.end_date}:00` : formData.end_date) : null,
        items: formData.items
      };
    }

    try {
      const url = editOffer ? `${API_BASE_URL}/api/${endpoint}/${editOffer.id}` : `${API_BASE_URL}/api/${endpoint}`;
      const res = await apiFetch(url, { 
        method: editOffer ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      
      if (res.ok) {
        setIsModalOpen(false); 
        resetForm(); 
        fetchOfertas();
        showToast(editOffer ? "Oferta actualizada." : "Oferta creada.", "success");
      } else {
        const data = await res.json();
        const errMsg = data.errors ? Object.values(data.errors).flat().join(". ") : data.message || "Error";
        showToast(errMsg, "error");
      }
    } catch (e) { showToast("Error de conexión.", "error"); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-terracota transition-colors font-label-lg">
          <span className="material-symbols-outlined text-[20px]">add</span>Nueva Oferta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-on-surface-variant">Cargando ofertas...</div>
        ) : ofertas.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] text-latte block mb-2">loyalty</span>
            No hay ofertas creadas.
          </div>
        ) : ofertas.map(oferta => (
          <div key={`${oferta.offer_type}_${oferta.id}`} className="bg-surface-container-lowest border border-latte/30 rounded-xl shadow-sm overflow-hidden flex flex-col relative group">
            
            {oferta.offer_type === 'combo' && oferta.image_url && (
              <div className="h-32 bg-mist w-full">
                <img src={oferta.image_url} alt={oferta.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {oferta.offer_type === 'promotion' ? (
                      <span className="bg-terracota/20 text-terracota text-[10px] px-2 py-0.5 rounded uppercase font-bold">Descuento %</span>
                    ) : (
                      <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded uppercase font-bold">Combo Fijo</span>
                    )}
                    
                    {oferta.is_currently_active ? (
                      <span className="text-[10px] bg-sage text-white px-2 py-0.5 rounded font-bold uppercase shadow-sm">Vigente</span>
                    ) : oferta.is_active ? (
                      <span className="text-[10px] bg-latte/50 text-espresso px-2 py-0.5 rounded font-bold uppercase shadow-sm">Programada</span>
                    ) : (
                      <span className="text-[10px] bg-error text-white px-2 py-0.5 rounded font-bold uppercase shadow-sm">Inactiva</span>
                    )}
                  </div>
                  <h3 className="font-bold text-espresso text-lg leading-tight">{oferta.name}</h3>
                  {oferta.description && <p className="text-xs text-on-surface-variant mt-1">{oferta.description}</p>}
                </div>
              </div>

              {oferta.offer_type === 'promotion' ? (
                <div className="my-3">
                  <span className="text-3xl font-black text-terracota">-{oferta.discount_percentage}%</span>
                  <div className="text-xs text-on-surface-variant mt-2">
                    Aplica a <span className="font-bold">{oferta.products?.length || 0} productos</span>.
                  </div>
                </div>
              ) : (
                <div className="my-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">S/ {oferta.special_price?.toFixed(2)}</span>
                    {oferta.original_price > 0 && (
                      <span className="text-sm text-on-surface-variant line-through">S/ {oferta.original_price?.toFixed(2)}</span>
                    )}
                  </div>
                  {oferta.savings_percentage > 0 && (
                    <span className="inline-block mt-1 text-xs bg-terracota text-white px-2 py-0.5 rounded-full font-bold">Ahorra {oferta.savings_percentage}%</span>
                  )}
                  <div className="text-xs text-on-surface-variant mt-2 line-clamp-2">
                    {oferta.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(' + ')}
                  </div>
                </div>
              )}

              {/* Dates */}
              {(oferta.start_date || oferta.end_date) && (
                <div className="mt-auto bg-latte/10 p-2 rounded text-[11px] text-on-surface-variant">
                  {oferta.start_date && <div><span className="font-bold">Desde:</span> {new Date(oferta.start_date).toLocaleDateString()}</div>}
                  {oferta.end_date && <div><span className="font-bold">Hasta:</span> {new Date(oferta.end_date).toLocaleDateString()}</div>}
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 shadow-sm rounded-lg p-1">
                <button onClick={() => openEdit(oferta)} className="text-primary hover:bg-mist p-1.5 rounded"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                <button onClick={() => handleDelete(oferta)} className="text-error hover:bg-mist p-1.5 rounded"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editOffer ? "Editar Oferta" : "Nueva Oferta"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Tipo Toggle (solo si es nuevo) */}
          {!editOffer && (
            <div className="flex bg-mist p-1 rounded-lg">
              <button type="button" onClick={() => setOfferType('promotion')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${offerType === 'promotion' ? 'bg-white shadow-sm text-terracota' : 'text-on-surface-variant'}`}>Descuento (%)</button>
              <button type="button" onClick={() => setOfferType('combo')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${offerType === 'combo' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}>Combo Fijo</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className={offerType === 'combo' ? 'col-span-1' : 'col-span-2'}>
              <label className="block font-label-md text-espresso mb-1">Nombre Comercial *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:border-primary" placeholder="Ej. Promoción de Verano" />
            </div>
            
            {offerType === 'combo' && (
              <div>
                <label className="block font-label-md text-espresso mb-1">URL de Imagen (opcional)</label>
                <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:border-primary text-sm" placeholder="https://..." />
              </div>
            )}

            {offerType === 'combo' && (
              <div className="col-span-2">
                <label className="block font-label-md text-espresso mb-1">Descripción (opcional)</label>
                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:border-primary" placeholder="Ej. Perfecto para compartir" />
              </div>
            )}

            {offerType === 'promotion' ? (
              <div className="col-span-2">
                <label className="block font-label-md text-espresso mb-1">Porcentaje de Descuento (%) *</label>
                <input type="number" required min="1" max="100" value={formData.discount_percentage} onChange={e => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg focus:border-primary" />
              </div>
            ) : (
              <div className="col-span-2">
                <label className="block font-label-md text-espresso mb-1">Precio Especial Total (S/) *</label>
                <div className="flex gap-4 items-center">
                  <input type="number" required min="0.01" step="0.01" value={formData.special_price} onChange={e => setFormData({ ...formData, special_price: e.target.value })} className="w-1/2 px-3 py-2 border rounded-lg focus:border-primary" placeholder="0.00" />
                  <div className="w-1/2 text-sm text-on-surface-variant">
                    Suma Original: S/ {getComboOriginalTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block font-label-md text-espresso mb-1">Fecha de Inicio (Opcional para Combo)</label>
              <input type={offerType === 'promotion' ? 'datetime-local' : 'date'} required={offerType === 'promotion'} value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:border-primary" />
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Fecha de Fin (Opcional para Combo)</label>
              <input type={offerType === 'promotion' ? 'datetime-local' : 'date'} required={offerType === 'promotion'} value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:border-primary" />
            </div>

            <div className="col-span-2 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded border-latte text-primary" />
                <span className="font-label-md text-espresso font-bold">Oferta Habilitada</span>
              </label>
            </div>
          </div>

          <div className="mt-4 border-t border-latte/30 pt-4">
            <label className="block font-label-md text-espresso mb-2">Productos Participantes *</label>
            
            {offerType === 'promotion' ? (
              // Selector Promociones (Checkboxes)
              <div className="max-h-48 overflow-y-auto border border-latte/30 rounded-lg p-2 space-y-1 bg-surface-container-lowest">
                {products.map(p => (
                  <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-mist rounded cursor-pointer transition-colors">
                    <input type="checkbox" checked={formData.product_ids.includes(p.id)} onChange={() => handlePromoProductToggle(p.id)} className="w-4 h-4 text-primary" />
                    <span className="font-body-md text-espresso">{p.name} <span className="text-xs text-on-surface-variant">(S/ {p.price?.toFixed(2)})</span></span>
                  </label>
                ))}
              </div>
            ) : (
              // Selector Combos (Cantidades)
              <div className="max-h-48 overflow-y-auto border border-latte/30 rounded-lg p-2 space-y-1 bg-surface-container-lowest">
                {products.map(p => {
                  const selected = formData.items.find(i => i.product_id === p.id);
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-2 rounded transition-colors ${selected ? 'bg-mist/80 border border-primary/20' : 'hover:bg-mist/50'}`}>
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input type="checkbox" checked={!!selected} onChange={() => toggleComboItemProduct(p.id)} className="w-4 h-4 text-primary rounded" />
                        <span className="font-label-md text-espresso">{p.name} <span className="text-on-surface-variant text-xs">(S/ {p.price})</span></span>
                      </label>
                      {selected && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant">Cant:</span>
                          <input type="number" min="1" value={selected.quantity} onChange={(e) => updateComboItemQty(p.id, parseInt(e.target.value) || 1)} className="w-16 px-2 py-1 border rounded text-center focus:border-primary text-sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-espresso hover:bg-mist">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-terracota disabled:opacity-50">
              {isSubmitting ? "Guardando..." : "Guardar Oferta"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─── SUGERENCIAS IA ──────────────────────────────────────────────────────────

function SugerenciasIaTab({ onApplySuggestion }: { onApplySuggestion?: (sugg: any) => void }) {
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => { 
    apiFetch(`${API_BASE_URL}/api/combos/ai-suggestions`)
      .then(r => r.json())
      .then(setAiSuggestions)
      .catch(console.error)
      .finally(() => setLoadingAi(false));
  }, []);

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="material-symbols-outlined text-[150px] text-indigo-500">auto_awesome</span>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 text-indigo-800">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          <h2 className="font-headline-md font-bold text-2xl">Recomendaciones IA</h2>
        </div>
        <p className="text-sm text-indigo-900/70 mb-8 max-w-2xl">
          Basado en el historial de ventas, nuestra inteligencia artificial detecta qué productos se compran frecuentemente juntos y te propone convertirlos en ofertas para maximizar tus ingresos.
        </p>

        {loadingAi ? (
          <div className="py-12 text-center text-indigo-400">Analizando patrones de ventas...</div>
        ) : aiSuggestions.length === 0 ? (
          <div className="py-12 text-center text-indigo-400">No hay suficientes datos para generar sugerencias hoy.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSuggestions.map(sugg => (
              <div key={sugg.id} className="bg-white rounded-xl p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-espresso text-lg">{sugg.suggested_name}</h4>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">
                    {sugg.frequency} ventas juntos
                  </span>
                </div>
                <div className="text-sm text-on-surface-variant mb-4 flex flex-col gap-1">
                  {sugg.items.map((i: any) => (
                    <div key={i.product_id} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-indigo-300">check_circle</span>
                      {i.name}
                    </div>
                  ))}
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg mb-4">
                  <p className="text-xs text-indigo-800 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] mt-0.5">insights</span>
                    <span>Estos productos tienen una <b>alta frecuencia de compra conjunta ({sugg.frequency} ventas)</b>. Unirlos en un combo incentivará aún más la rotación.</span>
                  </p>
                </div>
                
                <div className="bg-mist p-3 rounded-lg mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Valor Original:</span>
                    <span className="line-through text-on-surface-variant/70">S/ {sugg.original_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-espresso">Precio Sugerido:</span>
                    <span className="text-terracota">S/ {sugg.suggested_price.toFixed(2)}</span>
                  </div>
                </div>
                
                {onApplySuggestion && (
                  <button 
                    onClick={() => onApplySuggestion(sugg)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Aprobar y Crear Combo
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
