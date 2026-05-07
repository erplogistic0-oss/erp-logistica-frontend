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
        alert(`Orden generada: ${data.guia.numero_guia}\nCliente: ${data.guia.cliente_nombre}`);
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
    {
      label: 'Despachos', ruta: '/despachos', color: 'hover:border-yellow-400',
      icon: <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    },
    {
      label: 'Productos', ruta: '/productos', color: 'hover:border-blue-400',
      icon: <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
      label: 'Alertas', ruta: '/alertas', color: 'hover:border-red-400',
      icon: <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    },
    {
      label: 'Operadores', ruta: '/operadores', color: 'hover:border-green-400',
      icon: <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      label: 'Vehículos', ruta: '/vehiculos', color: 'hover:border-purple-400',
      icon: <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4" /></svg>
    },
    {
      label: 'Guías de Remisión', ruta: '/guias-remision', color: 'hover:border-orange-400',
      icon: <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
          <div>
            <h1 className="font-bold text-lg leading-none">LogiControl</h1>
            <p className="text-xs text-red-200">IMPEMAR GROUP — Supervisor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block bg-red-700 px-3 py-1 rounded-full">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {operador?.nombre}
          </span>
          <button onClick={cerrarSesion} className="bg-white text-red-600 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-red-50 transition shadow">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Resumen del día</h2>
            <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={cargarDatos} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { valor: pendientes, label: 'Pendientes', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { valor: enRuta, label: 'En ruta', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', icon: <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg> },
            { valor: completados, label: 'Completados', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', icon: <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { valor: alertasSinResolver, label: 'Alertas', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} border ${item.border} rounded-xl p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                {item.icon}
                <span className={`text-3xl font-bold ${item.color}`}>{item.valor}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
                <h3 className="font-bold text-lg">Simulador de Órdenes — Arca Continental</h3>
              </div>
              <p className="text-red-200 text-sm mb-4">Genera automáticamente una orden de carga simulando un pedido de canal moderno</p>
              <button onClick={generarOrden} disabled={generando}
                className="bg-white text-red-600 font-bold px-6 py-2.5 rounded-xl hover:bg-red-50 transition disabled:opacity-50 shadow flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {generando ? 'Generando orden...' : 'Simular orden de Arca Continental'}
              </button>
            </div>
            <img src="/impemar-logo.png" alt="IMPEMAR" className="h-16 w-16 rounded-full object-cover border-2 border-red-400 hidden sm:block" />
          </div>
        </div>

        <h3 className="font-bold text-gray-700 mb-4">Módulos del sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {modulos.map((item) => (
            <button key={item.ruta} onClick={() => router.push(item.ruta)}
              className={`bg-white rounded-xl shadow-sm border-2 border-transparent p-5 flex items-center gap-3 hover:shadow-md ${item.color} transition text-left`}>
              {item.icon}
              <span className="font-semibold text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-700 mb-4">Últimos despachos</h3>
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