"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AlertsNavbar from "../components/AlertsNavbar";
import ToastContainer from "../components/Toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("eva_token");
    if (!token) {
      router.replace("/");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>;

  return (
    <div className="flex h-screen bg-surface relative overflow-hidden">
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-espresso text-mist rounded-lg shadow-md print:hidden"
        onClick={() => {
          const sidebar = document.getElementById('sidebar');
          sidebar?.classList.toggle('-translate-x-full');
        }}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Sidebar Wrapper */}
      <div id="sidebar" className="fixed inset-y-0 left-0 z-40 transform -translate-x-full md:relative md:translate-x-0 transition-transform duration-300 ease-in-out h-full shadow-2xl md:shadow-none print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible bg-surface print:bg-white">
        <header className="h-16 border-b border-latte bg-surface flex items-center justify-end px-4 md:px-8 print:hidden shrink-0">
          <AlertsNavbar />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible bg-surface print:bg-white text-espresso print:text-black">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
