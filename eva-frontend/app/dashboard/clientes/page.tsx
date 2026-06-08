"use client";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { apiFetch } from "../../lib/api";

interface Client {
  id: number;
  name: string;
  document_type: "dni" | "ruc";
  document_number: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [documentFilter, setDocumentFilter] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<"dni" | "ruc">("dni");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      const url = new URL("http://localhost:8000/api/clients");
      if (searchTerm) url.searchParams.append("search", searchTerm);
      if (documentFilter) url.searchParams.append("document_type", documentFilter);

      const res = await apiFetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setClients(data.data || []); // Laravel paginated response
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchTerm, documentFilter]);

  const openModal = (client: Client | null = null) => {
    setError("");
    setEditClient(client);
    if (client) {
      setName(client.name);
      setDocumentType(client.document_type);
      setDocumentNumber(client.document_number);
      setEmail(client.email || "");
      setPhone(client.phone || "");
    } else {
      setName("");
      setDocumentType("dni");
      setDocumentNumber("");
      setEmail("");
      setPhone("");
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!name.trim()) return "El nombre o razón social es obligatorio.";
    if (documentType === "dni" && !/^\d{8}$/.test(documentNumber)) {
      return "El DNI debe tener exactamente 8 dígitos numéricos.";
    }
    if (documentType === "ruc" && !/^\d{11}$/.test(documentNumber)) {
      return "El RUC debe tener exactamente 11 dígitos numéricos.";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "El correo electrónico no es válido.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const url = editClient 
        ? `http://localhost:8000/api/clients/${editClient.id}`
        : "http://localhost:8000/api/clients";
      const method = editClient ? "PUT" : "POST";
      
      const body = {
        name,
        document_type: documentType,
        document_number: documentNumber,
        email: email || null,
        phone: phone || null,
      };

      const res = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.errors?.document_number?.[0] || "Error al procesar el cliente.");
      }

      setIsModalOpen(false);
      fetchClients();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${client.name}?`)) return;

    try {
      const res = await apiFetch(`http://localhost:8000/api/clients/${client.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        fetchClients();
      } else {
        alert(data.message || "Error al eliminar cliente.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Clientes</h1>
          <p className="text-on-surface-variant">Registra y administra los datos de los clientes para facturación (DNI / RUC).</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-terracota transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Cliente
        </button>
      </div>

      {/* Filters and Table Card */}
      <div className="bg-mist border border-latte rounded-xl overflow-hidden shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-latte flex flex-col md:flex-row gap-4 bg-latte/10">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre, DNI/RUC o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-latte/60 rounded-lg focus:outline-none focus:border-primary text-sm transition-colors placeholder-on-surface-variant/40"
            />
          </div>
          <select 
            value={documentFilter}
            onChange={(e) => setDocumentFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-latte/60 rounded-lg focus:outline-none focus:border-primary text-sm text-espresso transition-colors"
          >
            <option value="">Todos los documentos</option>
            <option value="dni">DNI</option>
            <option value="ruc">RUC</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-latte/20 text-espresso text-sm border-b border-latte/30">
                <th className="p-4 font-semibold">Cliente / Razón Social</th>
                <th className="p-4 font-semibold">Documento</th>
                <th className="p-4 font-semibold">Contacto</th>
                <th className="p-4 font-semibold">Fecha Registro</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte/30 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">Cargando clientes...</td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">No hay clientes registrados.</td>
                </tr>
              ) : (
                clients.map(client => (
                  <tr key={client.id} className="hover:bg-latte/5 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-espresso">{client.name}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit mb-1
                          ${client.document_type === 'ruc' ? 'bg-primary/10 text-primary' : 'bg-sage/10 text-sage'}`}>
                          {client.document_type}
                        </span>
                        <span className="font-mono text-espresso text-xs font-semibold">{client.document_number}</span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <p className="text-xs">{client.email || '—'}</p>
                      <p className="text-xs">{client.phone || '—'}</p>
                    </td>
                    <td className="p-4 text-on-surface-variant text-xs font-mono">
                      {new Date(client.created_at).toLocaleDateString('es-PE')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => openModal(client)}
                          className="text-primary hover:bg-primary/10 rounded p-1.5 transition-colors"
                          title="Editar cliente"
                        >
                          <span className="material-symbols-outlined text-[18px] block">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(client)}
                          className="text-error hover:bg-error/10 rounded p-1.5 transition-colors"
                          title="Eliminar cliente"
                        >
                          <span className="material-symbols-outlined text-[18px] block">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editClient ? "Editar Cliente" : "Nuevo Cliente"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-error bg-error/10 border border-error/20 p-3 rounded-lg text-sm font-semibold">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-espresso mb-1">Nombre Completo o Razón Social</label>
            <input 
              type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej. Juan Pérez o Distribuidora Dante S.A.C."
              className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-espresso mb-1">Tipo Documento</label>
              <select 
                value={documentType} onChange={e => {
                  setDocumentType(e.target.value as "dni" | "ruc");
                  setDocumentNumber(""); // Clear to match type length
                }}
                className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="dni">DNI (Persona Natural)</option>
                <option value="ruc">RUC (Persona Jurídica)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-espresso mb-1">Número de Documento</label>
              <input 
                type="text" required value={documentNumber} 
                onChange={e => setDocumentNumber(e.target.value.replace(/\D/g, ''))} // only digits
                maxLength={documentType === 'dni' ? 8 : 11}
                placeholder={documentType === 'dni' ? "8 dígitos" : "11 dígitos"}
                className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-espresso mb-1">Correo Electrónico (opcional)</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-espresso mb-1">Teléfono (opcional)</label>
              <input 
                type="text" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Ej. 987654321"
                className="w-full px-3 py-2 bg-white border border-latte rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-latte mt-6">
            <button 
              type="button" onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-on-surface-variant hover:text-espresso font-medium transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-terracota transition-colors text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
