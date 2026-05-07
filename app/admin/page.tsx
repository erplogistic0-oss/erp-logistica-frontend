'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://erp-logistica-backend-production.up.railway.app';

interface Operador {
    id: string;
    nombre: string;
    usuario: string;
    pin_acceso: string;
    rol: string;
    telefono: string;
    activo: boolean;
}

interface Vehiculo {
    id: string;
    placa: string;
    tipo: string;
    capacidad_kg: number;
    disponible: boolean;
}

interface Rol {
    id: string;
    nombre: string;
    descripcion: string;
}

// Iconos SVG
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconTruck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
const IconTag = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconRefresh = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const IconUser = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'operadores' | 'vehiculos' | 'roles'>('operadores');
    const [operadores, setOperadores] = useState<Operador[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [cargando, setCargando] = useState(true);

    const [formOp, setFormOp] = useState({ nombre: '', usuario: '', pin_acceso: '', rol: 'chofer', telefono: '' });
    const [guardandoOp, setGuardandoOp] = useState(false);
    const [formVeh, setFormVeh] = useState({ placa: '', tipo: '', capacidad_kg: '' });
    const [guardandoVeh, setGuardandoVeh] = useState(false);
    const [formRol, setFormRol] = useState({ nombre: '', descripcion: '' });
    const [guardandoRol, setGuardandoRol] = useState(false);

    useEffect(() => {
        const op = localStorage.getItem('operador');
        if (!op) { router.push('/'); return; }
        const opData = JSON.parse(op);
        if (opData.rol !== 'admin') { router.push('/dashboard'); return; }
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [resOp, resVeh, resRol] = await Promise.all([
                fetch(`${API}/api/operadores`),
                fetch(`${API}/api/vehiculos`),
                fetch(`${API}/api/roles`),
            ]);
            setOperadores(await resOp.json());
            setVehiculos(await resVeh.json());
            setRoles(await resRol.json());
        } finally {
            setCargando(false);
        }
    };

    const crearOperador = async () => {
        setGuardandoOp(true);
        try {
            const res = await fetch(`${API}/api/operadores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formOp, activo: true }),
            });
            if (res.ok) {
                setFormOp({ nombre: '', usuario: '', pin_acceso: '', rol: roles[0]?.nombre || 'chofer', telefono: '' });
                cargarDatos();
                alert('Operador creado correctamente');
            } else {
                const d = await res.json();
                alert('Error: ' + d.error);
            }
        } finally {
            setGuardandoOp(false);
        }
    };

    const eliminarOperador = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar a ${nombre}?`)) return;
        await fetch(`${API}/api/operadores/${id}`, { method: 'DELETE' });
        cargarDatos();
    };

    const eliminarVehiculo = async (id: string, placa: string) => {
        if (!confirm(`¿Eliminar vehículo ${placa}?`)) return;
        await fetch(`${API}/api/vehiculos/${id}`, { method: 'DELETE' });
        cargarDatos();
    };

    const toggleActivo = async (op: Operador) => {
        if (!confirm(`¿${op.activo ? 'Desactivar' : 'Activar'} a ${op.nombre}?`)) return;
        await fetch(`${API}/api/operadores/${op.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...op, activo: !op.activo }),
        });
        cargarDatos();
    };

    const crearVehiculo = async () => {
        setGuardandoVeh(true);
        try {
            const res = await fetch(`${API}/api/vehiculos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formVeh, capacidad_kg: Number(formVeh.capacidad_kg), disponible: true }),
            });
            if (res.ok) {
                setFormVeh({ placa: '', tipo: '', capacidad_kg: '' });
                cargarDatos();
                alert('Vehículo creado correctamente');
            } else {
                const d = await res.json();
                alert('Error: ' + d.error);
            }
        } finally {
            setGuardandoVeh(false);
        }
    };

    const toggleDisponible = async (veh: Vehiculo) => {
        await fetch(`${API}/api/vehiculos/${veh.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...veh, disponible: !veh.disponible }),
        });
        cargarDatos();
    };

    const crearRol = async () => {
        if (!formRol.nombre) { alert('El nombre del rol es requerido'); return; }
        setGuardandoRol(true);
        try {
            const res = await fetch(`${API}/api/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formRol),
            });
            if (res.ok) {
                setFormRol({ nombre: '', descripcion: '' });
                cargarDatos();
                alert('Rol creado correctamente');
            } else {
                const d = await res.json();
                alert('Error: ' + d.error);
            }
        } finally {
            setGuardandoRol(false);
        }
    };

    const eliminarRol = async (id: string, nombre: string) => {
        const rolesBase = ['admin', 'supervisor', 'auxiliar', 'chofer'];
        if (rolesBase.includes(nombre)) { alert('No se puede eliminar un rol base del sistema'); return; }
        if (!confirm(`¿Eliminar rol "${nombre}"?`)) return;
        await fetch(`${API}/api/roles/${id}`, { method: 'DELETE' });
        cargarDatos();
    };

    const cerrarSesion = () => {
        localStorage.removeItem('operador');
        router.push('/');
    };

    const colorRol: Record<string, string> = {
        admin: 'bg-purple-100 text-purple-700',
        supervisor: 'bg-red-100 text-red-700',
        auxiliar: 'bg-blue-100 text-blue-700',
        chofer: 'bg-yellow-100 text-yellow-700',
    };

    const tabs = [
        { key: 'operadores', label: 'Operadores', icon: <IconUsers />, count: operadores.length },
        { key: 'vehiculos', label: 'Vehículos', icon: <IconTruck />, count: vehiculos.length },
        { key: 'roles', label: 'Roles', icon: <IconTag />, count: roles.length },
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            <nav className="bg-purple-700 text-white px-6 py-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="h-10 w-10 rounded-full object-cover bg-white p-0.5 shadow" />
                    <div>
                        <h1 className="font-bold text-lg leading-none">LogiControl</h1>
                        <p className="text-xs text-purple-200">IMPEMAR GROUP — Administración</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={cargarDatos} className="bg-purple-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-purple-800 transition flex items-center gap-1">
                        <IconRefresh /> Actualizar
                    </button>
                    <button onClick={cerrarSesion} className="bg-white text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-purple-50 transition shadow">
                        Salir
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-2xl shadow-lg p-6 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Panel de Administración</h2>
                            <p className="text-purple-200 text-sm">Gestión de personal, flota y roles del sistema</p>
                        </div>
                        <img src="/impemar-logo.png" alt="IMPEMAR" className="h-16 w-16 rounded-full object-cover border-2 border-purple-400 hidden sm:block" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-purple-600 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold">{operadores.length}</p>
                            <p className="text-purple-200 text-xs mt-1">Operadores</p>
                        </div>
                        <div className="bg-purple-600 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold">{vehiculos.length}</p>
                            <p className="text-purple-200 text-xs mt-1">Vehículos</p>
                        </div>
                        <div className="bg-purple-600 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold">{roles.length}</p>
                            <p className="text-purple-200 text-xs mt-1">Roles</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key as any)}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${tab === t.key ? 'bg-purple-700 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}>
                            {t.icon} {t.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                {tab === 'operadores' && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><IconPlus /> Nuevo Operador</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Nombre completo" value={formOp.nombre}
                                    onChange={e => setFormOp({ ...formOp, nombre: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <input placeholder="Usuario" value={formOp.usuario}
                                    onChange={e => setFormOp({ ...formOp, usuario: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <input placeholder="PIN (4-6 dígitos)" value={formOp.pin_acceso} type="password"
                                    onChange={e => { if (e.target.value.length <= 6) setFormOp({ ...formOp, pin_acceso: e.target.value }); }}
                                    maxLength={6}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <input placeholder="Teléfono (9 dígitos)" value={formOp.telefono} type="number"
                                    onChange={e => { if (e.target.value.length <= 9) setFormOp({ ...formOp, telefono: e.target.value }); }}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <select value={formOp.rol} onChange={e => setFormOp({ ...formOp, rol: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
                                    {roles.map(r => (
                                        <option key={r.id} value={r.nombre}>{r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={crearOperador} disabled={guardandoOp}
                                className="mt-4 bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-purple-800 transition disabled:opacity-50 shadow flex items-center gap-2">
                                <IconPlus /> {guardandoOp ? 'Guardando...' : 'Crear Operador'}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><IconUsers /> Operadores registrados</h3>
                            {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
                                <div className="space-y-3">
                                    {operadores.map(op => (
                                        <div key={op.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                                                    {op.nombre.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{op.nombre}</p>
                                                    <p className="text-sm text-gray-500">@{op.usuario} · {op.telefono || 'Sin teléfono'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${colorRol[op.rol] || 'bg-gray-100 text-gray-600'}`}>
                                                    {op.rol}
                                                </span>
                                                <button onClick={() => toggleActivo(op)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${op.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {op.activo ? 'Activo' : 'Inactivo'}
                                                </button>
                                                <button onClick={() => eliminarOperador(op.id, op.nombre)}
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'vehiculos' && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><IconPlus /> Nuevo Vehículo</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <input placeholder="Placa (Ej: ABC-123)" value={formVeh.placa}
                                    onChange={e => setFormVeh({ ...formVeh, placa: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <input placeholder="Tipo (Ej: camión 3t)" value={formVeh.tipo}
                                    onChange={e => setFormVeh({ ...formVeh, tipo: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <input placeholder="Capacidad kg" value={formVeh.capacidad_kg} type="number"
                                    onChange={e => setFormVeh({ ...formVeh, capacidad_kg: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            </div>
                            <button onClick={crearVehiculo} disabled={guardandoVeh}
                                className="mt-4 bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-purple-800 transition disabled:opacity-50 shadow flex items-center gap-2">
                                <IconPlus /> {guardandoVeh ? 'Guardando...' : 'Crear Vehículo'}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><IconTruck /> Vehículos registrados</h3>
                            {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
                                <div className="space-y-3">
                                    {vehiculos.map(veh => (
                                        <div key={veh.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <IconTruck />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{veh.placa}</p>
                                                    <p className="text-sm text-gray-500">{veh.tipo} · {veh.capacidad_kg} kg</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleDisponible(veh)}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${veh.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {veh.disponible ? 'Disponible' : 'No disponible'}
                                                </button>
                                                <button onClick={() => eliminarVehiculo(veh.id, veh.placa)}
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'roles' && (
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><IconPlus /> Nuevo Rol</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Nombre del rol (Ej: almacenero)" value={formRol.nombre}
                                    onChange={e => setFormRol({ ...formRol, nombre: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <input placeholder="Descripción del rol" value={formRol.descripcion}
                                    onChange={e => setFormRol({ ...formRol, descripcion: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            </div>
                            <button onClick={crearRol} disabled={guardandoRol}
                                className="mt-4 bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-purple-800 transition disabled:opacity-50 shadow flex items-center gap-2">
                                <IconPlus /> {guardandoRol ? 'Guardando...' : 'Crear Rol'}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><IconTag /> Roles registrados</h3>
                            {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
                                <div className="space-y-3">
                                    {roles.map(r => (
                                        <div key={r.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                    <IconTag />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 capitalize">{r.nombre}</p>
                                                    <p className="text-sm text-gray-500">{r.descripcion || 'Sin descripción'}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => eliminarRol(r.id, r.nombre)}
                                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                                                <IconTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}