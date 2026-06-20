"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("eva_user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("eva_token");
    localStorage.removeItem("eva_user");
    router.push("/");
  };

  const menuCategories = [
    {
      title: "Control General",
      isFixed: true,
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "dashboard", module: "dashboard" }
      ]
    },
    {
      title: "Operaciones de Caja",
      items: [
        { name: "Punto de Venta", href: "/dashboard/pos", icon: "point_of_sale", module: "pos" },
        { name: "Monitor de Pedidos", href: "/dashboard/despacho", icon: "takeout_dining", module: "ventas" },
        { name: "Ventas", href: "/dashboard/ventas", icon: "receipt_long", module: "ventas" },
        { name: "Promociones", href: "/dashboard/promociones", icon: "campaign", module: "promociones" },
        { name: "Clientes", href: "/dashboard/clientes", icon: "group", module: "clientes" },
      ]
    },
    {
      title: "Logística e Inventario",
      items: [
        { name: "Inventario", href: "/dashboard/inventario", icon: "inventory_2", module: "inventario" },
        { name: "Kardex", href: "/dashboard/kardex", icon: "menu_book", module: "inventario" },
        { name: "Mermas", href: "/dashboard/mermas", icon: "delete_sweep", module: "mermas" },
      ]
    },
    {
      title: "Producción y Menú",
      items: [
        { name: "Comandas (KDS)", href: "/dashboard/cocina", icon: "skillet", module: "cocina" },
        { name: "Productos y Recetas", href: "/dashboard/productos", icon: "restaurant_menu", module: "productos" },
        { name: "Sugerencias IA", href: "/dashboard/sugerencias-ia", icon: "auto_awesome", module: "ia" },
      ]
    },
    {
      title: "Configuración y Seguridad",
      items: [
        { name: "Personal", href: "/dashboard/personal", icon: "badge", module: "personal" },
        { name: "Roles y Permisos", href: "/dashboard/roles", icon: "manage_accounts", module: "roles" },
      ]
    }
  ];

  // Auto-expand category based on current pathname
  useEffect(() => {
    menuCategories.forEach(cat => {
      if (cat.items.some(item => pathname === item.href)) {
        if (!cat.isFixed) setOpenCategory(cat.title);
      }
    });
  }, [pathname]);

  if (!user) {
    return (
      <aside className="w-64 bg-espresso text-mist flex flex-col h-screen sticky top-0">
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

  const isSuperAdmin = user.role === 'admin';

  return (
    <aside className="w-64 bg-espresso text-mist flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-center border-b border-latte/20 px-6">
        <h1 className="font-headline-xl text-3xl font-bold tracking-tight text-latte">EVA</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuCategories.map((category) => {
          // Filtrar items según permisos
          const allowedItems = category.items.filter(item => {
            return user.permissions && user.permissions[item.module] && user.permissions[item.module].can_view;
          });

          // Si el usuario no tiene permiso para nada en esta categoría, no la renderizamos
          if (allowedItems.length === 0) return null;

          const isOpen = openCategory === category.title;

          return (
            <div key={category.title} className="px-2">
              {/* Category Header */}
              {category.isFixed ? (
                // Para el Control General (Fijo), lo renderizamos como links directos sin colapsador
                <div className="space-y-1 mt-2">
                  {allowedItems.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-label-lg transition-colors ${
                        pathname === item.href
                          ? "bg-terracota text-white shadow-sm"
                          : "text-latte hover:bg-dark hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </div>
              ) : (
                // Para las demás categorías, creamos el colapsador
                <div className="mt-4">
                  <button
                    onClick={() => setOpenCategory(isOpen ? null : category.title)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors hover:bg-dark group"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-latte/70 group-hover:text-latte transition-colors">
                      {category.title}
                    </span>
                    <span 
                      className="material-symbols-outlined text-[18px] text-latte/50 transition-transform duration-300"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Submenu Items */}
                  {isOpen && (
                    <div className="mt-1 space-y-1 animate-in slide-in-from-top-1 fade-in duration-200">
                      {allowedItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-terracota text-white shadow-sm"
                                : "text-latte/90 hover:bg-dark hover:text-white"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px] ml-2 opacity-80">{item.icon}</span>
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
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
