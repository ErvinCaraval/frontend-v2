import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getSocket, disconnectSocket } from '../services/socket';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

export default function GameLobbyPage() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [status, setStatus] = useState('waiting');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    (async () => {
      if (!user) return;
      const socket = await getSocket();
      socket.connect();
      socket.emit('joinGame', { 
        gameId, 
        uid: user.uid, 
        displayName: user.displayName || user.email 
      });

      socket.on('playerJoined', ({ players }) => {
        setPlayers(players);
        if (players.length > 0) setHostId(players[0].uid);
      });
      
      socket.on('gameStarted', () => {
        console.log('[GameLobbyPage] Evento gameStarted recibido, navegando a /game/' + gameId);
        navigate(`/game/${gameId}`);
      });
      
      socket.on('error', ({ error }) => {
        setError(error);
      });

      // cleanup
      return () => {
        socket.off('playerJoined');
        socket.off('gameStarted');
        socket.off('error');
        disconnectSocket();
      };
    })();
  }, [gameId, user, navigate]);

  const handleStart = () => {
    console.log('[GameLobbyPage] Emitiendo startGame:', { gameId });
    (async () => {
      const socket = await getSocket();
      socket.emit('startGame', { gameId });
    })();
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameId);
    alert('Game code copied to clipboard!');
  };

  if (error) {
    return (
      <div className="min-h-screen container px-4 py-10">
        <Alert intent="error" className="mb-4">
          {error === 'Game already started' ? 'La partida ya ha comenzado. No puedes unirte en este momento.' : error}
        </Alert>
        <Button onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen container px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">🎮 Sala de Juego</h1>
          <p className="text-white/70">Comparte el código para que tus amigos se unan</p>
        </div>
        <Card className="w-full md:w-auto">
          <CardBody className="flex items-center gap-3">
            <div>
              <div className="text-sm text-white/70">Código</div>
              <div className="text-xl font-bold tracking-widest">{gameId}</div>
            </div>
            <Button variant="secondary" onClick={copyGameCode} aria-label="Copiar código">📋 Copiar</Button>
          </CardBody>
        </Card>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <h3 className="text-2xl font-semibold">👥 Jugadores ({players.length})</h3>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2">
              {players.map((player) => (
                <div key={player.uid} className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-transform duration-150 hover:-translate-y-0.5 ${player.uid === hostId ? 'ring-1 ring-bb-primary/50' : ''}`}>
                  <div className="text-xl">{player.uid === hostId ? '👑' : '👤'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{player.displayName || player.email}</div>
                    {player.uid === hostId && <div className="text-xs text-white/70">Anfitrión</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-2xl font-semibold">Acciones</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {user && user.uid === hostId && status === 'waiting' ? (
              <>
                <p>¿Listo para comenzar la partida?</p>
                <Button onClick={handleStart} disabled={players.length < 1} size="lg">🚀 Iniciar partida</Button>
                {players.length < 1 && (
                  <p className="text-sm text-white/70">Esperando a que se unan jugadores...</p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span>⏳</span>
                <p className="text-sm text-white/80">Esperando a que el anfitrión inicie la partida…</p>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}