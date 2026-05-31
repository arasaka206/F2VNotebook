import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import type { Quiz, QuizWithQuestions, UserQuizAttempt, UserAwarenessScore } from '../types';

const QuizPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [awarenessScore, setAwarenessScore] = useState<UserAwarenessScore | null>(null);
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);
  const [lastAttempt, setLastAttempt] = useState<UserQuizAttempt | null>(null);
  const quizLanguage = i18n.language?.startsWith('vi') ? 'vi' : 'en';

  useEffect(() => {
    loadQuizzes();
    loadUserData();
  }, [quizLanguage]);

  useEffect(() => {
    const pendingQuizId = window.localStorage.getItem('notebookGeneratedQuizId');
    if (pendingQuizId) {
      window.localStorage.removeItem('notebookGeneratedQuizId');
      startQuiz(pendingQuizId);
    }
  }, [quizzes]);

  const loadQuizzes = async () => {
    try {
      const response = await api.get('/quizzes', { params: { language: quizLanguage } });
      setQuizzes(response.data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Mock user ID - in real app this would come from auth
      const userId = 'user-123';
      const [scoreResponse, attemptsResponse] = await Promise.all([
        api.get(`/quizzes/user/${userId}/awareness`),
        api.get(`/quizzes/user/${userId}/attempts`)
      ]);
      setAwarenessScore(scoreResponse.data);
      setAttempts(attemptsResponse.data);
      window.dispatchEvent(new Event('awarenessScoreUpdated'));
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`, { params: { language: quizLanguage } });
      setSelectedQuiz(response.data);
      setUserAnswers(new Array(response.data.questions.length).fill(-1));
      setShowResults(false);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    }
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      const response = await api.post('/quizzes/attempt', {
        quiz_id: selectedQuiz.id,
        answers: userAnswers,
        time_taken: 300 // Mock time taken
      }, {
        params: { user_id: 'user-123' } // Mock user ID
      });

      setAttempts(prev => [response.data, ...prev]);
      setLastAttempt(response.data);
      setShowResults(true);
      loadUserData(); // Refresh awareness score
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getNextQuiz = () => {
    if (!selectedQuiz) return null;
    const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = difficultyOrder.indexOf(selectedQuiz.difficulty);
    return quizzes.find((quiz) => difficultyOrder.indexOf(quiz.difficulty) > currentIndex && quiz.id !== selectedQuiz.id) || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'needs_improvement': return 'text-yellow-400';
      case 'restricted': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatAwarenessStatus = (status: string) =>
    t(`quiz.awarenessStatuses.${status}`, { defaultValue: status.replace('_', ' ') });

  const formatAttemptStatus = (status: string) =>
    t(`quiz.attemptStatuses.${status}`, { defaultValue: status });

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US');

  if (loading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center text-gray-400">
        <span className="animate-pulse">{t('quiz.loading')}</span>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 p-6 overflow-y-auto text-left">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="text-left text-2xl font-bold text-white">{t('app.quizzes')}</h1>
          {awarenessScore && (
            <div className="w-full rounded-lg border border-gray-700 bg-gray-800 p-4 text-left sm:w-auto sm:min-w-56">
              <div className="text-sm text-gray-400">{t('quiz.awarenessScore')}</div>
              <div className={`text-2xl font-bold ${getScoreColor(awarenessScore.overall_score)}`}>
                {awarenessScore.overall_score.toFixed(1)}%
              </div>
              <div className={`text-xs ${getStatusColor(awarenessScore.status)}`}>
                {t('quiz.statusLabel')}: {formatAwarenessStatus(awarenessScore.status)}
              </div>
            </div>
          )}
        </div>

        {awarenessScore?.status === 'restricted' && (
          <div className="rounded-lg border border-red-600 bg-red-900/50 p-4 text-left">
            <div className="flex items-center gap-2 text-red-400">
              <span className="font-semibold">!</span>
              <span className="font-semibold">{t('quiz.accessRestricted')}</span>
            </div>
            <p className="mt-2 text-sm text-red-300">
              {t('quiz.restrictedMessage')}
            </p>
          </div>
        )}

        {selectedQuiz ? (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">{selectedQuiz.title}</h2>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-400 hover:text-white"
                aria-label={t('common.close')}
              >
                X
              </button>
            </div>

            {selectedQuiz.description && (
              <p className="mb-2 text-gray-300">{selectedQuiz.description}</p>
            )}
            <p className="mb-6 text-xs text-gray-500">
              {t('quiz.passingScore')}: {selectedQuiz.passing_score}% · {t('quiz.type')}: {selectedQuiz.topic === 'notebook' ? t('quiz.notebookBased') : t('quiz.generalKnowledge')}
            </p>

            <div className="space-y-6">
              {selectedQuiz.questions.map((question, qIndex) => (
                <div key={question.id} className="border-b border-gray-700 pb-6 last:border-b-0">
                  <h3 className="mb-4 text-lg font-medium text-white">
                    {qIndex + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={oIndex}
                          checked={userAnswers[qIndex] === oIndex}
                          onChange={() => {
                            const newAnswers = [...userAnswers];
                            newAnswers[qIndex] = oIndex;
                            setUserAnswers(newAnswers);
                          }}
                          className="text-green-500 focus:ring-green-500"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                  {showResults && (
                    <div className="mt-4 rounded bg-gray-700 p-3">
                      <div className={`text-sm ${userAnswers[qIndex] === question.correct_answer ? 'text-green-400' : 'text-red-400'}`}>
                        {userAnswers[qIndex] === question.correct_answer ? t('quiz.correct') : t('quiz.incorrect')}
                      </div>
                      {question.explanation && (
                        <p className="mt-1 text-xs text-gray-400">{question.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showResults && lastAttempt && (
              <div className="mt-6 rounded-lg border border-gray-700 bg-gray-900/80 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {lastAttempt.status === 'completed' ? t('quiz.certificateEarned') : t('quiz.reviewAndRetry')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {lastAttempt.status === 'completed'
                        ? t('quiz.passedMessage', { score: lastAttempt.score.toFixed(1) })
                        : t('quiz.failedMessage', { score: lastAttempt.score.toFixed(1) })}
                    </p>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs ${lastAttempt.status === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {lastAttempt.status === 'completed' ? t('quiz.passed') : t('quiz.failed')}
                  </span>
                </div>
                {lastAttempt.status !== 'completed' && (
                  <p className="mt-3 text-xs text-gray-500">{t('quiz.retryAdvice')}</p>
                )}
                {lastAttempt.status === 'completed' && getNextQuiz() && (
                  <button
                    onClick={() => {
                      const nextQuiz = getNextQuiz();
                      if (nextQuiz) startQuiz(nextQuiz.id);
                    }}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                  >
                    {t('quiz.continueNext')}
                  </button>
                )}
              </div>
            )}

            {!showResults ? (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={submitQuiz}
                  disabled={userAnswers.includes(-1)}
                  className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('quiz.submit')}
                </button>
              </div>
            ) : (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-gray-300">
                  {t('quiz.completed')}
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-500"
                >
                  {t('quiz.backToQuizzes')}
                </button>
              </div>
            )}
          </div>
        ) : (
          quizzes.length === 0 ? (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-10 text-left text-gray-400">
              <p className="mb-2 text-lg font-semibold text-white">{t('quiz.noQuizzes')}</p>
              <p className="text-sm">{t('quiz.noQuizzesMessage')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="rounded-lg border border-gray-700 bg-gray-800 p-6 transition hover:border-green-500">
                  <h3 className="mb-2 text-lg font-semibold text-white">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-300">{quiz.description}</p>
                  )}
                  <div className="mb-4 flex items-center justify-between gap-4 text-xs text-gray-400">
                    <span>{quiz.topic === 'notebook' ? t('quiz.notebookBasedQuiz') : t('quiz.topicLabel', { topic: quiz.topic })}</span>
                    <span>{t('quiz.difficultyLabel', { difficulty: quiz.difficulty })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {quiz.time_limit ? t('quiz.minutes', { count: quiz.time_limit }) : t('quiz.noTimeLimit')}
                    </span>
                    <button
                      onClick={() => startQuiz(quiz.id)}
                      className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                    >
                      {t('quiz.start')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {attempts.length > 0 && (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{t('quiz.recentAttempts')}</h3>
            <div className="space-y-3">
              {attempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between border-b border-gray-700 py-2 last:border-b-0">
                  <div>
                    <span className="text-gray-300">{t('quiz.attemptCompleted')}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {formatDate(attempt.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getScoreColor(attempt.score)}`}>
                      {attempt.score.toFixed(1)}%
                    </span>
                    <span className={`rounded px-2 py-1 text-xs ${
                      attempt.status === 'completed'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-red-900 text-red-400'
                    }`}>
                      {formatAttemptStatus(attempt.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
