"use client";
import { API_BASE_URL } from "@/app/lib/api";

import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import DataTable from "../../components/ui/DataTable";
import { apiFetch } from "../../lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function PersonalPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cajero");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user: User | null = null) => {
    setError("");
    setEditUser(user);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setRole(user.role);
      setIsActive(user.is_active);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("cajero");
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const url = editUser 
        ? `${API_BASE_URL}/api/users/${editUser.id}` 
        : `${API_BASE_URL}/api/users`;
      
      const method = editUser ? "PUT" : "POST";
      const body: any = { name, email, role, is_active: isActive };
      if (password) body.password = password;

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al guardar el usuario");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Correo" },
    { 
      key: "role", 
      label: "Rol",
      render: (row: User) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider
          ${row.role === 'admin' ? 'bg-primary/20 text-primary' : 
            row.role === 'cocina' ? 'bg-terracota/20 text-terracota' : 
            'bg-sage/20 text-sage'}`}>
          {row.role}
        </span>
      )
    },
    { 
      key: "is_active", 
      label: "Estado",
      render: (row: User) => (
        <span className={`flex items-center gap-1.5 text-xs font-medium ${row.is_active ? 'text-sage' : 'text-error'}`}>
          <span className={`w-2 h-2 rounded-full ${row.is_active ? 'bg-sage' : 'bg-error'}`}></span>
          {row.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Personal</h1>
          <p className="text-on-surface-variant">Gestiona los accesos y roles del equipo.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-terracota transition-colors"
        >
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Empleado
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-on-surface-variant">Cargando personal...</div>
      ) : (
        <DataTable 
          columns={columns} 
          data={users} 
          onEdit={(user) => openModal(user)}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editUser ? "Editar Empleado" : "Nuevo Empleado"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-error bg-error-container/50 p-3 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-espresso mb-1">Nombre Completo</label>
            <input 
              type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-latte rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-espresso mb-1">Correo Electrónico</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-latte rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-espresso mb-1">Contraseña {editUser && <span className="text-xs text-on-surface-variant font-normal">(Dejar en blanco para no cambiar)</span>}</label>
            <input 
              type="password" required={!editUser} value={password} onChange={e => setPassword(e.target.value)} minLength={6}
              className="w-full px-3 py-2 bg-surface border border-latte rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">Rol</label>
              <select 
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-latte rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="cajero">Cajero</option>
                <option value="cocina">Cocina</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">Estado</label>
              <div className="flex items-center h-[42px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  <div className="w-11 h-6 bg-latte peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-3 text-sm font-medium text-espresso">{isActive ? "Activo" : "Inactivo"}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-latte">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:text-espresso font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-terracota transition-colors">
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
