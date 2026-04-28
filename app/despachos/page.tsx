'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Despacho {
  id: string;
  numero_orden: string;
  estado: string;
  fecha_despacho: string;
  observaciones?: string;
}

interface Operador {
  id: string;
  nombre: string;
}

interface Vehiculo {
  id: string;
  placa: string;
  tipo: string;
}

export default function DespachosPage() {
  const router = useRouter();
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    numero_orden: '',
    operador_id: '',
    vehiculo_id: '',
    fecha_despacho: new Date().toISOString().slice(0, 16),
    observaciones: '',
  });

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [resD, resO, resV] = await Promise.all([
        fetch('http://localhost:3002/api/despachos'),
        fetch('http://localhost:3002/api/operadores'),
        fetch('http://localhost:3002/api/vehiculos'),
      ]);
      setDespachos(await resD.json());
      setOperadores(await resO.json());
      setVehiculos(await resV.json());
    } catch {
      console.error('Error cargando datos');
    } finally {
      setCargando(false);
    }
  };

  const crearDespacho = async () => {
    if (!form.numero_orden || !form.operador_id || !form.vehiculo_id) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch('http://localhost:3002/api/despachos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_orden: form.numero_orden,
          operador_id: form.operador_id,
          vehiculo_id: form.vehiculo_id,
          fecha_despacho: form.fecha_despacho,
          observaciones: form.observaciones,
        }),
      });
      if (res.ok) {
        setForm({ numero_orden: '', operador_id: '', vehiculo_id: '', fecha_despacho: new Date().toISOString().slice(0, 16), observaciones: '' });
        setMostrarForm(false);
        cargarTodo();
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

  const cambiarEstado = async (id: string, estado: string) => {
    await fetch(`http://localhost:3002/api/despachos/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    cargarTodo();
  };

  const colorEstado: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    en_ruta: 'bg-blue-100 text-blue-700',
    completado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-red-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-white hover:text-red-200 text-lg">←</button>
          <span className="text-2xl">📦</span>
          <h1 className="font-bold text-lg">Despachos</h1>
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
            <h3 className="font-bold text-gray-700 mb-4">Nuevo Despacho</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Orden *</label>
                <input
                  type="text"
                  value={form.numero_orden}
                  onChange={(e) => setForm({ ...form, numero_orden: e.target.value })}
                  placeholder="Ej: ORD-001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="datetime-local"
                  value={form.fecha_despacho}
                  onChange={(e) => setForm({ ...form, fecha_despacho: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operador *</label>
                <select
                  value={form.operador_id}
                  onChange={(e) => setForm({ ...form, operador_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccionar operador</option>
                  {operadores.map((o) => (
                    <option key={o.id} value={o.id}>{o.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo *</label>
                <select
                  value={form.vehiculo_id}
                  onChange={(e) => setForm({ ...form, vehiculo_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>{v.placa} — {v.tipo}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  placeholder="Opcional..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={crearDespacho}
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
          <div className="p-6 border-b">
            <h3 className="font-bold text-gray-700">Todos los despachos</h3>
          </div>
          {cargando ? (
            <p className="p-6 text-gray-400 text-sm">Cargando...</p>
          ) : despachos.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">No hay despachos registrados.</p>
          ) : (
            <div className="divide-y">
              {despachos.map((d) => (
                <div key={d.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800 font-mono">{d.numero_orden || 'Sin número'}</p>
                    <p className="text-xs text-gray-400">{new Date(d.fecha_despacho).toLocaleDateString('es-PE')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorEstado[d.estado] || 'bg-gray-100 text-gray-600'}`}>
                      {d.estado}
                    </span>
                    {d.estado === 'pendiente' && (
                      <button onClick={() => cambiarEstado(d.id, 'en_ruta')} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
                        Iniciar
                      </button>
                    )}
                    {d.estado === 'en_ruta' && (
                      <button onClick={() => cambiarEstado(d.id, 'completado')} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">
                        Completar
                      </button>
                    )}
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