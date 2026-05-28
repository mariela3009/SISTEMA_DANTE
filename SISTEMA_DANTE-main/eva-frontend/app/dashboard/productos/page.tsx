"use client";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";

export default function ProductosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", category_id: "", price: 0, is_active: true
  });

  const [editProduct, setEditProduct] = useState<any>(null);

  // Recipe states
  const [recipeProduct, setRecipeProduct] = useState<any>(null);
  const [recipeItems, setRecipeItems] = useState<{ingredient_id: string, quantity: string}[]>([]);
  const [allIngredients, setAllIngredients] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("eva_token");
        const res = await fetch("http://localhost:8000/api/categories", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setCategories(await res.json());
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("eva_token");
        const url = new URL("http://localhost:8000/api/products");
        if (searchTerm) url.searchParams.append("search", searchTerm);
        if (categoryFilter) url.searchParams.append("category_id", categoryFilter);

        const res = await fetch(url.toString(), {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem("eva_token");
        const res = await fetch("http://localhost:8000/api/ingredients", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAllIngredients(data.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
    fetchIngredients();
  }, [searchTerm, categoryFilter]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("eva_token");
      const res = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          is_active: formData.is_active ? 1 : 0
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", category_id: "", price: 0, is_active: true });
        // Refetch products (forcing re-render)
        const newRes = await fetch("http://localhost:8000/api/products", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (newRes.ok) setProducts(await newRes.json());
      } else {
        const data = await res.json();
        alert(data.message || "Error al crear producto");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("eva_token");
      const res = await fetch(`http://localhost:8000/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...formData, is_active: formData.is_active ? 1 : 0 })
      });
      if (res.ok) {
        setEditProduct(null);
        // fetchProducts is called by dependency array if we want, but since we don't trigger it directly easily, just reload window or run a local state update. For now simplest is full refetch via a quick manual call
        const newRes = await fetch("http://localhost:8000/api/products", { headers: { "Authorization": `Bearer ${token}` }});
        if (newRes.ok) setProducts(await newRes.json());
      } else {
        alert("Error al editar producto");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas desactivar este producto para la venta?")) return;
    
    try {
      const token = localStorage.getItem("eva_token");
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert("Producto desactivado correctamente.");
        const newRes = await fetch("http://localhost:8000/api/products", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (newRes.ok) setProducts(await newRes.json());
      } else {
        alert("Error al desactivar el producto.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red.");
    }
  };

  const openEdit = (prod: any) => {
    setFormData({ 
      name: prod.name, 
      category_id: prod.category_id?.toString() ?? "", // Convertir a string para que el <select> lo encuentre
      price: prod.price, 
      is_active: !!prod.is_active 
    });
    setEditProduct(prod);
  };

  const openRecipe = (prod: any) => {
    setRecipeProduct(prod);
    if (prod.recipe_items && prod.recipe_items.length > 0) {
      setRecipeItems(prod.recipe_items.map((r: any) => ({
        ingredient_id: r.ingredient_id.toString(),
        quantity: r.quantity.toString()
      })));
    } else {
      setRecipeItems([]);
    }
  };

  const addRecipeRow = () => {
    setRecipeItems([...recipeItems, { ingredient_id: "", quantity: "" }]);
  };

  const updateRecipeRow = (index: number, field: string, value: string) => {
    const newItems = [...recipeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRecipeItems(newItems);
  };

  const removeRecipeRow = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeProduct) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("eva_token");
      const res = await fetch(`http://localhost:8000/api/products/${recipeProduct.id}/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ items: recipeItems.filter(r => r.ingredient_id && r.quantity) })
      });
      if (res.ok) {
        setRecipeProduct(null);
        // Refetch products to update the recipe count badge
        const newRes = await fetch("http://localhost:8000/api/products", { headers: { "Authorization": `Bearer ${token}` }});
        if (newRes.ok) setProducts(await newRes.json());
      } else {
        alert("Error al guardar receta");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">Productos y Recetas</h2>
          <p className="text-on-surface-variant font-body-md text-sm md:text-base">Administra el menú y configura las recetas de cada producto.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-3 md:px-4 py-2 rounded-lg hover:bg-terracota transition-colors font-label-lg whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="hidden md:inline">Nuevo Producto</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-latte/30 flex flex-col md:flex-row gap-4 bg-mist">
          <div className="relative flex-1 md:max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
            <input 
              type="text" 
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-latte/50 rounded-lg focus:outline-none focus:border-primary text-body-md"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-latte/50 rounded-lg focus:outline-none focus:border-primary text-body-md text-espresso"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/50 border-b border-latte/30 text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Producto</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold text-right">Precio Unitario</th>
                <th className="px-6 py-4 font-semibold">Estado / Receta</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/20 font-body-md">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">Cargando productos...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No se encontraron productos.</td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-mist/50 transition-colors">
                    <td className="px-6 py-4 font-label-lg text-espresso flex items-center gap-3">
                      {item.category?.icon ? (
                        <span className="material-symbols-outlined text-latte">{item.category.icon}</span>
                      ) : (
                        <div className="w-8 h-8 rounded bg-latte/20 flex items-center justify-center text-espresso text-xs font-bold">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {item.category?.name}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-espresso">
                      S/ {item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {item.is_active ? (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Activo
                          </span>
                        ) : (
                          <span className="bg-latte/30 text-on-surface-variant px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                            Inactivo
                          </span>
                        )}
                        
                        <span className={`text-xs flex items-center gap-1 ${item.recipe_items?.length > 0 ? 'text-espresso' : 'text-error'}`}>
                          <span className="material-symbols-outlined text-[14px]">blender</span>
                          {item.recipe_items?.length > 0 
                            ? `${item.recipe_items.length} insumos en receta` 
                            : 'Sin receta configurada'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openRecipe(item)}
                        className="text-tertiary-container hover:text-tertiary p-1" title="Ver Receta"
                      >
                        <span className="material-symbols-outlined">receipt_long</span>
                      </button>
                      <button 
                        onClick={() => openEdit(item)}
                        className="text-on-surface-variant hover:text-espresso p-1 ml-2" title="Editar Producto"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(item.id)}
                        className="text-error hover:text-error/80 p-1 ml-2" title="Desactivar Producto"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Producto">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block font-label-md text-espresso mb-1">Nombre del Producto</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-espresso mb-1">Categoría</label>
              <select 
                required
                value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Seleccione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Precio Unitario (S/)</label>
              <input 
                type="number" step="0.10" required min="0"
                value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-latte/50 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.is_active} 
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-primary rounded border-latte/50 focus:ring-primary"
              />
              <span className="font-body-md text-espresso">Producto Activo para la Venta</span>
            </label>
            <p className="text-xs text-on-surface-variant mt-1 ml-6">
              Los productos inactivos no aparecerán en el Punto de Venta.
            </p>
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
              {isSubmitting ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Editar Producto">
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div>
            <label className="block font-label-md text-espresso mb-1">Nombre</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-espresso mb-1">Categoría</label>
              <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Seleccione...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-label-md text-espresso mb-1">Precio (S/)</label>
              <input type="number" step="0.10" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 rounded text-primary" />
            <span className="font-body-md text-espresso">Activo</span>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setEditProduct(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg">{isSubmitting ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </Modal>

      {/* Recipe Builder Modal */}
      <Modal isOpen={!!recipeProduct} onClose={() => setRecipeProduct(null)} title={`Receta: ${recipeProduct?.name}`}>
        <form onSubmit={handleSaveRecipe} className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Añade los insumos que componen este producto. Al venderse, se descontará exactamente esta cantidad del inventario.
          </p>
          
          <div className="space-y-3 mt-4">
            {recipeItems.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-latte rounded-lg text-on-surface-variant text-sm">
                Sin insumos. Añade filas para construir la receta.
              </div>
            ) : (
              recipeItems.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <select 
                      required 
                      value={row.ingredient_id} 
                      onChange={e => updateRecipeRow(idx, 'ingredient_id', e.target.value)}
                      className="w-full px-3 py-2 border border-latte/50 rounded-lg text-sm"
                    >
                      <option value="">Seleccione insumo...</option>
                      {allIngredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} (en {ing.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input 
                      type="number" step="0.01" required min="0.01" placeholder="Cant."
                      value={row.quantity} 
                      onChange={e => updateRecipeRow(idx, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-latte/50 rounded-lg text-sm"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeRecipeRow(idx)}
                    className="text-error hover:text-error/80 p-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>

          <button 
            type="button" onClick={addRecipeRow}
            className="flex items-center gap-1 text-primary hover:text-terracota text-sm font-bold mt-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Añadir Insumo
          </button>

          <div className="pt-6 flex justify-end gap-3 border-t border-latte/30 mt-6">
            <button type="button" onClick={() => setRecipeProduct(null)} className="px-4 py-2 border border-latte/50 rounded-lg text-espresso hover:bg-mist transition-colors font-label-md">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-terracota transition-colors font-label-md disabled:opacity-50">
              {isSubmitting ? "Guardando..." : "Guardar Receta"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
