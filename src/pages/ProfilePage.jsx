import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Alert from '../components/ui/Alert';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apiError, setApiError] = useState('');
  const [apiRaw, setApiRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      let statsData = null;
      try {
  const apiBase = import.meta.env.VITE_API_URL;
        // Obtener el token de Firebase
        const token = user && (await user.getIdToken());
        const statsRes = await fetch(`${apiBase}/api/users/me/stats?uid=${user.uid}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }
        );
        if (statsRes.ok) {
          statsData = await statsRes.json();
          setApiRaw(statsData);
        } else {
          setApiError(`Error HTTP: ${statsRes.status}`);
        }
      } catch (err) {
        setApiError('Error de conexión: ' + err.message);
      }
      setStats(statsData?.stats || null);
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  if (loading) return (
    <div className="container min-h-screen px-4 py-10">
      <Card>
        <CardBody>
          <div className="loading-spinner" aria-busy="true">Cargando perfil...</div>
        </CardBody>
      </Card>
    </div>
  );
  return (
    <div className="container min-h-screen px-4 py-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex items-center gap-4">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.uid || 'user'}`}
            alt="avatar"
            className="h-16 w-16 rounded-full bg-white/10"
            loading="lazy"
            decoding="async"
          />
          <div>
            <h2 className="text-2xl font-bold">{user?.displayName || user?.email}</h2>
            <span className="text-sm text-white/70">UID: {user?.uid}</span>
          </div>
        </CardHeader>
        <CardBody>
          <h3 className="text-xl font-semibold mb-3">Estadísticas</h3>
          {apiError && <Alert intent="error" className="mb-3">{apiError}</Alert>}
          {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-sm text-white/70">Partidas jugadas</div>
                <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-sm text-white/70">Victorias</div>
                <div className="text-2xl font-bold">{stats.wins}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-sm text-white/70">Respuestas correctas</div>
                <div className="text-2xl font-bold">{stats.correctAnswers}</div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-white/70">No hay estadísticas.</p>
              {apiRaw && (
                <details className="mt-2">
                  <summary className="cursor-pointer underline">Respuesta de la API</summary>
                  <pre className="mt-2 overflow-auto rounded-xl bg-black/40 p-3 text-xs">{JSON.stringify(apiRaw, null, 2)}</pre>
                </details>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}