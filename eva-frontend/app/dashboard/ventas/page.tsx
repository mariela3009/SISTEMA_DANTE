"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import KPICardDark from "@/app/components/KPICardDark";

interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  status: string;
  is_cancelled: boolean;
  product?: { id: number; name: string };
}

interface Sale {
  id: number;
  user_id: number;
  client_id: number | null;
  subtotal: string;
  tax: string;
  total: string;
  payment_method: "efectivo" | "culqi";
  invoice_type: "ticket" | "boleta" | "factura";
  status: "completed" | "cancelled";
  culqi_order_id: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string; role: string };
  client?: { id: number; name: string; document_number: string } | null;
  items?: SaleItem[];
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  culqi: "Culqi",
};

const INVOICE_LABELS: Record<string, string> = {
  ticket: "Ticket",
  boleta: "Boleta",
  factura: "Factura",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/api/sales`);
      if (statusFilter) url.searchParams.append("status", statusFilter);
      if (methodFilter) url.searchParams.append("payment_method", methodFilter);
      if (invoiceFilter) url.searchParams.append("invoice_type", invoiceFilter);
      if (dateFrom) url.searchParams.append("date_from", dateFrom);
      if (dateTo) url.searchParams.append("date_to", dateTo);

      const res = await apiFetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setSales(data.data || data || []);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [statusFilter, methodFilter, invoiceFilter, dateFrom, dateTo]);

  const openDetail = async (sale: Sale) => {
    setSelectedSale(sale);
    if (!sale.items) {
      setDetailLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/sales/${sale.id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedSale(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  // Filtered + searched
  const filtered = sales.filter((s) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      String(s.id).includes(t) ||
      s.user?.name?.toLowerCase().includes(t) ||
      s.client?.name?.toLowerCase().includes(t) ||
      s.client?.document_number?.includes(t)
    );
  });

  // Stats
  const completed = sales.filter((s) => s.status === "completed");
  const totalRevenue = completed.reduce((acc, s) => acc + parseFloat(s.total), 0);
  const totalTax = completed.reduce((acc, s) => acc + parseFloat(s.tax), 0);
  const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

  const fmt = (v: number) => `S/ ${v.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Historial de Ventas</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Consulta y filtra todas las ventas registradas en el sistema.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-latte/20 px-4 py-2 rounded-lg border border-latte/40">
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span><strong className="text-espresso">{sales.length}</strong> ventas en total</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICardDark title="Ingresos Totales" value={fmt(totalRevenue)} icon="payments" />
        <KPICardDark title="IGV Recaudado" value={fmt(totalTax)} icon="account_balance" />
        <KPICardDark title="Ticket Promedio" value={fmt(avgTicket)} icon="avg_pace" />
        <KPICardDark title="Ventas Completadas" value={`${completed.length} / ${sales.length}`} icon="check_circle" />
      </div>

      {/* Filters */}
      <div className="bg-mist border border-latte rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-latte bg-latte/10 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Buscar por ID, cajero, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-latte/60 rounded-lg focus:outline-none focus:border-primary text-sm placeholder-on-surface-variant/40"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-latte/60 rounded-lg text-sm text-espresso focus:outline-none focus:border-primary"
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>

          {/* Payment Method */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-latte/60 rounded-lg text-sm text-espresso focus:outline-none focus:border-primary"
          >
            <option value="">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="culqi">Culqi</option>
          </select>

          {/* Invoice */}
          <select
            value={invoiceFilter}
            onChange={(e) => setInvoiceFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-latte/60 rounded-lg text-sm text-espresso focus:outline-none focus:border-primary"
          >
            <option value="">Todos los comprobantes</option>
            <option value="ticket">Ticket</option>
            <option value="boleta">Boleta</option>
            <option value="factura">Factura</option>
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-white border border-latte/60 rounded-lg text-sm text-espresso focus:outline-none focus:border-primary"
            />
            <span className="text-on-surface-variant text-xs">al</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-white border border-latte/60 rounded-lg text-sm text-espresso focus:outline-none focus:border-primary"
            />
          </div>

          {/* Clear filters */}
          {(statusFilter || methodFilter || invoiceFilter || dateFrom || dateTo || searchTerm) && (
            <button
              onClick={() => { setStatusFilter(""); setMethodFilter(""); setInvoiceFilter(""); setDateFrom(""); setDateTo(""); setSearchTerm(""); }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Limpiar
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-latte/20 text-espresso text-sm border-b border-latte/30">
                <th className="p-4 font-semibold"># Venta</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Cajero</th>
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Comprobante</th>
                <th className="p-4 font-semibold">Método</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/30 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                      Cargando ventas...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-latte">receipt_long</span>
                    No se encontraron ventas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-latte/5 transition-colors">
                    {/* ID */}
                    <td className="p-4">
                      <span className="font-mono font-bold text-espresso">#{String(sale.id).padStart(4, "0")}</span>
                    </td>

                    {/* Fecha */}
                    <td className="p-4 text-on-surface-variant">
                      <p className="text-xs font-mono">
                        {new Date(sale.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-on-surface-variant/60">
                        {new Date(sale.created_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>

                    {/* Cajero */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {sale.user?.name?.charAt(0) ?? "?"}
                        </div>
                        <span className="text-espresso text-xs">{sale.user?.name ?? `Usuario #${sale.user_id}`}</span>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="p-4 text-on-surface-variant">
                      {sale.client ? (
                        <div>
                          <p className="text-xs font-medium text-espresso">{sale.client.name}</p>
                          <p className="text-[10px] font-mono">{sale.client.document_number}</p>
                        </div>
                      ) : (
                        <span className="text-xs italic">Venta rápida</span>
                      )}
                    </td>

                    {/* Comprobante */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${sale.invoice_type === "factura" ? "bg-blue-100 text-blue-700" :
                          sale.invoice_type === "boleta" ? "bg-primary/10 text-primary" :
                          "bg-latte/30 text-espresso"}`}>
                        {INVOICE_LABELS[sale.invoice_type]}
                      </span>
                    </td>

                    {/* Método */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[15px]">
                          {sale.payment_method === "culqi" ? "credit_card" : "payments"}
                        </span>
                        {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="p-4 text-right">
                      <p className="font-bold text-espresso">S/ {parseFloat(sale.total).toFixed(2)}</p>
                      <p className="text-[10px] text-on-surface-variant/60">IGV: S/ {parseFloat(sale.tax).toFixed(2)}</p>
                    </td>

                    {/* Estado */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[sale.status]}`}>
                        {sale.status === "completed" ? "Completada" : "Cancelada"}
                      </span>
                    </td>

                    {/* Ver detalle */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetail(sale)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors ml-auto font-medium"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-latte/30 bg-latte/5 text-xs text-on-surface-variant flex justify-between items-center">
            <span>Mostrando <strong>{filtered.length}</strong> de <strong>{sales.length}</strong> ventas</span>
            <span>Total filtrado: <strong className="text-espresso">S/ {filtered.filter(s => s.status === "completed").reduce((a, s) => a + parseFloat(s.total), 0).toFixed(2)}</strong></span>
          </div>
        )}
      </div>

      {/* Detail Drawer/Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedSale(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-latte/30">
              <div>
                <h2 className="text-lg font-bold text-espresso">
                  Venta #{String(selectedSale.id).padStart(4, "0")}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {new Date(selectedSale.created_at).toLocaleString("es-PE", {
                    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-on-surface-variant hover:text-espresso p-1 rounded-lg hover:bg-latte/20 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-latte/10 rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant mb-1">Cajero</p>
                  <p className="font-semibold text-espresso">{selectedSale.user?.name ?? `#${selectedSale.user_id}`}</p>
                </div>
                <div className="bg-latte/10 rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant mb-1">Cliente</p>
                  <p className="font-semibold text-espresso">{selectedSale.client?.name ?? "Venta rápida"}</p>
                  {selectedSale.client && <p className="text-xs font-mono text-on-surface-variant">{selectedSale.client.document_number}</p>}
                </div>
                <div className="bg-latte/10 rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant mb-1">Comprobante</p>
                  <p className="font-semibold text-espresso capitalize">{selectedSale.invoice_type}</p>
                </div>
                <div className="bg-latte/10 rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant mb-1">Método de Pago</p>
                  <p className="font-semibold text-espresso capitalize">{selectedSale.payment_method}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-espresso text-sm mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">shopping_bag</span>
                  Productos
                </h3>
                {detailLoading ? (
                  <div className="text-center py-6 text-on-surface-variant text-sm">Cargando items...</div>
                ) : selectedSale.items && selectedSale.items.length > 0 ? (
                  <div className="border border-latte/30 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-latte/10">
                        <tr>
                          <th className="p-3 text-left font-medium text-espresso text-xs">Producto</th>
                          <th className="p-3 text-center font-medium text-espresso text-xs">Cant.</th>
                          <th className="p-3 text-right font-medium text-espresso text-xs">P. Unit.</th>
                          <th className="p-3 text-right font-medium text-espresso text-xs">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-latte/20">
                        {selectedSale.items.map((item) => (
                          <tr key={item.id} className={item.is_cancelled ? "opacity-40 line-through" : ""}>
                            <td className="p-3 text-espresso">
                              <span className="text-xs">{item.product?.name ?? `Producto #${item.product_id}`}</span>
                              {item.is_cancelled && <span className="ml-2 text-[10px] text-error font-bold">(cancelado)</span>}
                            </td>
                            <td className="p-3 text-center text-on-surface-variant text-xs">{item.quantity}</td>
                            <td className="p-3 text-right text-on-surface-variant text-xs">S/ {parseFloat(item.unit_price).toFixed(2)}</td>
                            <td className="p-3 text-right font-medium text-espresso text-xs">S/ {parseFloat(item.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant italic">No hay items disponibles.</p>
                )}
              </div>

              {/* Totales */}
              <div className="border-t border-latte/30 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>S/ {parseFloat(selectedSale.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>IGV (18%)</span>
                  <span>S/ {parseFloat(selectedSale.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-espresso text-base border-t border-latte/30 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">S/ {parseFloat(selectedSale.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex justify-center pt-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[selectedSale.status]}`}>
                  {selectedSale.status === "completed" ? "✓ Venta Completada" : "✗ Venta Cancelada"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
