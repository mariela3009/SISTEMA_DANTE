"use client";

import { useState, useEffect } from "react";
import Modal from "../../components/Modal";

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
      const token = localStorage.getItem("eva_token");
      const res = await fetch("http://127.0.0.1:8000/api/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
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
      const token = localStorage.getItem("eva_token");
      const url = editUser 
        ? `http://127.0.0.1:8000/api/users/${editUser.id}` 
        : "http://127.0.0.1:8000/api/users";
      
      const method = editUser ? "PUT" : "POST";
      const body: any = { name, email, role, is_active: isActive };
      if (password) body.password = password; // Only send password if changed/provided

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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

      <div className="bg-mist border border-latte rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-latte/20 text-espresso text-sm">
                <th className="p-4 font-semibold">Nombre</th>
                <th className="p-4 font-semibold">Correo</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">Cargando personal...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">No hay usuarios registrados.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-latte/10 transition-colors">
                    <td className="p-4 font-medium text-espresso">{user.name}</td>
                    <td className="p-4 text-on-surface-variant">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider
                        ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 
                          user.role === 'cocina' ? 'bg-terracota/20 text-terracota' : 
                          'bg-sage/20 text-sage'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${user.is_active ? 'text-sage' : 'text-error'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-sage' : 'bg-error'}`}></span>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openModal(user)}
                        className="text-primary hover:text-espresso transition-colors p-2"
                        title="Editar usuario"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
