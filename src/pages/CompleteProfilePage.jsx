import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function CompleteProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No autenticado');
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: auth.currentUser.email,
        displayName,
        stats: { gamesPlayed: 0, wins: 0, correctAnswers: 0 }
      }, { merge: true });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-h-screen px-4 py-10 grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Completa tu perfil</h1>
          <p className="text-white/70">Elige tu nombre para mostrar</p>
        </div>
        <form onSubmit={handleSave} className="grid gap-4">
          <div>
            <label className="block mb-1 text-sm text-white/80" htmlFor="displayName">Nombre para mostrar</label>
            <Input id="displayName" type="text" placeholder="Tu nombre" value={displayName} onChange={e => setDisplayName(e.target.value)} required disabled={loading} />
          </div>
          {error && <Alert intent="error">{error}</Alert>}
          <Button type="submit" size="lg" disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</Button>
        </form>
      </div>
    </div>
  );
}