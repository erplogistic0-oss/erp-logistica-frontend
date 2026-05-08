'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setCargando(true);
    try {
      const res = await fetch('https://erp-logistica-backend-production.up.railway.app/api/operadores/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, pin }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('operador', JSON.stringify(data.operador));
        const rol = data.operador?.rol || data.rol;
        if (rol === 'admin') router.push('/admin');
        else if (rol === 'auxiliar') router.push('/dashboard-auxiliar');
        else if (rol === 'chofer') {
          setError('Los choferes solo pueden ingresar desde la app móvil');
          localStorage.removeItem('operador');
        } else router.push('/dashboard');
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch {
      setError('No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden md:flex w-1/2 bg-red-600 flex-col items-center justify-center p-12">
        <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl mb-6" />
        <h1 className="text-4xl font-bold text-white mb-2">LogiControl</h1>
        <p className="text-red-200 text-lg mb-1">IMPEMAR GROUP</p>
        <p className="text-red-300 text-sm text-center mt-4">Sistema de gestión logística para canal moderno</p>
        <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="bg-red-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">96%</p>
            <p className="text-red-200 text-xs">Reducción tiempo</p>
          </div>
          <div className="bg-red-700 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-red-200 text-xs">Errores de guías</p>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-8">
            <img src="/impemar-logo.png" alt="IMPEMAR GROUP" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-red-600" />
            <h1 className="text-2xl font-bold text-red-600">LogiControl</h1>
            <p className="text-gray-500 text-sm">IMPEMAR GROUP</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h2>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input type="text" value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder="Ej: carlos"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
              <input type="password" value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" />
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

            <button onClick={handleLogin} disabled={cargando}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-lg">
              {cargando ? 'Ingresando...' : 'Ingresar al sistema'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">LogiControl v1.0 — SENATI 2026</p>
        </div>
      </div>
    </main>
  );
}