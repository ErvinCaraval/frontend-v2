import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Section from '../components/ui/Section';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton, { SkeletonText } from '../components/ui/Skeleton';
const AIQuestionGenerator = React.lazy(() => import('../components/AIQuestionGenerator'));

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [publicGames, setPublicGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPublicGames();
  }, []);

  const fetchPublicGames = async () => {
    try {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/games`);
      const data = await response.json();
      const gamesArray = Array.isArray(data) ? data : [];
      setPublicGames(gamesArray);
    } catch (error) {
      console.error('Error fetching games:', error);
      setPublicGames([]);
    }
  };

  const handleCreateGame = async () => {
    if (!selectedTopic) {
      setErrorMessage('Por favor selecciona un tema antes de crear la partida.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }
    if (!generatedQuestions.length) {
      setErrorMessage('Primero debes generar preguntas con IA antes de crear la partida.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }
    // Forzar que todas las preguntas tengan el category igual al tema seleccionado
    const fixedQuestions = generatedQuestions.map(q => ({ ...q, category: selectedTopic }));
    setLoading(true);
  const socket = await getSocket();
  socket.connect();
    // Obtener el token de autenticación del usuario
    let token = null;
    if (user && user.getIdToken) {
      token = await user.getIdToken();
    }
  socket.emit('createGame', {
      hostId: user.uid,
      displayName: user.displayName || user.email,
      isPublic: true,
      token,
      topic: selectedTopic,
      questions: fixedQuestions,
      count: fixedQuestions.length
    });
  socket.on('gameCreated', ({ gameId, questions }) => {
      setLoading(false);
      setSuccessMessage(`¡Tu partida fue creada con ${questions?.length || 0} preguntas! Invita a tus amigos y disfruta. 🚀`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setTimeout(() => navigate(`/lobby/${gameId}`), 1200);
    });
  socket.on('error', ({ error }) => {
  setLoading(false);
  setErrorMessage('Ocurrió un error al crear la partida: ' + error);
  setTimeout(() => setErrorMessage(''), 5000);
    });
  };

  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      setErrorMessage('Por favor ingresa un código de partida.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }
    navigate(`/lobby/${gameCode}`);
  };

  const handleJoinPublicGame = (gameId) => {
  setSuccessMessage('¡Te uniste a la partida! Cargando sala...');
  setTimeout(() => setSuccessMessage(''), 4000);
  setTimeout(() => navigate(`/lobby/${gameId}`), 1200);
  };

  const handleQuestionsGenerated = (questions) => {
    setGeneratedQuestions(questions);
    if (questions && questions.length > 0 && questions[0].category) {
      setSelectedTopic(questions[0].category);
    }
    setSuccessMessage(`¡Listo! Se generaron ${questions.length} preguntas para el tema "${questions[0]?.category || ''}". 🎉`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="min-h-screen">
      {(successMessage || errorMessage) && (
        <div aria-live="polite" className="fixed top-6 inset-x-0 z-[2000] px-4 flex justify-center">
          <Alert intent={errorMessage ? 'error' : 'success'} className="shadow-xl">
            {errorMessage || successMessage}
          </Alert>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 py-5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            ¡Bienvenido, {user?.displayName || user?.email}!
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate('/profile')} aria-label="Ir a tu perfil">
              Perfil
            </Button>
            <Button variant="outline" onClick={logout} aria-label="Cerrar sesión">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 md:py-10">
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
          <Section
            title="🎮 Crear nueva partida"
            subtitle="Inicia una partida y invita a tus amigos"
          >
            <div className="flex flex-col gap-4">
              <Button
                onClick={handleCreateGame}
                disabled={loading}
                title="Primero genera preguntas con IA para que tu partida tenga contenido."
                size="lg"
              >
                {loading ? 'Creando…' : 'Crear partida'}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowAIGenerator(true)}
                title="Genera preguntas personalizadas antes de crear tu partida."
              >
                🤖 Generar preguntas
              </Button>
              <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-white/85">
                <strong className="text-indigo-300">💡 Ayuda:</strong> Antes de crear una partida, puedes generar preguntas automáticamente o agregar preguntas manuales personalizadas. Así tu juego tendrá contenido único, reciente y adaptado a tus necesidades.
              </div>
            </div>
          </Section>

          <Section title="🔗 Unirse a partida" subtitle="Ingresa un código de 6 caracteres para unirte">
            <form
              className="flex flex-col sm:flex-row items-stretch gap-3"
              onSubmit={(e) => { e.preventDefault(); handleJoinGame(); }}
              aria-labelledby="join-section-title"
            >
              <label htmlFor="gameCode" className="sr-only">Código de partida</label>
              <Input
                id="gameCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Código (6)"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                maxLength={6}
                className="text-center tracking-widest font-semibold"
              />
              <Button type="submit" variant="secondary">
                Unirse
              </Button>
            </form>
          </Section>
        </div>

        <Section title="🌐 Partidas públicas" subtitle="Únete a partidas abiertas para todos" className="mt-8">
          {!Array.isArray(publicGames) ? null : publicGames.length === 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3 flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </CardHeader>
                  <CardBody className="flex items-center justify-between gap-4">
                    <SkeletonText lines={2} />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
              <AnimatePresence>
                {publicGames.map((game, idx) => (
                  <motion.div key={game.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
                    <Card className="group transition hover:-translate-y-0.5 hover:shadow-glow">
                      <CardHeader className="pb-3 flex items-center justify-between">
                        <h4 className="text-xl font-semibold">Partida #{game.id}</h4>
                        <Badge variant={idx % 2 ? 'violet' : 'emerald'}>{game.topic || 'Pública'}</Badge>
                      </CardHeader>
                      <CardBody className="flex items-center justify-between gap-4">
                        <div className="text-sm text-white/80">
                          <p>Jugadores: {game.players?.length || 0}</p>
                          <p>Anfitrión: {game.players?.[0]?.displayName || 'Desconocido'}</p>
                        </div>
                        <Button onClick={() => handleJoinPublicGame(game.id)} aria-label={`Unirse a la partida ${game.id}`}>
                          Unirse
                        </Button>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Section>
      </main>

      {showAIGenerator && (
        <Suspense fallback={<div className="container px-4 py-6"><div className="loading-spinner" aria-live="polite" aria-busy="true">Cargando…</div></div>}>
          <AIQuestionGenerator
            onQuestionsGenerated={(qs) => {
              handleQuestionsGenerated(qs);
              setShowAIGenerator(false);
            }}
            onClose={() => setShowAIGenerator(false)}
          />
        </Suspense>
      )}
    </div>
  );
}