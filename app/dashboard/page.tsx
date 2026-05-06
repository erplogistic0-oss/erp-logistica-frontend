'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://erp-logistica-backend-production.up.railway.app';

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
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    setOperador(JSON.parse(op));
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resD, resA] = await Promise.all([
        fetch(`${API}/api/despachos`),
        fetch(`${API}/api/alertas`),
      ]);
      setDespachos(await resD.json());
      setAlertas(await resA.json());
    } catch {
      console.error('Error cargando datos');
    } finally {
      setCargando(false);
    }
  };

  const generarOrden = async () => {
    setGenerando(true);
    try {
      const res = await fetch(`${API}/api/ordenes-auto/generar`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Orden generada: ${data.guia.numero_guia}\nCliente: ${data.guia.cliente_nombre}\n\nRevisa tu correo y las Guías de Remisión.`);
        cargarDatos();
      } else {
        alert('Error: ' + data.error);
      }
    } catch {
      alert('No se pudo conectar al servidor');
    } finally {
      setGenerando(false);
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

  const modulos = [
    { label: 'Despachos', icon: '📦', ruta: '/despachos', color: 'hover:border-yellow-400' },
    { label: 'Productos', icon: '🥤', ruta: '/productos', color: 'hover:border-blue-400' },
    { label: 'Alertas', icon: '🔔', ruta: '/alertas', color: 'hover:border-red-400' },
    { label: 'Operadores', icon: '👷', ruta: '/operadores', color: 'hover:border-green-400' },
    { label: 'Vehículos', icon: '🚐', ruta: '/vehiculos', color: 'hover:border-purple-400' },
    { label: 'Guías de Remisión', icon: '📋', ruta: '/guias-remision', color: 'hover:border-orange-400' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-red-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
          <div>
            <h1 className="font-bold text-lg leading-none">LogiControl</h1>
            <p className="text-xs text-red-200">IMPEMAR GROUP — Supervisor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block bg-red-700 px-3 py-1 rounded-full">👤 {operador?.nombre}</span>
          <button onClick={cerrarSesion} className="bg-white text-red-600 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-red-50 transition shadow">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📊 Resumen del día</h2>
            <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Tarjetas estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { valor: pendientes, label: 'Pendientes', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '⏳' },
            { valor: enRuta, label: 'En ruta', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', icon: '🚛' },
            { valor: completados, label: 'Completados', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
            { valor: alertasSinResolver, label: 'Alertas', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: '🔔' },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} border ${item.border} rounded-xl p-5 text-center shadow-sm`}>
              <p className="text-2xl mb-1">{item.icon}</p>
              <p className={`text-3xl font-bold ${item.color}`}>{item.valor}</p>
              <p className="text-sm text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Simulador */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">🤖 Simulador de Órdenes — Arca Continental</h3>
              <p className="text-red-200 text-sm mb-4">Genera automáticamente una orden de carga simulando un pedido de canal moderno (Tambo, Plaza Vea, Tottus, etc.)</p>
              <button onClick={generarOrden} disabled={generando}
                className="bg-white text-red-600 font-bold px-6 py-2.5 rounded-xl hover:bg-red-50 transition disabled:opacity-50 shadow">
                {generando ? '⏳ Generando orden...' : '🤖 Simular orden de Arca Continental'}
              </button>
            </div>
            <img src="/impemar-logo.png" alt="IMPEMAR" className="h-16 w-16 rounded-full object-cover border-2 border-red-400 hidden sm:block" />
          </div>
        </div>

        {/* Módulos */}
        <h3 className="font-bold text-gray-700 mb-4">🗂️ Módulos del sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {modulos.map((item) => (
            <button key={item.ruta} onClick={() => router.push(item.ruta)}
              className={`bg-white rounded-xl shadow-sm border-2 border-transparent p-5 flex items-center gap-3 hover:shadow-md ${item.color} transition text-left`}>
              <span className="text-3xl">{item.icon}</span>
              <span className="font-semibold text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Últimos despachos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                    <th className="pb-3 font-semibold">N° Orden</th>
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {despachos.slice(0, 8).map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-mono font-semibold text-gray-800">{d.numero_orden || '—'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado[d.estado] || 'bg-gray-100 text-gray-600'}`}>
                          {d.estado}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{new Date(d.fecha_despacho).toLocaleDateString('es-PE')}</td>
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