'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  unidad: string;
  precio_unitario: number;
  stock_actual: number;
  activo: boolean;
}

export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    unidad: 'unidad',
    precio_unitario: '',
    stock_actual: '',
  });

  useEffect(() => {
    const op = localStorage.getItem('operador');
    if (!op) { router.push('/'); return; }
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await fetch('https://erp-logistica-backend-production.up.railway.app/api/productos');
      const data = await res.json();
      setProductos(data);
    } catch {
      console.error('Error cargando productos');
    } finally {
      setCargando(false);
    }
  };

  const crearProducto = async () => {
    if (!form.codigo || !form.nombre) {
      alert('Código y nombre son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch('https://erp-logistica-backend-production.up.railway.app/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: form.codigo,
          nombre: form.nombre,
          unidad: form.unidad,
          precio_unitario: parseFloat(form.precio_unitario) || 0,
          stock_actual: parseInt(form.stock_actual) || 0,
        }),
      });
      if (res.ok) {
        setForm({ codigo: '', nombre: '', unidad: 'unidad', precio_unitario: '', stock_actual: '' });
        setMostrarForm(false);
        cargarProductos();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch {
      alert('No se pudo conectar al servidor');
    } finally {
      setGuardando(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-red-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-white hover:text-red-200 text-lg">←</button>
          <span className="text-2xl">🥤</span>
          <h1 className="font-bold text-lg">Productos</h1>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-white text-red-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition"
        >
          + Nuevo
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Formulario */}
        {mostrarForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4">Nuevo Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  placeholder="Ej: CC-600"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Coca-Cola 600ml"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  value={form.unidad}
                  onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="unidad">Unidad</option>
                  <option value="caja">Caja</option>
                  <option value="paquete">Paquete</option>
                  <option value="palet">Palét</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario (S/)</label>
                <input
                  type="number"
                  value={form.precio_unitario}
                  onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
                <input
                  type="number"
                  value={form.stock_actual}
                  onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={crearProducto}
                disabled={guardando}
                className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setMostrarForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por nombre o código..."
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Catálogo de productos</h3>
            <span className="text-sm text-gray-400">{productosFiltrados.length} productos</span>
          </div>
          {cargando ? (
            <p className="p-6 text-gray-400 text-sm">Cargando...</p>
          ) : productosFiltrados.length === 0 ? (
            <p className="p-6 text-gray-400 text-sm">No hay productos registrados.</p>
          ) : (
            <div className="divide-y">
              {productosFiltrados.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-100 text-red-600 font-mono text-xs font-bold px-2 py-1 rounded">
                      {p.codigo}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{p.unidad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-700">S/ {Number(p.precio_unitario).toFixed(2)}</p>
                    <p className={`text-xs font-medium ${p.stock_actual > 10 ? 'text-green-600' : 'text-red-500'}`}>
                      Stock: {p.stock_actual}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
