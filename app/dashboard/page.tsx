'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Despacho {
  id: string;
  numero_orden: string;
  estado: string;
  fecha_despacho: string;
}

interface Alerta {
  id: string;
  mensaje: string;
  tipo: string;
  resuelta: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [operador, setOperador] = useState<{ nombre: string } | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    setOperador(JSON.parse(op));
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resD, resA] = await Promise.all([
        fetch('https://erp-logistica-backend-production.up.railway.app/api/despachos'),
        fetch('https://erp-logistica-backend-production.up.railway.app/api/alertas'),
      ]);
      setDespachos(await resD.json());
      setAlertas(await resA.json());
    } catch {
      console.error('Error cargando datos');
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('operador');
    router.push('/');
  };

  const pendientes = despachos.filter(d => d.estado === 'pendiente').length;
  const enRuta = despachos.filter(d => d.estado === 'en_ruta').length;
  const completados = despachos.filter(d => d.estado === 'completado').length;
  const alertasSinResolver = alertas.filter(a => !a.resuelta).length;

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
          <span className="text-2xl">🚛</span>
          <div>
            <h1 className="font-bold text-lg leading-none">LogiControl</h1>
            <p className="text-xs text-red-200">IMPEMAR GROUP</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block">👤 {operador?.nombre}</span>
          <button
            onClick={cerrarSesion}
            className="bg-white text-red-600 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Resumen del día</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-yellow-500">{pendientes}</p>
            <p className="text-sm text-gray-500 mt-1">Pendientes</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-blue-500">{enRuta}</p>
            <p className="text-sm text-gray-500 mt-1">En ruta</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-green-500">{completados}</p>
            <p className="text-sm text-gray-500 mt-1">Completados</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-red-500">{alertasSinResolver}</p>
            <p className="text-sm text-gray-500 mt-1">Alertas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Despachos', icon: '📦', ruta: '/despachos' },
            { label: 'Productos', icon: '🥤', ruta: '/productos' },
            { label: 'Alertas', icon: '🔔', ruta: '/alertas' },
            { label: 'Operadores', icon: '👷', ruta: '/operadores' },
            { label: 'Vehículos', icon: '🚐', ruta: '/vehiculos' },
          ].map((item) => (
            <button
              key={item.ruta}
              onClick={() => router.push(item.ruta)}
              className="bg-white rounded-xl shadow p-5 flex items-center gap-3 hover:shadow-md hover:bg-red-50 transition text-left"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-700 mb-4">📋 Últimos despachos</h3>
          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : despachos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay despachos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">N° Orden</th>
                    <th className="pb-2">Estado</th>
                    <th className="pb-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {despachos.slice(0, 8).map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-mono font-semibold">{d.numero_orden || '—'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado[d.estado] || 'bg-gray-100 text-gray-600'}`}>
                          {d.estado}
                        </span>
                      </td>
                      <td className="py-2 text-gray-400">
                        {new Date(d.fecha_despacho).toLocaleDateString('es-PE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
