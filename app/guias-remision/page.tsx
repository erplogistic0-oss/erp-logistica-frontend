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
    operador_id: string | null;
    vehiculo_id: string | null;
    operadores?: { nombre: string };
    vehiculos?: { placa: string };
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

export default function GuiasRemisionPage() {
    const router = useRouter();
    const [guias, setGuias] = useState<Guia[]>([]);
    const [cargando, setCargando] = useState(true);
    const [filtro, setFiltro] = useState('todas');
    const [choferes, setChoferes] = useState<Operador[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [modalGuia, setModalGuia] = useState<Guia | null>(null);
    const [selChofer, setSelChofer] = useState('');
    const [selVehiculo, setSelVehiculo] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const op = localStorage.getItem('operador');
        if (!op) { router.push('/'); return; }
        cargarGuias();
        cargarChoferesYVehiculos();
    }, []);

    const cargarGuias = async () => {
        try {
            const res = await fetch(`${API}/api/guias-remision`);
            setGuias(await res.json());
        } catch {
            console.error('Error cargando guías');
        } finally {
            setCargando(false);
        }
    };

    const cargarChoferesYVehiculos = async () => {
        try {
            const [resOp, resVeh] = await Promise.all([
                fetch(`${API}/api/operadores`),
                fetch(`${API}/api/vehiculos`),
            ]);
            const ops = await resOp.json();
            const vehs = await resVeh.json();
            setChoferes(ops.filter((o: any) => o.rol === 'chofer'));
            setVehiculos(vehs.filter((v: any) => v.disponible));
        } catch {
            console.error('Error cargando choferes/vehículos');
        }
    };

    const abrirModal = (g: Guia) => {
        setModalGuia(g);
        setSelChofer(g.operador_id || '');
        setSelVehiculo(g.vehiculo_id || '');
    };

    const guardarAsignacion = async () => {
        if (!modalGuia) return;
        setGuardando(true);
        try {
            await fetch(`${API}/api/guias-remision/${modalGuia.id}/asignar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operador_id: selChofer || null,
                    vehiculo_id: selVehiculo || null,
                }),
            });
            setModalGuia(null);
            cargarGuias();
        } catch {
            alert('Error al guardar');
        } finally {
            setGuardando(false);
        }
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

                <div className="flex gap-2 mb-6 flex-wrap">
                    {estados.map(e => (
                        <button key={e} onClick={() => setFiltro(e)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filtro === e ? 'bg-red-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}>
                            {e === 'todas' ? 'Todas' : e.replace('_', ' ')}
                        </button>
                    ))}
                </div>

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
                                        <span>🚛 {g.vehiculos?.placa || <span className="text-red-400">Sin vehículo</span>}</span>
                                        <span>👷 {g.operadores?.nombre || <span className="text-red-400">Sin chofer</span>}</span>
                                        <span>Motivo: {g.motivo_traslado}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {g.estado === 'pendiente' && (
                                            <button onClick={() => abrirModal(g)}
                                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                Asignar chofer
                                            </button>
                                        )}
                                        {g.estado === 'pendiente' && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg font-semibold">
                                                Esperando salida
                                            </span>
                                        )}
                                        {g.estado === 'en_ruta' && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold">
                                                Camión en ruta
                                            </span>
                                        )}
                                        {g.estado === 'llego' && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-semibold">
                                                Esperando confirmación del cliente
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal asignar chofer */}
            {modalGuia && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">Asignar Chofer y Vehículo</h3>
                        <p className="text-gray-500 text-sm mb-6">Guía {modalGuia.numero_guia} — {modalGuia.cliente_nombre}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chofer</label>
                                <select value={selChofer} onChange={e => setSelChofer(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <option value="">— Sin asignar —</option>
                                    {choferes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                                <select value={selVehiculo} onChange={e => setSelVehiculo(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                    <option value="">— Sin asignar —</option>
                                    {vehiculos.map(v => (
                                        <option key={v.id} value={v.id}>{v.placa} — {v.tipo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={guardarAsignacion} disabled={guardando}
                                className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={() => setModalGuia(null)}
                                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}