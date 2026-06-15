"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// Evento global para disparar toasts desde cualquier parte
const TOAST_EVENT = "eva:toast";

export function showToast(message: string, type: ToastType = "info") {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}

const icons: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const styles: Record<ToastType, string> = {
  success: "bg-green-50 border-green-400 text-green-800",
  error:   "bg-red-50 border-red-400 text-red-800",
  warning: "bg-amber-50 border-amber-400 text-amber-800",
  info:    "bg-blue-50 border-blue-400 text-blue-800",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-green-500",
  error:   "text-red-500",
  warning: "text-amber-500",
  info:    "text-blue-500",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4500);
    };

    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
            max-w-sm w-full animate-slide-in
            ${styles[toast.type]}
          `}
        >
          <span className={`material-symbols-outlined text-[22px] mt-0.5 flex-shrink-0 ${iconStyles[toast.type]}`}>
            {icons[toast.type]}
          </span>
          <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
