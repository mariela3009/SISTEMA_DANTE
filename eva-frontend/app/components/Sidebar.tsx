"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("eva_user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("eva_token");
    localStorage.removeItem("eva_user");
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard", module: "dashboard" },
    { name: "Punto de Venta", href: "/dashboard/pos", icon: "point_of_sale", module: "pos" },
    { name: "Ventas", href: "/dashboard/ventas", icon: "receipt_long", module: "ventas" },
    { name: "Inventario", href: "/dashboard/inventario", icon: "inventory_2", module: "inventario" },
    { name: "Productos y Recetas", href: "/dashboard/productos", icon: "restaurant_menu", module: "productos" },
    { name: "Mermas", href: "/dashboard/mermas", icon: "delete_sweep", module: "mermas" },
    { name: "Clientes", href: "/dashboard/clientes", icon: "group", module: "clientes" },
    { name: "Promociones", href: "/dashboard/promociones", icon: "campaign", module: "promociones" },
    { name: "Sugerencias IA", href: "/dashboard/sugerencias-ia", icon: "auto_awesome", module: "ia" },
    { name: "Personal", href: "/dashboard/personal", icon: "badge", module: "personal" },
    { name: "Roles y Permisos", href: "/dashboard/roles", icon: "manage_accounts", module: "roles" },
  ];

  if (!user) {
    return (
      <aside className="w-64 bg-espresso text-mist flex flex-col min-h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-center border-b border-latte/20 px-6">
          <h1 className="font-headline-xl text-3xl font-bold tracking-tight text-latte">EVA</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-latte text-sm gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-latte"></div>
          Cargando...
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-espresso text-mist flex flex-col min-h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-center border-b border-latte/20 px-6">
        <h1 className="font-headline-xl text-3xl font-bold tracking-tight text-latte">EVA</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          // Si el usuario es admin siempre puede ver, o si tiene permiso can_view en su rol
          const isSuperAdmin = user.role === 'admin';
          const hasPerm = user.permissions && user.permissions[item.module] && user.permissions[item.module].can_view;
          if (!isSuperAdmin && !hasPerm) return null;

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-lg transition-colors ${
                isActive
                  ? "bg-terracota text-white shadow-sm"
                  : "text-latte hover:bg-dark hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-latte/20">
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-latte text-espresso flex items-center justify-center font-bold text-lg">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md text-white truncate">{user.name}</p>
            <p className="font-body-md text-xs text-latte capitalize">{user.role}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-latte hover:bg-error/20 hover:text-error-container transition-colors font-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
