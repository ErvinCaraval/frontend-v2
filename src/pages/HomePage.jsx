import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Layout from '../components/Layout';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="py-10">
        <section className="container px-4 text-center py-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">⚡ BrainBlitz</h1>
          <p className="text-white/80 text-lg md:text-xl">La experiencia definitiva de trivia multijugador</p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            {user ? (
              <Button as={Link} to="/dashboard" size="lg">Ir al panel</Button>
            ) : (
              <>
                <Button as={Link} to="/login" size="lg">Iniciar sesión</Button>
                <Button as={Link} to="/register" variant="secondary" size="lg">Registrarse</Button>
              </>
            )}
          </div>
        </section>

        <section className="container px-4 py-6">
          <h2 className="text-3xl font-bold text-center mb-6">Características</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardBody className="text-center space-y-2"><div className="text-3xl">⚡</div><h3 className="text-xl font-semibold">Juego en tiempo real</h3><p className="text-white/70">Juega con amigos con puntuación instantánea y partidas dinámicas</p></CardBody></Card>
            <Card><CardBody className="text-center space-y-2"><div className="text-3xl">🎮</div><h3 className="text-xl font-semibold">Fácil de unirse</h3><p className="text-white/70">Únete con códigos de 6 dígitos o explora partidas públicas</p></CardBody></Card>
            <Card><CardBody className="text-center space-y-2"><div className="text-3xl">🤝</div><h3 className="text-xl font-semibold">Compite con amigos</h3><p className="text-white/70">Sigue tus estadísticas y demuestra tus conocimientos</p></CardBody></Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}