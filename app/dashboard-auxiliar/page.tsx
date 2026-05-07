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
            <nav className="bg-green-700 text-white px-6 py-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
                    <div>
                        <h1 className="font-bold text-lg leading-none">LogiControl</h1>
                        <p className="text-xs text-green-200">IMPEMAR GROUP — Canal Moderno</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm hidden sm:block bg-green-800 px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {operador?.nombre}
                    </span>
                    <button onClick={cerrarSesion} className="bg-white text-green-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-green-50 transition shadow">
                        Salir
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Panel Auxiliar — Canal Moderno</h2>
                        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={cargarGuias} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Actualizar
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-3xl font-bold text-green-600">{totalRecepcionados}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Recepcionados</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-3xl font-bold text-red-500">{totalNoRecepcionados}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">No recepcionados</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-3xl font-bold text-purple-500">{totalLlego}</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Esperando confirmación</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { key: 'todas', label: 'Todas' },
                        { key: 'recepcionado', label: 'Recepcionadas' },
                        { key: 'no_recepcionado', label: 'No recepcionadas' },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setFiltro(key as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filtro === key ? 'bg-green-700 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {cargando ? (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Cargando guías...
                        </div>
                    ) : guiasFiltradas.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            No hay guías en este estado
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
                                        <p className="text-gray-700 text-sm font-medium">{g.cliente_nombre} <span className="text-gray-400 font-normal">RUC: {g.cliente_ruc}</span></p>
                                        <div className="mt-2 bg-gray-50 rounded-lg p-2">
                                            <p className="text-gray-500 text-xs">
                                                <span className="font-semibold text-gray-600">Origen:</span> {g.punto_partida}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                <span className="font-semibold text-gray-600">Destino:</span> {g.punto_llegada}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                                {g.vehiculos?.placa || '—'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                {g.operadores?.nombre || '—'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {g.fecha_traslado}
                                            </span>
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