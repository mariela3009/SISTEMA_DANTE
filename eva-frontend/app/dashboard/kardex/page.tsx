"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/lib/api";
import { apiFetch } from "../../lib/api";

export default function KardexPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [totalMermas, setTotalMermas] = useState(0);

  const selectedObj = ingredients.find(i => i.id.toString() === selectedIngredient);
  const isStockLow = selectedObj && parseFloat(selectedObj.stock_actual) < parseFloat(selectedObj.stock_minimo);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/ingredients`);
        if (res.ok) {
          const data = await res.json();
          setIngredients(data.data || data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchIngredients();
  }, []);

  const fetchMovements = async (page = 1) => {
    if (!selectedIngredient) {
      setMovements([]);
      return;
    }
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/inventory/movements?ingredient_id=${selectedIngredient}&page=${page}&status=approved`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (typeFilter) url += `&type=${typeFilter}`;

      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setMovements(data.data);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
        setTotal(data.total);
        setTotalMermas(data.summary?.total_mermas_cost || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchMovements(1);
  }, [selectedIngredient]);

  const handleExport = async () => {
    try {
      let url = `${API_BASE_URL}/api/inventory/movements?export=csv&ingredient_id=${selectedIngredient}&status=approved`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (typeFilter) url += `&type=${typeFilter}`;

      const res = await apiFetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `kardex_export_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        console.error("Error al exportar");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatSoles = (val: any) => {
    if (val === null || val === undefined) return "-";
    return "S/ " + Number(val).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entrada': return <span className="bg-sage/20 text-sage px-2 py-1 rounded text-xs font-bold uppercase">Entrada</span>;
      case 'salida_venta': return <span className="bg-espresso/20 text-espresso px-2 py-1 rounded text-xs font-bold uppercase">Venta</span>;
      case 'salida_merma': return <span className="bg-error/20 text-error px-2 py-1 rounded text-xs font-bold uppercase">Merma</span>;
      case 'ajuste': return <span className="bg-terracota/20 text-terracota px-2 py-1 rounded text-xs font-bold uppercase">Ajuste</span>;
      default: return <span className="bg-latte/20 text-espresso px-2 py-1 rounded text-xs font-bold uppercase">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">Kardex Contable</h2>
          <p className="text-on-surface-variant font-body-md text-sm md:text-base">Historial inmutable de valorización e inventario por insumo (Método Promedio Ponderado).</p>
        </div>
        
        <div className="w-full md:w-80">
          <label className="block text-sm font-bold text-espresso mb-1">Seleccionar Insumo:</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-latte/50 rounded-lg focus:outline-none focus:border-primary text-body-md text-espresso appearance-none font-bold shadow-sm"
            >
              <option value="">-- Elige un insumo --</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isStockLow && (
        <div className="bg-error/10 border border-error/30 text-error p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-[28px]">warning</span>
          <div>
            <p className="font-bold text-lg">Alerta de Stock Mínimo</p>
            <p className="text-sm">El insumo seleccionado ({selectedObj.stock_actual} {selectedObj.unit}) ha caído por debajo de su reserva mínima ({selectedObj.stock_minimo} {selectedObj.unit}).</p>
          </div>
        </div>
      )}

      {selectedIngredient && (
        <div className="flex flex-wrap gap-4 items-end bg-mist p-4 rounded-xl border border-latte/30">
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Desde (Opcional):</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-latte/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-espresso"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Hasta (Opcional):</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-latte/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-espresso"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-espresso mb-1">Tipo de Movimiento:</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-latte/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-espresso">
              <option value="">Todos los movimientos</option>
              <option value="entrada">Solo Entradas</option>
              <option value="salida_venta">Solo Ventas (Recetas)</option>
              <option value="salida_merma">Solo Mermas (Pérdidas)</option>
            </select>
          </div>
          <button onClick={() => fetchMovements(1)} className="bg-espresso text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-terracota transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span> Filtrar
          </button>
          
          <div className="flex-1"></div>
          
          <button onClick={handleExport} className="bg-sage text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sage/90 flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">download</span> Exportar CSV
          </button>
        </div>
      )}

      {selectedIngredient && typeFilter === 'salida_merma' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-error/5 border border-error/20 p-4 rounded-xl shadow-sm">
            <p className="text-error font-bold text-xs uppercase tracking-wider mb-1">Pérdidas Totales por Mermas</p>
            <p className="text-3xl font-bold text-error">{formatSoles(totalMermas)}</p>
            <p className="text-[10px] text-error/70 mt-1">En el rango de fechas consultado</p>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              {/* Cabecera Agrupada */}
              <tr className="bg-mist text-espresso uppercase text-[11px] tracking-wider border-b border-latte/50">
                <th colSpan={4} className="px-4 py-2 border-r border-latte/30 text-center bg-mist/50">Datos del Movimiento</th>
                <th colSpan={3} className="px-4 py-2 border-r border-latte/30 text-center bg-sage/10 text-sage font-bold">Entradas</th>
                <th colSpan={3} className="px-4 py-2 border-r border-latte/30 text-center bg-error/5 text-error font-bold">Salidas</th>
                <th colSpan={3} className="px-4 py-2 text-center bg-espresso/5 font-bold">Saldos (Valorización)</th>
              </tr>
              {/* Sub-Cabeceras */}
              <tr className="bg-surface-container/30 border-b border-latte/30 text-[10px] text-on-surface-variant uppercase font-bold">
                <th className="px-4 py-3 border-r border-latte/10">Fecha</th>
                <th className="px-4 py-3 border-r border-latte/10">Concepto</th>
                <th className="px-4 py-3 border-r border-latte/10">Detalle / Ref</th>
                <th className="px-4 py-3 border-r border-latte/30">Usuario</th>

                {/* Entradas */}
                <th className="px-4 py-3 border-r border-latte/10 text-right bg-sage/5">Cant.</th>
                <th className="px-4 py-3 border-r border-latte/10 text-right bg-sage/5">C.Unit</th>
                <th className="px-4 py-3 border-r border-latte/30 text-right bg-sage/5">C.Total</th>

                {/* Salidas */}
                <th className="px-4 py-3 border-r border-latte/10 text-right bg-error/5">Cant.</th>
                <th className="px-4 py-3 border-r border-latte/10 text-right bg-error/5">C.Unit</th>
                <th className="px-4 py-3 border-r border-latte/30 text-right bg-error/5">C.Total</th>

                {/* Saldos */}
                <th className="px-4 py-3 border-r border-latte/10 text-right bg-espresso/5">Cant.</th>
                <th className="px-4 py-3 border-r border-latte/10 text-right bg-espresso/5">C.Promedio</th>
                <th className="px-4 py-3 text-right bg-espresso/5 text-espresso">Val.Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/20 text-sm">
              {!selectedIngredient ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-on-surface-variant">Selecciona un insumo para ver su historial en el Kardex.</td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-on-surface-variant">Cargando movimientos...</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-on-surface-variant">No hay movimientos registrados para este insumo.</td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const isEntrada = mov.type === 'entrada';
                  const isSalida = mov.type === 'salida_venta' || mov.type === 'salida_merma';
                  const unit = mov.ingredient?.unit || '';

                  return (
                    <tr key={mov.id} className="hover:bg-mist/30 transition-colors">
                      {/* Datos del Movimiento */}
                      <td className="px-4 py-3 border-r border-latte/10 whitespace-nowrap text-espresso text-xs font-mono">{formatDate(mov.created_at)}</td>
                      <td className="px-4 py-3 border-r border-latte/10 whitespace-nowrap">{getMovementLabel(mov.type)}</td>
                      <td className="px-4 py-3 border-r border-latte/10 max-w-[200px] truncate text-xs text-on-surface-variant" title={mov.reason || mov.document_ref || '-'}>
                        {mov.reason || mov.document_ref || '-'}
                      </td>
                      <td className="px-4 py-3 border-r border-latte/30 whitespace-nowrap text-xs text-espresso font-bold">{mov.user?.name || '-'}</td>

                      {/* Entradas */}
                      <td className="px-4 py-3 border-r border-latte/10 text-right text-sage font-bold font-mono text-xs">{isEntrada ? `${mov.quantity} ${unit}` : ''}</td>
                      <td className="px-4 py-3 border-r border-latte/10 text-right text-sage font-mono text-xs">{isEntrada ? formatSoles(mov.cost_per_unit) : ''}</td>
                      <td className="px-4 py-3 border-r border-latte/30 text-right text-sage font-bold font-mono text-xs">{isEntrada ? formatSoles(mov.total_cost) : ''}</td>

                      {/* Salidas */}
                      <td className="px-4 py-3 border-r border-latte/10 text-right text-error font-bold font-mono text-xs">{isSalida ? `${mov.quantity} ${unit}` : ''}</td>
                      <td className="px-4 py-3 border-r border-latte/10 text-right text-error font-mono text-xs">{isSalida ? formatSoles(mov.cost_per_unit) : ''}</td>
                      <td className="px-4 py-3 border-r border-latte/30 text-right text-error font-bold font-mono text-xs">{isSalida ? formatSoles(mov.total_cost) : ''}</td>

                      {/* Saldos */}
                      <td className="px-4 py-3 border-r border-latte/10 text-right text-espresso font-bold font-mono text-xs bg-espresso/5">{mov.saldo_cantidad} {unit}</td>
                      <td className="px-4 py-3 border-r border-latte/10 text-right text-on-surface-variant font-mono text-xs bg-espresso/5">{formatSoles(mov.saldo_costo_unitario)}</td>
                      <td className="px-4 py-3 text-right text-espresso font-bold font-mono text-sm bg-espresso/10">{formatSoles(mov.saldo_costo_total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {total > 0 && selectedIngredient && (
          <div className="px-6 py-4 border-t border-latte/30 bg-mist flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              Mostrando página <span className="font-bold text-espresso">{currentPage}</span> de <span className="font-bold text-espresso">{lastPage}</span> 
              <span className="text-on-surface-variant/60 ml-2">({total} registros)</span>
            </p>

            {lastPage > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchMovements(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-latte/50 text-sm font-medium text-espresso hover:bg-latte/20 disabled:opacity-40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  Recientes
                </button>
                <button
                  onClick={() => fetchMovements(currentPage + 1)}
                  disabled={currentPage === lastPage}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-latte/50 text-sm font-medium text-espresso hover:bg-latte/20 disabled:opacity-40 transition-colors"
                >
                  Antiguos
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
