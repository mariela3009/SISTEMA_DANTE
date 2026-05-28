"use client";

import { useState, useEffect } from "react";

interface Alert {
  type: string;
  ingredient: string;
  current: number;
  min: number;
  unit: string;
}

export default function AlertsNavbar() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("eva_token");
        const res = await fetch("http://127.0.0.1:8000/api/alerts/stock", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
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
              alerts.map((alert, idx) => (
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
