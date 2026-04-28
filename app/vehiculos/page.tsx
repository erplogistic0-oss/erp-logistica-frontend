'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    placa: '',
    tipo: 'furgoneta',
    capacidad_kg: '',
  });

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const res = await fetch('https://erp-logistica-backend-production.up.railway.app/api/vehiculos');
      const data = await res.json();
      setVehiculos(data);
    } catch {
      console.error('Error cargando vehículos');
    } finally {
      setCargando(false);
    }
  };

  const crearVehiculo = async () => {
    if (!form.placa || !form.tipo) {
      alert('Placa y tipo son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch('https://erp-logistica-backend-production.up.railway.app/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: form.placa.toUpperCase(),
          tipo: form.tipo,
          capacidad_kg: parseFloat(form.capacidad_kg) || 0,
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

  const iconoTipo: Record<string, string> = {
    furgoneta: '🚐',
    'camión 3t': '🚛',
    'camión 5t': '🚚',
    moto: '🏍️',
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-red-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-white hover:text-red-200 text-lg">←</button>
          <span className="text-2xl">🚐</span>
          <h1 className="font-bold text-lg">Vehículos</h1>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-white text-red-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition"
        >
          + Nuevo
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Formulario */}
        {mostrarForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Nuevo Vehículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input
                  type="text"
                  value={form.placa}
                  onChange={(e) => setForm({ ...form, placa: e.target.value })}
                  placeholder="Ej: ABC-123"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="furgoneta">Furgoneta</option>
                  <option value="camión 3t">Camión 3t</option>
                  <option value="camión 5t">Camión 5t</option>
                  <option value="moto">Moto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (kg)</label>
                <input
                  type="number"
                  value={form.capacidad_kg}
                  onChange={(e) => setForm({ ...form, capacidad_kg: e.target.value })}
                  placeholder="Ej: 1000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={crearVehiculo}
                disabled={guardando}
                className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setMostrarForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Flota de vehículos</h3>
            <span className="text-sm text-gray-400">{vehiculos.length} vehículos</span>
          </div>
          {cargando ? (
            <p className="p-6 text-gray-400 text-sm">Cargando...</p>
          ) : vehiculos.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">No hay vehículos registrados.</p>
          ) : (
            <div className="divide-y">
              {vehiculos.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{iconoTipo[v.tipo] || '🚗'}</span>
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
