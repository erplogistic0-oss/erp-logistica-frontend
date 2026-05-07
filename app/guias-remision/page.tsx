'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://erp-logistica-backend-production.up.railway.app';

interface Guia {
    id: string;
    numero_guia: string;
    numero_carga: string;
    estado: string;
    cliente_nombre: string;
    cliente_ruc: string;
    punto_partida: string;
    punto_llegada: string;
    fecha_emision: string;
    fecha_traslado: string;
    motivo_traslado: string;
    operadores?: { nombre: string };
    vehiculos?: { placa: string };
}

export default function GuiasRemisionPage() {
    const router = useRouter();
    const [guias, setGuias] = useState<Guia[]>([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState('todas');

    useEffect(() => {
        const op = localStorage.getItem('operador');
        if (!op) { router.push('/'); return; }
        cargarGuias();
    }, []);

    const cargarGuias = async () => {
        try {
            const res = await fetch(`${API}/api/guias-remision`);
            const data = await res.json();
            setGuias(data);
        } catch {
            console.error('Error cargando guías');
        } finally {
            setCargando(false);
        }
    };

    const cambiarEstado = async (id: string, estado: string) => {
        await fetch(`${API}/api/guias-remision/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado }),
        });
        cargarGuias();
    };

    const colorEstado = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-700';
            case 'en_ruta': return 'bg-blue-100 text-blue-700';
            case 'llego': return 'bg-purple-100 text-purple-700';
            case 'recepcionado': return 'bg-green-100 text-green-700';
            case 'no_recepcionado': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const estados = ['todas', 'pendiente', 'en_ruta', 'llego', 'recepcionado', 'no_recepcionado'];

    const guiasFiltradas = filtro === 'todas' ? guias : guias.filter(g => g.estado === filtro);

    return (
        <main className="min-h-screen bg-gray-50">
            <nav className="bg-red-600 text-white px-6 py-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
                    <div>
                        <h1 className="font-bold text-lg leading-none">LogiControl</h1>
                        <p className="text-xs text-red-200">IMPEMAR GROUP — Guías de Remisión</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={cargarGuias} className="bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-800 transition">
                        Actualizar
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="bg-white text-red-600 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-red-50 transition shadow">
                        ← Volver
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Guías de Remisión</h2>
                        <p className="text-gray-500 text-sm mt-1">{guias.length} guías registradas</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {estados.map(e => (
                        <button key={e} onClick={() => setFiltro(e)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filtro === e ? 'bg-red-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}>
                            {e === 'todas' ? 'Todas' : e.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Lista */}
                {cargando ? (
                    <div className="text-center py-12 text-gray-400">Cargando...</div>
                ) : guiasFiltradas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400">
                        No hay guías en este estado
                    </div>
                ) : (
                    <div className="space-y-4">
                        {guiasFiltradas.map(g => (
                            <div key={g.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-bold text-lg font-mono text-gray-800">{g.numero_guia}</span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${colorEstado(g.estado)}`}>
                                                {g.estado.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">N° Carga: {g.numero_carga}</span>
                                        </div>
                                        <p className="text-gray-700 font-medium">{g.cliente_nombre} <span className="text-gray-400 text-sm font-normal">RUC: {g.cliente_ruc}</span></p>
                                    </div>
                                    <div className="text-right text-xs text-gray-400">
                                        <p>Emisión: {g.fecha_emision}</p>
                                        <p>Traslado: {g.fecha_traslado}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <p className="text-xs text-gray-500">
                                        <span className="font-semibold text-gray-600">Origen:</span> {g.punto_partida}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <span className="font-semibold text-gray-600">Destino:</span> {g.punto_llegada}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4 text-xs text-gray-400">
                                        <span>🚛 {g.vehiculos?.placa || '—'}</span>
                                        <span>👷 {g.operadores?.nombre || '—'}</span>
                                        <span>Motivo: {g.motivo_traslado}</span>
                                    </div>
                                    {g.estado === 'pendiente' && (
                                        <button onClick={() => cambiarEstado(g.id, 'en_ruta')}
                                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold">
                                            Marcar en ruta
                                        </button>
                                    )}
                                    {g.estado === 'en_ruta' && (
                                        <button onClick={() => cambiarEstado(g.id, 'llego')}
                                            className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition font-semibold">
                                            Marcar llegó
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}