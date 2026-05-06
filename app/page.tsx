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

        // Redirigir según el rol
        const rol = data.operador?.rol || data.rol;
        if (rol === 'auxiliar') {
          router.push('/dashboard-auxiliar');
        } else {
          router.push('/dashboard');
        }
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
    <main className="min-h-screen bg-red-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚛</div>
          <h1 className="text-3xl font-bold text-red-600">LogiControl</h1>
          <p className="text-gray-500 text-sm mt-1">IMPEMAR GROUP — Panel de Control</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej: carlos"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              maxLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={cargando}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          LogiControl v1.0 — SENATI 2026
        </p>
      </div>
    </main>
  );
}