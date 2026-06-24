"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { apiFetch } from "../../lib/api";
import Script from "next/script";

declare global {
  interface Window {
    Culqi: any;
    culqi: () => void;
  }
}

export default function POSPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Clients states
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Quick-add Client Form States
  const [clientName, setClientName] = useState("");
  const [clientDocType, setClientDocType] = useState<"dni" | "ruc">("dni");
  const [clientDocNum, setClientDocNum] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientError, setClientError] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);

  const [ticketData, setTicketData] = useState<{
    items: any[],
    subtotal: number,
    tax: number,
    total: number,
    date: string,
    id: string,
    client: any | null,
    invoice_type: 'ticket' | 'boleta' | 'factura'
  } | null>(null);

  const fetchClients = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/clients`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.data || []);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  // Cargar categorías, productos y clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiFetch(`${API_BASE_URL}/api/categories`),
          apiFetch(`${API_BASE_URL}/api/products?active=1`) // Solo activos con receta
        ]);

        if (catRes.ok && prodRes.ok) {
          const cats = await catRes.json();
          setCategories([{ id: "", name: "Todos", icon: "grid_view" }, ...cats]);
          setProducts(await prodRes.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchClients();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory ? p.category?.id.toString() === activeCategory : true;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!product.has_stock) {
      setErrorMsg(`No hay stock suficiente de insumos para preparar ${product.name}`);
      return;
    }

    const itemPrice = product.discounted_price ?? product.price;

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { 
        product_id: product.id, 
        name: product.name, 
        price: itemPrice, 
        quantity: 1, 
        subtotal: itemPrice 
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
  };

  const subtotalCart = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxCart = subtotalCart * 0.18;
  const totalCart = subtotalCart + taxCart;

  const handleQuickAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");

    if (!clientName.trim()) {
      setClientError("El nombre o razón social es obligatorio.");
      return;
    }
    if (clientDocType === "dni" && !/^\d{8}$/.test(clientDocNum)) {
      setClientError("El DNI debe tener exactamente 8 dígitos.");
      return;
    }
    if (clientDocType === "ruc" && !/^\d{11}$/.test(clientDocNum)) {
      setClientError("El RUC debe tener exactamente 11 dígitos.");
      return;
    }

    setIsAddingClient(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: clientName,
          document_type: clientDocType,
          document_number: clientDocNum,
          email: clientEmail || null,
          phone: clientPhone || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al registrar cliente.");
      }

      await fetchClients();
      setSelectedClientId(data.id.toString());
      setIsClientModalOpen(false);

      setCart([]);
      setClientName("");
      setClientDocNum("");
      setSelectedClientId("");
      setPaymentMethod("cash");
      setIsCartOpen(false);
    } catch (err: any) {
      setClientError(err.message);
    } finally {
      setIsAddingClient(false);
    }
  };

  /**
   * processSale()
   * Inicia el proceso de venta.
   * Si el método es 'culqi' (Tarjeta/Yape), primero se comunica con el Backend para generar una 'Order'.
   * Luego abre la ventana segura de Culqi para que el cliente meta su tarjeta o escanee el QR.
   */
  const processSale = async () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === "culqi") {
      if (!window.Culqi) {
        setErrorMsg("El sistema de pagos no está cargado.");
        return;
      }

      setIsProcessing(true);
      setErrorMsg("");
      try {
        // 1. Solicitar Orden de Culqi al Backend (necesario para Yape)
        const res = await apiFetch(`${API_BASE_URL}/api/sales/culqi-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
            client_id: selectedClientId ? parseInt(selectedClientId) : null,
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al generar orden en Culqi");

        const orderId = data.order_id;

        // 2. Configurar Culqi inyectando el parámetro 'order'
        window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "pk_test_kgvtwFBjH89SWsSW";
        window.Culqi.settings({
            title: 'Cafetería Dante',
            currency: 'PEN',
            amount: Math.round(totalCart * 100),
            order: orderId // <--- Esto habilita PagoEfectivo y Yape
        });
        window.Culqi.options({
            lang: 'auto',
            installments: false, 
            modal: true,
        });

        // 3. Callback global para recibir token (Tarjeta) o la confirmación de Yape
        window.culqi = async () => {
          if (window.Culqi.token) {
              const token = window.Culqi.token.id;
              await submitSale(token, null);
          } else if (window.Culqi.order) {
              // Yape devuelve window.Culqi.order.id cuando el pago se completa
              const orderCompleted = window.Culqi.order.id;
              await submitSale(null, orderCompleted);
          } else if (window.Culqi.error) {
              setErrorMsg(window.Culqi.error.user_message || "Error en el pago de Culqi.");
              window.Culqi.close();
              setIsProcessing(false);
          }
        };
        
        // 4. Abrir la ventana de Culqi
        window.Culqi.open();
      } catch (error: any) {
        setErrorMsg(error.message);
        setIsProcessing(false);
      }
    } else {
      await submitSale(null, null);
    }
  };

  /**
   * submitSale()
   * Función final que se ejecuta cuando el pago fue exitoso (o si se pagó en efectivo).
   * Envía todos los productos del carrito al Backend para guardarlos en la base de datos
   * y que se impriman en el ticket de venta.
   */
  const submitSale = async (culqiTokenId: string | null = null, culqiOrderId: string | null = null) => {
    setIsProcessing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const currentClient = clients.find(c => c.id.toString() === selectedClientId);
      const invoiceType = currentClient
        ? (currentClient.document_type === 'ruc' ? 'factura' : 'boleta')
        : 'ticket';

      const res = await apiFetch(`${API_BASE_URL}/api/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
          payment_method: paymentMethod,
          invoice_type: invoiceType,
          client_id: selectedClientId ? parseInt(selectedClientId) : null,
          culqi_token_id: culqiTokenId,
          culqi_order_id: culqiOrderId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error procesando venta");

      const selectedClient = clients.find(c => c.id.toString() === selectedClientId);

      setTicketData({
        items: [...cart],
        subtotal: subtotalCart,
        tax: taxCart,
        total: totalCart,
        date: new Date().toLocaleString(),
        id: data.sale?.id?.toString() || data.sale_id || Math.floor(Math.random() * 1000000).toString(),
        client: data.sale?.client || selectedClient || null,
        invoice_type: data.sale?.invoice_type || (selectedClient ? (selectedClient.document_type === 'ruc' ? 'factura' : 'boleta') : 'ticket')
      });

      setSuccessMsg("Venta procesada con éxito");
      setCart([]);
      setSelectedClientId("");
      setPaymentMethod("cash");
      setIsCartOpen(false);
      
      const prodRes = await apiFetch(`${API_BASE_URL}/api/products?active=1`);
      if (prodRes.ok) setProducts(await prodRes.json());
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      if (paymentMethod === "culqi" && window.Culqi) {
          window.Culqi.close(); // Forzar el cierre del modal en caso de error o éxito
      }
      setIsProcessing(false);
    }
  };

  const getInvoiceTypeLabel = () => {
    if (!selectedClientId) return "Ticket (Nota de Venta)";
    const client = clients.find(c => c.id.toString() === selectedClientId);
    if (!client) return "Ticket (Nota de Venta)";
    return client.document_type === "ruc" ? "Factura Electrónica" : "Boleta Electrónica";
  };

  if (loading) return <div className="p-8 text-center text-espresso font-semibold">Cargando catálogo...</div>;

  return (
    <>
    <Script src="https://checkout.culqi.com/js/v4" strategy="lazyOnload" />
    <div className="h-[calc(100vh-2rem)] flex gap-6 -m-4 relative overflow-hidden print:hidden">
      <div className="flex-1 flex flex-col bg-surface-container-lowest lg:rounded-xl shadow-sm lg:border border-latte/30 overflow-hidden w-full max-w-full">
        
        <div className="bg-mist p-4 border-b border-latte/30 flex flex-col gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Buscar producto por nombre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-latte/50 bg-white text-espresso focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.id ? cat.id.toString() : "")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-md transition-colors ${
                  activeCategory === (cat.id ? cat.id.toString() : "")
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white text-espresso border border-latte hover:bg-latte/20"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{cat.icon || "category"}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 bg-error/10 text-error px-4 py-3 rounded-lg border border-error/20 flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined">error</span>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-green-500/10 text-green-700 px-4 py-3 rounded-lg border border-green-500/20 flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined">check_circle</span>
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={!product.has_stock}
                className={`relative flex flex-col h-40 rounded-xl p-4 text-left border transition-all ${
                  product.has_stock 
                    ? "bg-white border-latte/40 hover:border-primary hover:shadow-md active:scale-95 cursor-pointer group" 
                    : "bg-surface border-latte/20 opacity-60 cursor-not-allowed"
                }`}
              >
                {product.active_promotion && (
                  <div className="absolute top-2 right-2 bg-terracota text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                    -{product.active_promotion.discount_percentage}%
                  </div>
                )}
                <div className="flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                    product.has_stock ? "bg-latte/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors" : "bg-latte/20 text-on-surface-variant"
                  }`}>
                    <span className="material-symbols-outlined">{product.category?.icon || "local_cafe"}</span>
                  </div>
                  <h3 className="font-label-lg text-espresso line-clamp-2 leading-tight font-semibold">{product.name}</h3>
                </div>
                <div className="flex justify-between items-end mt-2 w-full">
                  {product.active_promotion ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant line-through">S/ {product.price.toFixed(2)}</span>
                      <span className="font-headline-md text-terracota font-bold">S/ {Number(product.discounted_price).toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="font-headline-md text-terracota font-bold">S/ {product.price.toFixed(2)}</span>
                  )}
                  {!product.has_stock && (
                    <span className="text-[10px] font-bold uppercase bg-error text-white px-2 py-0.5 rounded-sm shadow-sm absolute top-3 right-3 rotate-12">Sin Insumos</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:bg-terracota transition-colors"
      >
        <span className="material-symbols-outlined text-3xl">shopping_cart</span>
        {cart.length > 0 && (
          <span className="absolute top-0 right-0 bg-error text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-surface">
            {cart.length}
          </span>
        )}
      </button>

      {isCartOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-espresso/50 backdrop-blur-sm z-40"
          onClick={() => setIsCartOpen(false)}
        ></div>
      )}

      <div className={`
        fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto
        w-full sm:w-96 flex flex-col bg-surface-container-lowest lg:rounded-xl shadow-2xl lg:shadow-sm border-l lg:border border-latte/30 shrink-0
        transition-transform duration-300 ease-in-out
        ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="bg-espresso text-mist p-4 border-b border-latte/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-xl font-bold">Orden Actual</h2>
            <span className="font-label-md bg-terracota px-2 py-1 rounded-full text-xs font-semibold">{cart.length} ítems</span>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="lg:hidden text-mist hover:text-white p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
              <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
              <p className="font-label-md font-semibold">No hay productos en la orden</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cart.map(item => (
                <li key={item.product_id} className="flex flex-col gap-1 bg-mist p-2 rounded-lg border border-latte/20 shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-espresso pr-4 font-semibold">{item.name}</span>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-label-md text-terracota font-bold">S/ {item.subtotal.toFixed(2)}</span>
                    <div className="flex items-center gap-2 bg-white border border-latte/30 rounded-full px-1 py-0.5">
                      <button onClick={() => updateQuantity(item.product_id, -1)} className="text-espresso hover:text-terracota">
                        <span className="material-symbols-outlined text-[14px] block">remove</span>
                      </button>
                      <span className="text-xs w-4 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, 1)} className="text-espresso hover:text-terracota">
                        <span className="material-symbols-outlined text-[14px] block">add</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Totales, Cliente y Checkout */}
        <div className="bg-mist p-4 border-t border-latte/30 space-y-2">
          {/* Client Selection (RF-018) */}
          <div className="space-y-1 border-b border-latte/40 pb-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-espresso uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person</span>
                Cliente
              </label>
              <button 
                onClick={() => setIsClientModalOpen(true)}
                className="text-[10px] font-bold text-primary hover:text-terracota flex items-center gap-0.5"
                title="Registrar cliente rápido"
              >
                <span className="material-symbols-outlined text-[12px]">add_circle</span>
                Nuevo
              </button>
            </div>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-espresso font-medium"
            >
              <option value="">— Venta Rápida —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant/80 font-bold px-1 uppercase">
              <span>Comprobante:</span>
              <span className={`px-2 py-0.5 rounded ${selectedClientId ? 'bg-primary/10 text-primary' : 'bg-latte/30 text-espresso'}`}>
                {getInvoiceTypeLabel()}
              </span>
            </div>
          </div>

          {/* Resumen Totales */}
          <div className="space-y-1">
            <div className="flex justify-between text-on-surface-variant text-xs">
              <span>Subtotal</span>
              <span>S/ {subtotalCart.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-xs">
              <span>IGV (18%)</span>
              <span>S/ {taxCart.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-espresso font-headline-md text-lg pt-1 border-t border-latte/30 mt-1 font-bold">
              <span>Total</span>
              <span className="text-terracota">S/ {totalCart.toFixed(2)}</span>
            </div>
          </div>
          <div className="pt-1">
            <label className="text-[10px] font-bold text-espresso mb-1 uppercase tracking-wider block">Método de Pago</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button 
                onClick={() => setPaymentMethod("cash")}
                className={`py-1.5 rounded-lg border-2 text-xs font-bold flex flex-col items-center justify-center transition-colors ${paymentMethod === "cash" ? "border-primary bg-primary/10 text-primary" : "border-latte text-on-surface-variant hover:bg-mist"}`}
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                Efectivo
              </button>
              <button 
                onClick={() => setPaymentMethod("culqi")}
                className={`py-1.5 rounded-lg border-2 text-xs font-bold flex flex-col items-center justify-center transition-colors ${paymentMethod === "culqi" ? "border-[#FF5A5F] bg-[#FF5A5F]/10 text-[#FF5A5F]" : "border-latte text-on-surface-variant hover:bg-mist"}`}
              >
                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                Culqi (Tarjeta)
              </button>
            </div>
          </div>
          
          <button
            onClick={processSale}
            disabled={cart.length === 0 || isProcessing}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-label-lg text-lg text-on-primary bg-primary hover:bg-terracota focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-bold"
          >
            {isProcessing ? (
              <><span className="material-symbols-outlined animate-spin">autorenew</span> Procesando...</>
            ) : (
              <><span className="material-symbols-outlined">point_of_sale</span> Cobrar S/ {totalCart.toFixed(2)}</>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* QUICK CLIENT MODAL */}
    <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Registrar Cliente POS">
      <form onSubmit={handleQuickAddClient} className="space-y-4">
        {clientError && (
          <div className="text-error bg-error/10 border border-error/20 p-3 rounded-lg text-xs font-semibold">
            {clientError}
          </div>
        )}
        
        <div>
          <label className="block text-xs font-bold text-espresso mb-1 uppercase">Nombre / Razón Social</label>
          <input 
            type="text" required value={clientName} onChange={e => setClientName(e.target.value)}
            placeholder="Ej. Juan Pérez o Inversiones Dante S.A.C."
            className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-espresso mb-1 uppercase">Tipo Doc.</label>
            <select 
              value={clientDocType} onChange={e => {
                setClientDocType(e.target.value as "dni" | "ruc");
                setClientDocNum("");
              }}
              className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
            >
              <option value="dni">DNI</option>
              <option value="ruc">RUC</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-espresso mb-1 uppercase">N° Documento</label>
            <input 
              type="text" required value={clientDocNum} 
              onChange={e => setClientDocNum(e.target.value.replace(/\D/g, ''))}
              maxLength={clientDocType === 'dni' ? 8 : 11}
              placeholder={clientDocType === 'dni' ? "8 dígitos" : "11 dígitos"}
              className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm font-mono font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-espresso mb-1 uppercase">Email (Opcional)</label>
            <input 
              type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
              placeholder="cliente@email.com"
              className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-espresso mb-1 uppercase">Teléfono (Opcional)</label>
            <input 
              type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
              placeholder="Ej. 987654321"
              className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-latte mt-6">
          <button 
            type="button" onClick={() => setIsClientModalOpen(false)}
            className="px-4 py-2 text-on-surface-variant hover:text-espresso font-medium text-xs transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" disabled={isAddingClient}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-terracota transition-colors disabled:opacity-50"
          >
            {isAddingClient ? "Guardando..." : "Registrar"}
          </button>
        </div>
      </form>
    </Modal>

    {/* TICKET MODAL */}
    {ticketData && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/60 backdrop-blur-sm print:static print:block print:bg-white print:p-0">
        {/* Contenedor con altura máxima y flex column */}
        <div className="bg-white text-black w-[360px] max-h-[90vh] flex flex-col shadow-2xl relative print:shadow-none print:w-full print:max-w-[80mm] print:max-h-none print:m-0">
          
          {/* Zona scrollable: cabecera + items + totales + firma */}
          <div className="overflow-y-auto flex-1 p-6 print:p-0">
            {/* Cabecera del ticket */}
            <div className="text-center border-b border-dashed border-gray-400 pb-4 mb-4">
              <h2 className="font-headline-lg text-2xl font-bold tracking-widest uppercase">EVA</h2>
              <p className="font-label-md uppercase text-sm mt-1">Cafetería Dante</p>
              <p className="text-xs text-gray-500 mt-2">RUC: 20123456789</p>
              <p className="text-xs text-gray-500">Av. Las Orquídeas 123, Lima</p>
              
              <div className="border-t border-dashed border-gray-400 mt-3 pt-3">
                <p className="font-bold text-sm tracking-wide uppercase font-mono">
                  {ticketData.invoice_type === 'factura' ? 'FACTURA DE VENTA ELECTRÓNICA' : 
                   ticketData.invoice_type === 'boleta' ? 'BOLETA DE VENTA ELECTRÓNICA' : 
                   'TICKET DE VENTA RÁPIDA'}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono">N°: #{ticketData.id.padStart(6, '0')}</p>
                <p className="text-xs text-gray-500 font-mono">Fecha: {ticketData.date}</p>
              </div>

              {/* Client Info (RF-018 / RF-021) */}
              {ticketData.client && (
                <div className="text-left text-xs border-t border-dashed border-gray-400 pt-2 mt-2 space-y-0.5 font-mono">
                  <p><span className="font-bold">CLIENTE:</span> {ticketData.client.name.toUpperCase()}</p>
                  <p><span className="font-bold">{ticketData.client.document_type.toUpperCase()}:</span> {ticketData.client.document_number}</p>
                  {ticketData.client.email && <p><span className="font-bold">EMAIL:</span> {ticketData.client.email}</p>}
                </div>
              )}
            </div>

            {/* Ítems */}
            <table className="w-full text-sm mb-4 font-mono">
              <thead>
                <tr className="border-b border-dashed border-gray-400">
                  <th className="text-left font-normal pb-1 w-12">CANT</th>
                  <th className="text-left font-normal pb-1">DESCRIPCION</th>
                  <th className="text-right font-normal pb-1 w-20">IMPORTE</th>
                </tr>
              </thead>
              <tbody>
                {ticketData.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1 align-top">{item.quantity}</td>
                    <td className="py-1 px-1 leading-tight">{item.name}</td>
                    <td className="py-1 text-right align-top">{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales */}
            <div className="border-t border-dashed border-gray-400 pt-2 space-y-1 font-mono text-sm">
              <div className="flex justify-between">
                <span>OP. GRAVADA:</span>
                <span>S/ {ticketData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGV (18%):</span>
                <span>S/ {ticketData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-400">
                <span>TOTAL A PAGAR:</span>
                <span>S/ {ticketData.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center mt-6 border-t border-dashed border-gray-400 pt-4 text-xs text-gray-500">
              <p>¡Gracias por su compra!</p>
              <p className="mt-1">Vuelva pronto a Cafetería Dante</p>
            </div>
          </div>

          {/* Botones SIEMPRE visibles - fuera del scroll - no se imprimen */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-white print:hidden shrink-0">
            <button 
              onClick={() => setTicketData(null)}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 py-2 bg-espresso text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Imprimir
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
