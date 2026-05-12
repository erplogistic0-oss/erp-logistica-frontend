'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = 'https://erp-logistica-backend-production.up.railway.app';

interface GuiaItem {
    id: string;
    codigo_bien: string;
    descripcion: string;
    unidad_medida: string;
    cantidad_programada: number;
}

interface Guia {
    id: string;
    numero_guia: string;
    numero_carga: string;
    cliente_nombre: string;
    cliente_ruc: string;
    punto_partida: string;
    punto_llegada: string;
    fecha_traslado: string;
    guia_items: GuiaItem[];
}

export default function ConfirmacionPage() {
    const { id } = useParams();
    const [guia, setGuia] = useState<Guia | null>(null);
    const [ruc, setRuc] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);
    const [verificado, setVerificado] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [confirmado, setConfirmado] = useState(false);

    useEffect(() => {
        cargarGuia();
    }, []);

    const cargarGuia = async () => {
        try {
            const res = await fetch(`${API}/api/guias-remision/${id}/confirmacion`);
            if (res.ok) {
                setGuia(await res.json());
            } else {
                const d = await res.json();
                setError(d.error || 'Guía no disponible');
            }
        } catch {
            setError('No se pudo cargar la guía');
        } finally {
            setCargando(false);
        }
    };

    const verificarRuc = () => {
        if (!ruc || ruc.length < 8) {
            setError('Ingresa un RUC válido');
            return;
        }
        if (ruc !== guia?.cliente_ruc) {
            setError('RUC incorrecto. Verifica e intenta de nuevo.');
            return;
        }
        setError('');
        setVerificado(true);
    };

    const confirmarRecepcion = async () => {
        setConfirmando(true);
        try {
            const res = await fetch(`${API}/api/guias-remision/${id}/confirmar-cliente`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ruc }),
            });
            if (res.ok) {
                setConfirmado(true);
            } else {
                const d = await res.json();
                setError(d.error || 'Error al confirmar');
            }
        } catch {
            setError('No se pudo conectar al servidor');
        } finally {
            setConfirmando(false);
        }
    };

    if (cargando) return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400">Cargando...</p>
        </main>
    );

    if (error && !guia) return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md w-full">
                <div className="text-5xl mb-4">❌</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Guía no disponible</h2>
                <p className="text-gray-500 text-sm">{error}</p>
            </div>
        </main>
    );

    if (confirmado) return (
        <main className="min-h-screen bg-green-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow p-8 text-center max-w-md w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">¡Recepción Confirmada!</h2>
                <p className="text-gray-500 text-sm mb-4">Guía N° {guia?.numero_guia}</p>
                <p className="text-gray-600 text-sm">El auxiliar de IMPEMAR GROUP ha sido notificado. Gracias por confirmar la recepción.</p>
                <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-gray-400">LogiControl v1.0 — IMPEMAR GROUP</p>
                </div>
            </div>
        </main>
    );

    return (
        <main className="min-h-screen bg-gray-50">
            <nav className="bg-red-600 text-white px-6 py-4 flex items-center gap-3 shadow">
                <img src="/impemar-logo.png" alt="IMPEMAR" className="h-10 w-10 rounded-full object-cover bg-white p-0.5" />
                <div>
                    <h1 className="font-bold text-lg leading-none">LogiControl</h1>
                    <p className="text-xs text-red-200">IMPEMAR GROUP — Confirmación de Recepción</p>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Info guía */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg">{guia?.numero_guia}</h2>
                            <p className="text-gray-500 text-sm">N° Carga: {guia?.numero_carga}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Cliente</p>
                            <p className="font-semibold text-gray-800">{guia?.cliente_nombre}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Fecha</p>
                            <p className="font-semibold text-gray-800">{guia?.fecha_traslado}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                            <p className="text-gray-500 text-xs mb-1">Destino</p>
                            <p className="font-semibold text-gray-800">{guia?.punto_llegada}</p>
                        </div>
                    </div>
                </div>

                {!verificado ? (
                    /* Verificar RUC */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-2">Verificar identidad</h3>
                        <p className="text-gray-500 text-sm mb-6">Ingresa el RUC de tu empresa para confirmar la recepción de los productos.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RUC de la empresa</label>
                                <input
                                    type="number"
                                    value={ruc}
                                    onChange={e => setRuc(e.target.value)}
                                    placeholder="Ej: 20563529378"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                            <button onClick={verificarRuc}
                                className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition">
                                Verificar RUC
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Lista de productos y confirmación */
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Productos recibidos</h3>
                            <div className="space-y-3">
                                {guia?.guia_items.map((item, i) => (
                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.descripcion}</p>
                                                <p className="text-xs text-gray-400">Cód: {item.codigo_bien} · {item.unidad_medida}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600 text-lg">{item.cantidad_programada}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-2">Confirmar recepción</h3>
                            <p className="text-gray-500 text-sm mb-4">Al confirmar, certifica que recibió todos los productos listados en conformidad.</p>
                            {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
                            <button onClick={confirmarRecepcion} disabled={confirmando}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {confirmando ? 'Confirmando...' : 'Confirmar recepción'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}