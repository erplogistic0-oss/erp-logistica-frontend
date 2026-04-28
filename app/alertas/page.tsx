'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Alerta {
  id: string;
  mensaje: string;
  tipo: string;
  resuelta: boolean;
  created_at: string;
}

export default function AlertasPage() {
  const router = useRouter();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'resueltas'>('pendientes');

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/alertas');
      const data = await res.json();
      setAlertas(data);
    } catch {
      console.error('Error cargando alertas');
    } finally {
      setCargando(false);
    }
  };

  const resolverAlerta = async (id: string) => {
    try {
      await fetch(`http://localhost:3002/api/alertas/${id}/resolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      cargarAlertas();
    } catch {
      console.error('Error resolviendo alerta');
    }
  };

  const alertasFiltradas = alertas.filter(a => {
    if (filtro === 'pendientes') return !a.resuelta;
    if (filtro === 'resueltas') return a.resuelta;
    return true;
  });

  const colorTipo: Record<string, string> = {
    error: 'bg-red-100 text-red-700 border-red-200',
    advertencia: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const iconoTipo: Record<string, string> = {
    error: '🔴',
    advertencia: '🟡',
    info: '🔵',
  };

  const pendientes = alertas.filter(a => !a.resuelta).length;

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-red-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-white hover:text-red-200 text-lg">←</button>
          <span className="text-2xl">🔔</span>
          <h1 className="font-bold text-lg">Alertas</h1>
          {pendientes > 0 && (
            <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">
              {pendientes}
            </span>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {(['pendientes', 'resueltas', 'todas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                filtro === f
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : alertasFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500 font-medium">No hay alertas {filtro === 'pendientes' ? 'pendientes' : ''}</p>
            </div>
          ) : (
            alertasFiltradas.map((a) => (
              <div
                key={a.id}
                className={`bg-white rounded-xl shadow p-5 border-l-4 flex items-start justify-between gap-4 ${
                  a.resuelta ? 'opacity-60' : colorTipo[a.tipo] || 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{iconoTipo[a.tipo] || '⚪'}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{a.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(a.created_at).toLocaleString('es-PE')}
                    </p>
                    {a.resuelta && (
                      <span className="text-xs text-green-600 font-medium">✓ Resuelta</span>
                    )}
                  </div>
                </div>
                {!a.resuelta && (
                  <button
                    onClick={() => resolverAlerta(a.id)}
                    className="bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap"
                  >
                    Resolver
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}