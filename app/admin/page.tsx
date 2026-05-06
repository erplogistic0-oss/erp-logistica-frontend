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
                alert('✅ Operador creado');
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
                alert('✅ Vehículo creado');
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
                alert('✅ Rol creado');
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
        if (rolesBase.includes(nombre)) {
            alert('No se puede eliminar un rol base del sistema');
            return;
        }
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

    return (
        <main className="min-h-screen bg-gray-100">
            <nav className="bg-purple-700 text-white px-6 py-4 flex justify-between items-center shadow">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    <div>
                        <h1 className="font-bold text-lg leading-none">LogiControl</h1>
                        <p className="text-xs text-purple-200">IMPEMAR GROUP — Panel Admin</p>
                    </div>
                </div>
                <button onClick={cerrarSesion} className="bg-white text-purple-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-50 transition">
                    Salir
                </button>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Panel de Administración</h2>

                <div className="flex gap-2 mb-6">
                    <button onClick={() => setTab('operadores')}
                        className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${tab === 'operadores' ? 'bg-purple-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        👷 Operadores
                    </button>
                    <button onClick={() => setTab('vehiculos')}
                        className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${tab === 'vehiculos' ? 'bg-purple-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        🚐 Vehículos
                    </button>
                    <button onClick={() => setTab('roles')}
                        className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${tab === 'roles' ? 'bg-purple-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        🏷️ Roles
                    </button>
                </div>

                {tab === 'operadores' && (
                    <div>
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <h3 className="font-bold text-gray-700 mb-4">➕ Nuevo Operador</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Nombre completo" value={formOp.nombre}
                                    onChange={e => setFormOp({ ...formOp, nombre: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm" />
                                <input placeholder="Usuario" value={formOp.usuario}
                                    onChange={e => setFormOp({ ...formOp, usuario: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm" />
                                <input placeholder="PIN (4-6 dígitos)" value={formOp.pin_acceso}
                                    onChange={e => {
                                        if (e.target.value.length <= 6) setFormOp({ ...formOp, pin_acceso: e.target.value });
                                    }}
                                    maxLength={6}
                                    className="border rounded-lg px-3 py-2 text-sm"
                                    type="password" />
                                <input placeholder="Teléfono (9 dígitos)" value={formOp.telefono}
                                    onChange={e => {
                                        if (e.target.value.length <= 9) setFormOp({ ...formOp, telefono: e.target.value });
                                    }}
                                    maxLength={9}
                                    className="border rounded-lg px-3 py-2 text-sm"
                                    type="number" />
                                <select value={formOp.rol} onChange={e => setFormOp({ ...formOp, rol: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm col-span-2">
                                    {roles.map(r => (
                                        <option key={r.id} value={r.nombre}>{r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={crearOperador} disabled={guardandoOp}
                                className="mt-4 bg-purple-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-purple-800 transition disabled:opacity-50">
                                {guardandoOp ? 'Guardando...' : '➕ Crear Operador'}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-bold text-gray-700 mb-4">👷 Operadores registrados</h3>
                            {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
                                <div className="space-y-3">
                                    {operadores.map(op => (
                                        <div key={op.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">{op.nombre}</p>
                                                <p className="text-sm text-gray-500">@{op.usuario} · {op.telefono || 'Sin teléfono'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${colorRol[op.rol] || 'bg-gray-100 text-gray-600'}`}>
                                                    {op.rol}
                                                </span>
                                                <button onClick={() => toggleActivo(op)}
                                                    className={`text-xs px-3 py-1 rounded-lg font-semibold ${op.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {op.activo ? '✅ Activo' : '❌ Inactivo'}
                                                </button>
                                                <button onClick={() => eliminarOperador(op.id, op.nombre)}
                                                    className="text-xs px-3 py-1 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700">
                                                    🗑️
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
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <h3 className="font-bold text-gray-700 mb-4">➕ Nuevo Vehículo</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <input placeholder="Placa (Ej: ABC-123)" value={formVeh.placa}
                                    onChange={e => setFormVeh({ ...formVeh, placa: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm" />
                                <input placeholder="Tipo (Ej: camión 3t)" value={formVeh.tipo}
                                    onChange={e => setFormVeh({ ...formVeh, tipo: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm" />
                                <input placeholder="Capacidad kg" value={formVeh.capacidad_kg}
                                    onChange={e => setFormVeh({ ...formVeh, capacidad_kg: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm" type="number" />
                            </div>
                            <button onClick={crearVehiculo} disabled={guardandoVeh}
                                className="mt-4 bg-purple-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-purple-800 transition disabled:opacity-50">
                                {guardandoVeh ? 'Guardando...' : '➕ Crear Vehículo'}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-bold text-gray-700 mb-4">🚐 Vehículos registrados</h3>
                            {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
                                <div className="space-y-3">
                                    {vehiculos.map(veh => (
                                        <div key={veh.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">{veh.placa}</p>
                                                <p className="text-sm text-gray-500">{veh.tipo} · {veh.capacidad_kg} kg</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleDisponible(veh)}
                                                    className={`text-xs px-3 py-1 rounded-lg font-semibold ${veh.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {veh.disponible ? '✅ Disponible' : '❌ No disponible'}
                                                </button>
                                                <button onClick={() => eliminarVehiculo(veh.id, veh.placa)}
                                                    className="text-xs px-3 py-1 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700">
                                                    🗑️
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
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <h3 className="font-bold text-gray-700 mb-4">➕ Nuevo Rol</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Nombre del rol (Ej: almacenero)" value={formRol.nombre}
                                    onChange={e => setFormRol({ ...formRol, nombre: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm" />
                                <input placeholder="Descripción" value={formRol.descripcion}
                                    onChange={e => setFormRol({ ...formRol, descripcion: e.target.value })}
                                    className="border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <button onClick={crearRol} disabled={guardandoRol}
                                className="mt-4 bg-purple-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-purple-800 transition disabled:opacity-50">
                                {guardandoRol ? 'Guardando...' : '➕ Crear Rol'}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-bold text-gray-700 mb-4">🏷️ Roles registrados</h3>
                            {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
                                <div className="space-y-3">
                                    {roles.map(r => (
                                        <div key={r.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                                            <div>
                                                <p className="font-semibold text-gray-800 capitalize">{r.nombre}</p>
                                                <p className="text-sm text-gray-500">{r.descripcion || 'Sin descripción'}</p>
                                            </div>
                                            <button onClick={() => eliminarRol(r.id, r.nombre)}
                                                className="text-xs px-3 py-1 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700">
                                                🗑️
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