import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface AnalysisResult {
  summary: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  tags: string[];
  recommendations: string[];
}

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  analysis?: AnalysisResult | null;
}

interface AIHerdNotebookProps {
  addNoteRef?: React.RefObject<HTMLDivElement | null>;
  historyRef?: React.RefObject<HTMLDivElement | null>;
}

const AIHerdNotebook: React.FC<AIHerdNotebookProps> = ({ addNoteRef, historyRef }) => {
  const { t, i18n } = useTranslation();
  const [log, setLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [generatingNoteQuizId, setGeneratingNoteQuizId] = useState<string | null>(null);
  const [generatedNoteQuizIds, setGeneratedNoteQuizIds] = useState<Record<string, string>>({});

  const fetchNotes = async () => {
    try {
      const res = await api.get('/ai/notebook');
      const loadedNotes = res.data.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp + 'Z')
      }));
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notebook history:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSaveNormal = async () => {
    if (!log.trim()) return;
    setLoading(true);

    try {
      await api.post('/ai/notebook', { content: log });
      await fetchNotes();
      setLog('');
    } catch (error) {
      window.alert(t('notebook.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAndSave = async () => {
    if (!log.trim()) return;
    setLoading(true);

    try {
      const aiRes = await api.post('/ai/analyze-log', { content: log });
      const saveRes = await api.post('/ai/notebook', {
        content: log,
        ...aiRes.data
      });

      const noteId = saveRes.data.id;

      if (aiRes.data.urgency === 'Critical') {
        try {
          const quizRes = await api.post(`/quizzes/from-notebook/${noteId}`);
          const quizId = quizRes.data.id;
          window.localStorage.setItem('notebookGeneratedQuizId', quizId);
          setGeneratedNoteQuizIds((prev) => ({ ...prev, [noteId]: quizId }));
          window.alert(t('notebook.criticalQuizGenerated'));
        } catch (quizError) {
          console.error('Failed to auto-generate quiz from critical note:', quizError);
          window.alert(t('notebook.criticalQuizFailed'));
        }
      }

      await fetchNotes();
      setLog('');
    } catch (error) {
      window.alert(t('notebook.aiSaveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (noteId: string) => {
    setGeneratingNoteQuizId(noteId);
    try {
      const response = await api.post(`/quizzes/from-notebook/${noteId}`);
      const quizId = response.data.id;
      window.localStorage.setItem('notebookGeneratedQuizId', quizId);
      setGeneratedNoteQuizIds((prev) => ({ ...prev, [noteId]: quizId }));
      window.alert(t('notebook.quizGenerated'));
    } catch (error) {
      console.error('Failed to generate quiz from note:', error);
      window.alert(t('notebook.quizGenerateError'));
    } finally {
      setGeneratingNoteQuizId(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  const formatNoteTime = (timestamp: Date) =>
    `${timestamp.toLocaleTimeString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })} - ${timestamp.toLocaleDateString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US')}`;

  return (
    <div className="space-y-6">
      <div ref={addNoteRef} className="bg-gray-900 rounded-lg p-5 shadow-lg border border-gray-800 flex flex-col space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📓</span>
          <div>
            <h3 className="text-md font-semibold text-white">{t('notebook.addNoteTitle')}</h3>
            <p className="text-xs text-gray-400">{t('notebook.addNoteSubtitle')}</p>
          </div>
        </div>

        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          placeholder={t('notebook.notePlaceholder')}
          className="w-full bg-gray-800 text-sm text-gray-200 border border-gray-700 rounded-lg p-3 outline-none focus:ring-1 focus:ring-blue-500 h-28 resize-none"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSaveNormal}
            disabled={loading || !log.trim()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t('notebook.saveNormal')}
          </button>

          <button
            onClick={handleAnalyzeAndSave}
            disabled={loading || !log.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <span className="animate-pulse">{t('notebook.processing')}</span> : <><span>✨</span> {t('notebook.analyzeAndSave')}</>}
          </button>
        </div>
      </div>

      <div ref={historyRef} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">{t('notebook.historyTitle')}</h3>

        {notes.length === 0 ? (
          <div className="text-center p-6 text-gray-500 bg-gray-800/50 rounded-lg border border-gray-700 border-dashed">
            {t('notebook.noNotes')}
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 shadow-sm animate-fade-in">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{note.content}</p>
                <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                  {formatNoteTime(note.timestamp)}
                </span>
              </div>

              {note.analysis && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-sm bg-gray-900/50 -mx-4 -mb-4 p-4 rounded-b-lg">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getUrgencyColor(note.analysis.urgency)}`}>
                      {t('notebook.urgency')}: {t(`notebook.urgencies.${note.analysis.urgency}`, { defaultValue: note.analysis.urgency })}
                    </span>
                    {note.analysis.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-gray-300 block mb-1">{t('notebook.diagnosis')}:</strong>
                      <p className="text-gray-400 leading-relaxed text-xs">{note.analysis.summary}</p>
                    </div>
                    <div>
                      <strong className="text-gray-300 block mb-1">{t('notebook.recommendations')}:</strong>
                      <ul className="list-disc pl-5 text-gray-400 text-xs space-y-1">
                        {note.analysis.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleGenerateQuiz(note.id)}
                  disabled={generatingNoteQuizId === note.id}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white text-sm font-medium"
                >
                  {generatingNoteQuizId === note.id ? t('notebook.generatingQuiz') : t('notebook.generateQuiz')}
                </button>
                {generatedNoteQuizIds[note.id] && (
                  <span className="text-xs text-green-300">{t('notebook.quizCreatedHint')}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIHerdNotebook;
