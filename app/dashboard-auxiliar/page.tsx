'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://erp-logistica-backend-production.up.railway.app';

interface Guia {
    id: string;
    numero_guia: string;
    estado: string;
    cliente_nombre: string;
    cliente_ruc: string;
    punto_partida: string;
    punto_llegada: string;
    fecha_traslado: string;
    numero_carga: string;
    operadores?: { nombre: string };
    vehiculos?: { placa: string };
}

export default function DashboardAuxiliarPage() {
    const router = useRouter();
    const [guias, setGuias] = useState<Guia[]>([]);
    const [operador, setOperador] = useState<{ nombre: string } | null>(null);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState<'todas' | 'recepcionado' | 'no_recepcionado'>('todas');

    useEffect(() => {
        const op = localStorage.getItem('operador');
        if (!op) { router.push('/'); return; }
        const opData = JSON.parse(op);
        if (opData.rol !== 'auxiliar') { router.push('/dashboard'); return; }
        setOperador(opData);
        cargarGuias();
    }, []);

    async function cargarGuias() {
        try {
            const res = await fetch(`${API}/api/guias-remision`);
            const data = await res.json();
            setGuias(data);
        } catch {
            console.error('Error cargando guías');
        } finally {
            setCargando(false);
        }
    }

    const cerrarSesion = () => {
        localStorage.removeItem('operador');
        router.push('/');
    };

    const guiasFiltradas = guias.filter(g => {
        if (filtro === 'todas') return ['recepcionado', 'no_recepcionado', 'llego'].includes(g.estado);
        return g.estado === filtro;
    });

    const colorEstado = (estado: string) => {
        switch (estado) {
            case 'recepcionado': return 'bg-green-100 text-green-700';
            case 'no_recepcionado': return 'bg-red-100 text-red-700';
            case 'llego': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const totalRecepcionados = guias.filter(g => g.estado === 'recepcionado').length;
    const totalNoRecepcionados = guias.filter(g => g.estado === 'no_recepcionado').length;
    const totalLlego = guias.filter(g => g.estado === 'llego').length;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-green-700 text-white px-6 py-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
                    <div>
                        <h1 className="font-bold text-lg leading-none">LogiControl</h1>
                        <p className="text-xs text-green-200">IMPEMAR GROUP — Canal Moderno</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm hidden sm:block bg-green-800 px-3 py-1 rounded-full">👤 {operador?.nombre}</span>
                    <button onClick={cerrarSesion}
                        className="bg-white text-green-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-green-50 transition shadow">
                        Salir
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">📦 Panel Auxiliar — Canal Moderno</h2>
                        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={cargarGuias} className="bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition">
                        🔄 Actualizar
                    </button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center shadow-sm">
                        <p className="text-2xl mb-1">✅</p>
                        <p className="text-3xl font-bold text-green-600">{totalRecepcionados}</p>
                        <p className="text-sm text-gray-500 mt-1">Recepcionados</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center shadow-sm">
                        <p className="text-2xl mb-1">❌</p>
                        <p className="text-3xl font-bold text-red-500">{totalNoRecepcionados}</p>
                        <p className="text-sm text-gray-500 mt-1">No recepcionados</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center shadow-sm">
                        <p className="text-2xl mb-1">⏳</p>
                        <p className="text-3xl font-bold text-purple-500">{totalLlego}</p>
                        <p className="text-sm text-gray-500 mt-1">Esperando confirmación</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: 'todas', label: '📋 Todas' },
                        { key: 'recepcionado', label: '✅ Recepcionadas' },
                        { key: 'no_recepcionado', label: '❌ No recepcionadas' },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setFiltro(key as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${filtro === key ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Lista de guías */}
                <div className="space-y-4">
                    {cargando ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-4xl mb-2">⏳</p>
                            <p>Cargando guías...</p>
                        </div>
                    ) : guiasFiltradas.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400">
                            <p className="text-4xl mb-2">📭</p>
                            <p>No hay guías en este estado</p>
                        </div>
                    ) : (
                        guiasFiltradas.map(g => (
                            <div key={g.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-lg font-mono text-gray-800">{g.numero_guia}</span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${colorEstado(g.estado)}`}>
                                                {g.estado.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm font-medium">👤 {g.cliente_nombre}</p>
                                        <p className="text-gray-500 text-xs">RUC: {g.cliente_ruc}</p>
                                        <div className="mt-2 bg-gray-50 rounded-lg p-2">
                                            <p className="text-gray-500 text-xs">📍 <span className="font-medium">{g.punto_partida}</span></p>
                                            <p className="text-gray-500 text-xs">🏁 <span className="font-medium">{g.punto_llegada}</span></p>
                                        </div>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                            <span>🚛 {g.vehiculos?.placa || '—'}</span>
                                            <span>👷 {g.operadores?.nombre || '—'}</span>
                                            <span>📅 {g.fecha_traslado}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}