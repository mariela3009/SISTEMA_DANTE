"use client";
import { API_BASE_URL, apiFetch } from "@/app/lib/api";

import { useState, useEffect } from "react";

interface Alert {
  alert_category?: 'stock' | 'expiration';
  type: string;
  ingredient: string;
  current?: number;
  min?: number;
  unit?: string;
  days?: number;
  date?: string;
}

export default function AlertsNavbar() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/alerts/stock`);
        if (res && res.ok) {
          const data = await res.json();
          setAlerts(data.alertas || []);
        }
      } catch (error) {
        console.error("Error fetching alerts", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-espresso hover:bg-mist rounded-full transition-colors"
      >
        <span className="material-symbols-outlined">notifications</span>
        {alerts.length > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-terracota rounded-full border-2 border-surface text-[10px] font-bold text-white flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-latte rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 bg-mist border-b border-latte flex justify-between items-center">
            <h3 className="font-semibold text-espresso">Alertas de Stock</h3>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-espresso">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-on-surface-variant">
                No hay alertas de stock mínimo.
              </div>
            ) : (
              alerts.map((alert, idx) => {
                if (alert.alert_category === 'expiration') {
                  const isExpired = alert.days !== undefined && alert.days < 0;
                  return (
                    <div key={idx} className="p-3 border-b border-latte/50 hover:bg-mist/50 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-error">event_busy</span>
                        <div>
                          <p className="text-sm font-medium text-espresso">{alert.ingredient}</p>
                          <p className="text-xs text-on-surface-variant">
                            {isExpired ? (
                              <span className="text-error font-bold">Vencido desde el {alert.date}</span>
                            ) : (
                              <span className="text-terracota font-bold">Vence en {alert.days} días ({alert.date})</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="p-3 border-b border-latte/50 hover:bg-mist/50 transition-colors">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-terracota">warning</span>
                      <div>
                        <p className="text-sm font-medium text-espresso">{alert.ingredient}</p>
                        <p className="text-xs text-on-surface-variant">
                          Stock {alert.type}: <span className="text-terracota font-bold">{alert.current}</span> {alert.unit} (Mínimo: {alert.min})
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
