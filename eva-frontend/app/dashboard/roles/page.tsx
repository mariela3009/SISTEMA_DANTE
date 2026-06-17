"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { showToast } from "../../components/Toast";

interface Permission {
  id: number;
  role: string;
  module: string;
  module_label: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

type PermissionsByRole = Record<string, Permission[]>;

const ROLES = [
  { key: "admin", label: "Administrador", icon: "shield_person", color: "primary" },
  { key: "cajero", label: "Cajero", icon: "point_of_sale", color: "sage" },
  { key: "cocina", label: "Cocina", icon: "soup_kitchen", color: "terracota" },
];

const PERMISSION_COLS = [
  { key: "can_view", label: "Acceso al Módulo", icon: "vpn_key" },
];

const MODULE_ICONS: Record<string, string> = {
  dashboard: "dashboard",
  pos: "point_of_sale",
  ventas: "receipt_long",
  inventario: "inventory_2",
  productos: "restaurant_menu",
  mermas: "delete_sweep",
  clientes: "group",
  promociones: "campaign",
  ia: "auto_awesome",
  personal: "badge",
  roles: "manage_accounts",
  auditoria: "policy",
};

export default function RolesPage() {
  const [permissions, setPermissions] = useState<PermissionsByRole>({});
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("admin");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<PermissionsByRole>({});

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE_URL}/api/role-permissions`);
      if (res.ok) {
        const data = await res.json();
        setPermissions(JSON.parse(JSON.stringify(data)));
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setHasChanges(false);
      } else {
        showToast("Error al cargar los permisos.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const togglePermission = (module: string) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      const rolePerms = [...(updated[activeRole] || [])];
      const idx = rolePerms.findIndex((p) => p.module === module);
      if (idx !== -1) {
        const newVal = !rolePerms[idx].can_view;
        rolePerms[idx] = { 
          ...rolePerms[idx], 
          can_view: newVal,
          can_create: newVal,
          can_edit: newVal,
          can_delete: newVal
        };
      }
      updated[activeRole] = rolePerms;
      return updated;
    });
    setHasChanges(true);
  };

  const toggleAllInColumn = () => {
    setPermissions((prev) => {
      const updated = { ...prev };
      const rolePerms = [...(updated[activeRole] || [])];
      const allEnabled = rolePerms.every((p) => p.can_view);
      const newVal = !allEnabled;
      updated[activeRole] = rolePerms.map((p) => ({ 
        ...p, 
        can_view: newVal,
        can_create: newVal,
        can_edit: newVal,
        can_delete: newVal
      }));
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rolePerms = permissions[activeRole] || [];
      const payload = {
        permissions: rolePerms.map((p) => ({
          module: p.module,
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        })),
      };

      const res = await apiFetch(`${API_BASE_URL}/api/role-permissions/${activeRole}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setPermissions((prev) => ({ ...prev, [activeRole]: data.permissions }));
        setOriginalData((prev) => ({ ...prev, [activeRole]: JSON.parse(JSON.stringify(data.permissions)) }));
        setHasChanges(false);
        showToast(`Permisos del rol "${activeRole}" guardados correctamente.`, "success");
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al guardar los permisos.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(`¿Restaurar los permisos del rol "${activeRole}" a los valores por defecto?`)) return;
    setSaving(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/role-permissions/${activeRole}/reset`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setPermissions((prev) => ({ ...prev, [activeRole]: data.permissions }));
        setOriginalData((prev) => ({ ...prev, [activeRole]: JSON.parse(JSON.stringify(data.permissions)) }));
        setHasChanges(false);
        showToast(data.message, "success");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setPermissions(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
  };

  const currentPerms = permissions[activeRole] || [];
  const activeCount = currentPerms.filter((p) => p.can_view).length;
  const totalCount = currentPerms.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl text-espresso mb-1">
            Roles y Permisos
          </h1>
          <p className="text-on-surface-variant font-body-md text-sm md:text-base">
            Configura qué acciones puede realizar cada rol del sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-espresso border border-latte rounded-lg font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">undo</span>
              Descartar
            </button>
          )}
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-latte text-on-surface-variant rounded-lg font-medium hover:bg-mist transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span className="hidden md:inline">Restaurar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-terracota transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{saving ? "hourglass_empty" : "save"}</span>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-3">
        {ROLES.map((role) => {
          const isActive = activeRole === role.key;
          const rolePerms = permissions[role.key] || [];
          const count = rolePerms.filter((p) => p.can_view).length;

          return (
            <button
              key={role.key}
              onClick={() => {
                if (hasChanges) {
                  if (!confirm("Tienes cambios sin guardar. ¿Deseas cambiar de rol?")) return;
                  setPermissions(JSON.parse(JSON.stringify(originalData)));
                  setHasChanges(false);
                }
                setActiveRole(role.key);
              }}
              className={`flex-1 flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                isActive
                  ? `border-${role.color} bg-${role.color}/10 shadow-sm`
                  : "border-latte/30 bg-surface-container-lowest hover:border-latte hover:bg-mist/50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isActive ? `bg-${role.color}/20` : "bg-latte/20"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isActive ? `text-${role.color}` : "text-on-surface-variant"
                  }`}
                >
                  {role.icon}
                </span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className={`font-label-lg text-sm ${isActive ? "text-espresso" : "text-on-surface-variant"}`}>
                  {role.label}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {count} permisos activos
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Badge */}
      <div className="bg-surface-container-lowest rounded-xl border border-latte/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
          </div>
          <div>
            <span className="font-label-lg text-espresso">
              {ROLES.find((r) => r.key === activeRole)?.label}
            </span>
            <span className="text-on-surface-variant font-body-md ml-2">
              — {activeCount} de {totalCount} módulos habilitados
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <div className="w-32 h-2 bg-latte/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: totalCount > 0 ? `${(activeCount / totalCount) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Permissions Matrix */}
      {loading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-latte/30 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-on-surface-variant font-body-md">Cargando permisos...</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-latte/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 border-b border-latte/30">
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-1/3">
                    Módulo
                  </th>
                  {PERMISSION_COLS.map((col) => {
                    const allChecked =
                      currentPerms.length > 0 &&
                      currentPerms.every((p) => p[col.key as keyof Permission]);
                    return (
                      <th
                        key={col.key}
                        className="px-4 py-4 text-center"
                      >
                        <button
                          onClick={() => toggleAllInColumn()}
                          className="inline-flex flex-col items-center gap-1 group cursor-pointer"
                          title={`${allChecked ? "Desmarcar" : "Marcar"} todos — ${col.label}`}
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
                            {col.icon}
                          </span>
                          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider group-hover:text-primary transition-colors">
                            {col.label}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-latte/20">
                {currentPerms.map((perm) => (
                  <tr
                    key={perm.module}
                    className="hover:bg-mist/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-latte/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
                            {MODULE_ICONS[perm.module] || "folder"}
                          </span>
                        </div>
                        <span className="font-label-lg text-espresso text-sm">
                          {perm.module_label}
                        </span>
                      </div>
                    </td>
                    {PERMISSION_COLS.map((col) => {
                      const checked = perm[col.key as keyof Permission] as boolean;
                      return (
                        <td key={col.key} className="px-4 py-4 text-center">
                          <button
                            onClick={() => togglePermission(perm.module)}
                            className={`
                              relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30
                              ${checked ? "bg-primary" : "bg-latte/40"}
                            `}
                            aria-label={`${col.label} — ${perm.module_label}`}
                          >
                            <span
                              className={`
                                absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
                                ${checked ? "translate-x-5" : "translate-x-0"}
                              `}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-espresso text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-40 animate-pulse">
          <span className="material-symbols-outlined text-[20px] text-latte">info</span>
          <span className="font-label-md text-sm">Tienes cambios sin guardar</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-2 px-3 py-1 bg-primary rounded-lg text-sm font-bold hover:bg-terracota transition-colors"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
