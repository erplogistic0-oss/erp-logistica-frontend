'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://erp-logistica-backend-production.up.railway.app';

interface Operador {
  id: string;
  nombre: string;
  usuario: string;
  telefono: string;
  pin_acceso: string;
  rol: string;
  activo: boolean;
}

export default function OperadoresPage() {
  const router = useRouter();
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ nombre: '', usuario: '', telefono: '', pin_acceso: '' });

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    const opData = JSON.parse(op);
    setEsAdmin(opData.rol === 'admin');
    cargarOperadores();
  }, []);

  const cargarOperadores = async () => {
    try {
      const res = await fetch(`${API}/api/operadores`);
      setOperadores(await res.json());
    } catch {
      console.error('Error cargando operadores');
    } finally {
      setCargando(false);
    }
  };

  const crearOperador = async () => {
    if (!form.nombre || !form.usuario || !form.pin_acceso) {
      alert('Nombre, usuario y PIN son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`${API}/api/operadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ nombre: '', usuario: '', telefono: '', pin_acceso: '' });
        setMostrarForm(false);
        cargarOperadores();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch {
      alert('No se pudo conectar al servidor');
    } finally {
      setGuardando(false);
    }
  };

  const colorRol: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    supervisor: 'bg-red-100 text-red-700',
    auxiliar: 'bg-blue-100 text-blue-700',
    chofer: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
          <div>
            <h1 className="font-bold text-lg leading-none">LogiControl</h1>
            <p className="text-xs text-red-200">IMPEMAR GROUP — Operadores</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {esAdmin && (
            <button onClick={() => setMostrarForm(true)}
              className="bg-white text-red-600 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-red-50 transition shadow flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nuevo
            </button>
          )}
          <button onClick={() => router.push('/dashboard')}
            className="bg-red-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-800 transition">
            ← Volver
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {mostrarForm && esAdmin && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Nuevo Operador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input type="text" value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                <input type="text" value={form.usuario}
                  onChange={e => setForm({ ...form, usuario: e.target.value })}
                  placeholder="Ej: juan"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="number" value={form.telefono}
                  onChange={e => { if (e.target.value.length <= 9) setForm({ ...form, telefono: e.target.value }); }}
                  placeholder="Ej: 999888777"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN de acceso *</label>
                <input type="password" value={form.pin_acceso}
                  onChange={e => { if (e.target.value.length <= 6) setForm({ ...form, pin_acceso: e.target.value }); }}
                  placeholder="••••"
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={crearOperador} disabled={guardando}
                className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setMostrarForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Personal registrado
            </h3>
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{operadores.length} operadores</span>
          </div>
          {cargando ? (
            <p className="p-6 text-gray-400 text-sm">Cargando...</p>
          ) : operadores.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">No hay operadores registrados.</p>
          ) : (
            <div className="divide-y">
              {operadores.filter(o => o.rol !== 'admin').map(o => (
                <div key={o.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow">
                      {o.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{o.nombre}</p>
                      <p className="text-xs text-gray-400">@{o.usuario} · {o.telefono || 'Sin teléfono'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorRol[o.rol] || 'bg-gray-100 text-gray-600'}`}>
                      {o.rol || 'sin rol'}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${o.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {o.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}