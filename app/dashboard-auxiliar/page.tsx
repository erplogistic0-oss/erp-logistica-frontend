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
        <main className="min-h-screen bg-gray-100">
            <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                        <h1 className="font-bold text-lg leading-none">LogiControl</h1>
                        <p className="text-xs text-green-200">IMPEMAR GROUP — Canal Moderno</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm hidden sm:block">👤 {operador?.nombre}</span>
                    <button onClick={cerrarSesion}
                        className="bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-50 transition">
                        Salir
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Panel Auxiliar — Canal Moderno</h2>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-5 text-center">
                        <p className="text-3xl font-bold text-green-500">{totalRecepcionados}</p>
                        <p className="text-sm text-gray-500 mt-1">Recepcionados</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 text-center">
                        <p className="text-3xl font-bold text-red-500">{totalNoRecepcionados}</p>
                        <p className="text-sm text-gray-500 mt-1">No recepcionados</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 text-center">
                        <p className="text-3xl font-bold text-purple-500">{totalLlego}</p>
                        <p className="text-sm text-gray-500 mt-1">Esperando confirmación</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: 'todas', label: 'Todas' },
                        { key: 'recepcionado', label: '✅ Recepcionadas' },
                        { key: 'no_recepcionado', label: '❌ No recepcionadas' },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setFiltro(key as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filtro === key ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Lista de guías */}
                <div className="space-y-4">
                    {cargando ? (
                        <div className="text-center py-8 text-gray-400">Cargando...</div>
                    ) : guiasFiltradas.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow text-gray-400">
                            No hay guías en este estado
                        </div>
                    ) : (
                        guiasFiltradas.map(g => (
                            <div key={g.id} className="bg-white rounded-xl shadow p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg font-mono">{g.numero_guia}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${colorEstado(g.estado)}`}>
                                                {g.estado}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">👤 {g.cliente_nombre} — RUC: {g.cliente_ruc}</p>
                                        <p className="text-gray-500 text-sm">📍 {g.punto_partida} → {g.punto_llegada}</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            🚛 {g.vehiculos?.placa} | 👷 {g.operadores?.nombre} | 📅 {g.fecha_traslado}
                                        </p>
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