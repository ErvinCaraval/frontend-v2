import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import ManualQuestionForm from './ManualQuestionForm';
import { fetchTopics, fetchDifficultyLevels } from '../services/api';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import Modal from './ui/Modal';
import Spinner from './ui/Spinner';
import LoadingOverlay from './ui/LoadingOverlay';

const AIQuestionGenerator = ({ onQuestionsGenerated, onClose }) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(null);
  const [questionCountInput, setQuestionCountInput] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCount, setManualCount] = useState(null);
  const [manualCountInput, setManualCountInput] = useState('');
  const [manualStep, setManualStep] = useState(0);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [manualTopic, setManualTopic] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [difficultyLevels, setDifficultyLevels] = useState([]);

  useEffect(() => {
    loadTopics();
    loadDifficultyLevels();
  }, []);

  // Mantener inputs string sincronizados cuando el valor numérico cambie por stepper u otros
  useEffect(() => { setQuestionCountInput(typeof questionCount === 'number' ? String(questionCount) : ''); }, [questionCount]);
  useEffect(() => { setManualCountInput(typeof manualCount === 'number' ? String(manualCount) : ''); }, [manualCount]);

  const loadTopics = async () => {
    try {
      const topics = await fetchTopics();
      setTopics(topics);
      if (topics.length > 0) {
        setSelectedTopic(topics[0]);
      }
    } catch (error) {
      setError('Error obteniendo temas. Por favor intenta de nuevo.');
    }
  };

  const loadDifficultyLevels = async () => {
    try {
      const levels = await fetchDifficultyLevels();
      setDifficultyLevels(levels);
    } catch (error) {
      setError('No se pudieron cargar los niveles de dificultad. Por favor, intenta de nuevo más tarde.');
    }
  };

  const generateQuestions = async () => {
    if (!selectedTopic) {
      setError('Por favor selecciona un tema válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiBase = import.meta.env.VITE_API_URL;
      if (!apiBase) {
        setError('Error de configuración: URL del API no definida');
        return;
      }
      const token = user && user.getIdToken ? await user.getIdToken() : null;
      const response = await fetch(`${apiBase}/api/ai/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          count: questionCount,
          useAI: useAI
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Guardar preguntas en Firestore y esperar confirmación exitosa antes de crear la partida
        const questionsWithMeta = data.questions.map(q => ({
          // Si las opciones existen, barajarlas y actualizar el índice de la respuesta correcta de forma robusta
          ...(() => {
            if (!Array.isArray(q.options) || typeof q.correctAnswerIndex !== 'number') return q;
            // Asociar cada opción con su índice original
            const optionsWithIndex = q.options.map((opt, idx) => ({ opt, origIdx: idx }));
            // Barajar
            for (let i = optionsWithIndex.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
            }
            // Buscar la nueva posición de la opción que era la correcta
            const newCorrectIndex = optionsWithIndex.findIndex(o => o.origIdx === q.correctAnswerIndex);
            return {
              ...q,
              options: optionsWithIndex.map(o => o.opt),
              correctAnswerIndex: newCorrectIndex
            };
          })(),
          createdBy: user?.uid || 'anon',
          createdAt: Date.now(),
          category: selectedTopic,
          difficulty: selectedDifficulty
        }));
        let saveOk = false;
        try {
          const bulkToken = user && user.getIdToken ? await user.getIdToken() : null;
          const response = await fetch(`${apiBase}/api/questions/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(bulkToken ? { Authorization: `Bearer ${bulkToken}` } : {})
            },
            body: JSON.stringify({ questions: questionsWithMeta })
          });
          const result = await response.json();
          if (!result.success) {
            setError((prev) => (prev ? prev + ' | ' : '') + (result.error || 'Error guardando preguntas en Firestore'));
            setError('No se pudieron guardar las preguntas. ' + (result.error || 'Por favor, intenta de nuevo.'));
          } else {
            saveOk = true;
          }
        } catch (e) {
          setError('Ocurrió un error al guardar las preguntas. Por favor, verifica tu conexión e intenta de nuevo.');
        }
        if (!saveOk) {
          setLoading(false);
          return;
        }
        // Redirigir al usuario a la pantalla principal para que pueda crear la partida manualmente
        onQuestionsGenerated(data.questions);
        setLoading(false);
        // No navegues ni cierres aquí, deja que el Dashboard controle el cierre
      } else {
        setError(data.error || 'Error generando preguntas');
        setError('No se pudieron generar las preguntas: ' + (data.error || 'Por favor, intenta de nuevo.'));
      }
    } catch (error) {
      setError('Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Mantener vacío por defecto; no autocompletar cantidad

  return (
    <Modal open={true} title="🤖 Generador de Preguntas" onClose={onClose}>
      {loading && <LoadingOverlay text="Generando…" mobileOnly />}
      {!showManualForm && !useAI && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setUseAI(true)} size="lg">
            Crear con IA
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => { setShowManualForm(true); setUseAI(false); setManualStep(0); setManualQuestions([]); }}
          >
            Escribir preguntas
          </Button>
        </div>
      )}
      {useAI && !showManualForm && (
        <form
          className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');
            try {
              await generateQuestions();
              setError('');
            } catch (err) {
              setError('Error al generar preguntas. Por favor, inténtalo de nuevo.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label htmlFor="topic" className="block mb-1 text-sm text-white/80">Tema</label>
            <select
              id="topic"
              className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-md focus:border-bb-primary focus:ring-2 focus:ring-bb-primary/30 focus:outline-none"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={topics.length === 0}
            >
              {topics.length === 0 ? (
                <option value="">No hay temas</option>
              ) : (
                topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label htmlFor="difficulty" className="block mb-1 text-sm text-white/80">Dificultad</label>
            <select
              id="difficulty"
              className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-md focus:border-bb-primary focus:ring-2 focus:ring-bb-primary/30 focus:outline-none"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          <div>
            <label htmlFor="numQuestions" className="block mb-1 text-sm text-white/80">Cantidad</label>
              <div>
                <Input
                id="numQuestions"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={questionCountInput}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D+/g, '')
                  setQuestionCountInput(digits)
                  const num = digits ? parseInt(digits, 10) : NaN
                  if (!Number.isNaN(num)) setQuestionCount(num); else setQuestionCount(null)
                }}
                onBlur={() => {
                  const num = parseInt(questionCountInput || '', 10)
                  if (Number.isNaN(num) || num < 1) {
                    setQuestionCount(null)
                    setQuestionCountInput('')
                    return
                  }
                  const normalized = Math.max(1, num)
                  setQuestionCount(normalized)
                  setQuestionCountInput(String(normalized))
                }}
                required
                placeholder="Cantidad"
                className="w-28 text-center"
              />
              {(questionCountInput === '' || questionCount === null) && (
                <div className={`mt-1 text-xs ${questionCountInput === '' ? 'text-white/60' : 'text-red-300'}`}>
                  {questionCountInput === '' ? 'Ingresa un número (>= 1)' : 'Valor inválido'}
                </div>
              )}
              </div>
          </div>
          {error && <Alert intent="error" className="sm:col-span-3">{error}</Alert>}
          <div className="sm:col-span-3 mt-2 flex flex-wrap gap-3 justify-end items-center">
            <Button type="button" variant="secondary" onClick={() => setUseAI(false)} disabled={loading}>Atrás</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (<><Spinner size={16} className="mr-2" />Creando…</>) : 'Crear preguntas'}
            </Button>
          </div>
        </form>
      )}
      {showManualForm && (
        <div className="mt-2">
          {manualStep === 0 ? (
            <form
              className="grid grid-cols-1 gap-4"
              onSubmit={e => { e.preventDefault(); setManualStep(1); setManualQuestions([]); setManualTopic(selectedTopic); }}
            >
              <div>
                <label className="block mb-1 text-sm text-white/80">Tema</label>
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-md focus:border-bb-primary focus:ring-2 focus:ring-bb-primary/30 focus:outline-none"
                >
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm text-white/80">¿Cuántas preguntas?</label>
                <div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={manualCountInput}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D+/g, '')
                      setManualCountInput(digits)
                      const num = digits ? parseInt(digits, 10) : NaN
                      if (!Number.isNaN(num)) setManualCount(num); else setManualCount(null)
                    }}
                    onBlur={() => {
                      const num = parseInt(manualCountInput || '', 10)
                      if (Number.isNaN(num) || num < 1) {
                        setManualCount(null)
                        setManualCountInput('')
                        return
                      }
                      const normalized = Math.max(1, num)
                      setManualCount(normalized)
                      setManualCountInput(String(normalized))
                    }}
                    required
                    placeholder="Cantidad"
                    className="w-28 text-center"
                  />
                  {(manualCountInput === '' || manualCount === null) && (
                    <div className={`mt-1 text-xs ${manualCountInput === '' ? 'text-white/60' : 'text-red-300'}`}>
                      {manualCountInput === '' ? 'Ingresa un número (>= 1)' : 'Valor inválido'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowManualForm(false)}>Volver</Button>
                <Button type="submit">Empezar</Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="text-center mb-3 font-bold">¡Vamos! Pregunta {manualQuestions.length + 1} de {manualCount}</div>
              <ManualQuestionForm
                topics={[manualTopic]}
                onQuestionCreated={async (q) => {
                                    // q is the payload prepared by the child
                                    try {
                                      setLoading(true);
                                      setError('');

                                      const apiBase = import.meta.env.VITE_API_URL;
                                      if (!apiBase) {
                                        throw new Error('Error de configuración: URL del API no definida');
                                      }
                                      if (!user || !user.getIdToken) {
                                        throw new Error('Debes iniciar sesión para crear preguntas');
                                      }
                                      const token = await user.getIdToken();

                                      // Save single question
                                      const response = await fetch(`${apiBase}/api/questions`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          Authorization: `Bearer ${token}`
                                        },
                                        body: JSON.stringify(q)
                                      });

                                      const data = await response.json();
                                      if (!response.ok) {
                                        throw new Error(data.error || 'Error al guardar la pregunta');
                                      }

                                      const saved = data.question || { ...q };
                                      const next = [...manualQuestions, { ...saved, category: manualTopic }];

                                      // If last question, bulk save (server may already store them individually, but keep compatibility)
                                      if (next.length === manualCount) {
                                        // Do a bulk save to keep existing API usage
                                        const bulkResp = await fetch(`${apiBase}/api/questions/bulk`, {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`
                                          },
                                          body: JSON.stringify({ questions: next })
                                        });
                                        const bulkData = await bulkResp.json();
                                        if (!bulkResp.ok) {
                                          throw new Error(bulkData.error || 'Error al guardar las preguntas en lote');
                                        }

                                        if (onQuestionsGenerated) {
                                          onQuestionsGenerated(next);
                                        }

                                        setStatusMessage('¡Todas las preguntas han sido guardadas exitosamente!');
                                        setTimeout(() => {
                                          setShowManualForm(false);
                                          setStatusMessage('');
                                        }, 1500);
                                        return next;
                                      } else {
                                        setManualQuestions(next);
                                        setManualStep(prev => prev + 1);
                                        setStatusMessage(`¡Pregunta ${next.length} de ${manualCount} guardada exitosamente!`);
                                        setTimeout(() => setStatusMessage(''), 1500);
                                        return saved;
                                      }
                                    } catch (error) {
                                      setError('No se pudo guardar la pregunta: ' + (error.message || 'Por favor, intenta de nuevo.'));
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                  onCancel={() => { setShowManualForm(false); }}
                                />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default AIQuestionGenerator;