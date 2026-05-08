'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://erp-logistica-backend-production.up.railway.app';

interface Vehiculo {
  id: string;
  placa: string;
  tipo: string;
  capacidad_kg: number;
  disponible: boolean;
}

export default function VehiculosPage() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ placa: '', tipo: 'furgoneta', capacidad_kg: '' });

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    const opData = JSON.parse(op);
    setEsAdmin(opData.rol === 'admin');
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const res = await fetch(`${API}/api/vehiculos`);
      setVehiculos(await res.json());
    } catch {
      console.error('Error cargando vehículos');
    } finally {
      setCargando(false);
    }
  };

  const crearVehiculo = async () => {
    if (!form.placa || !form.tipo) { alert('Placa y tipo son obligatorios'); return; }
    setGuardando(true);
    try {
      const res = await fetch(`${API}/api/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: form.placa.toUpperCase(),
          tipo: form.tipo,
          capacidad_kg: parseFloat(form.capacidad_kg) || 0,
          disponible: true,
        }),
      });
      if (res.ok) {
        setForm({ placa: '', tipo: 'furgoneta', capacidad_kg: '' });
        setMostrarForm(false);
        cargarVehiculos();
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

  const tipoIcono = (tipo: string) => {
    if (tipo.includes('camión')) return (
      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
    );
    return (
      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4" /></svg>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
          <div>
            <h1 className="font-bold text-lg leading-none">LogiControl</h1>
            <p className="text-xs text-red-200">IMPEMAR GROUP — Vehículos</p>
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
            <h3 className="font-bold text-gray-700 mb-4">Nuevo Vehículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input type="text" value={form.placa}
                  onChange={e => setForm({ ...form, placa: e.target.value })}
                  placeholder="Ej: ABC-123"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  <option value="furgoneta">Furgoneta</option>
                  <option value="camión 3t">Camión 3t</option>
                  <option value="camión 5t">Camión 5t</option>
                  <option value="moto">Moto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (kg)</label>
                <input type="number" value={form.capacidad_kg}
                  onChange={e => setForm({ ...form, capacidad_kg: e.target.value })}
                  placeholder="Ej: 1000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={crearVehiculo} disabled={guardando}
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
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
              Flota de vehículos
            </h3>
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{vehiculos.length} vehículos</span>
          </div>
          {cargando ? (
            <p className="p-6 text-gray-400 text-sm">Cargando...</p>
          ) : vehiculos.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">No hay vehículos registrados.</p>
          ) : (
            <div className="divide-y">
              {vehiculos.map(v => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {tipoIcono(v.tipo)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 font-mono">{v.placa}</p>
                      <p className="text-xs text-gray-400 capitalize">{v.tipo} · {v.capacidad_kg} kg</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${v.disponible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {v.disponible ? 'Disponible' : 'En uso'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}