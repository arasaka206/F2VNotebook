import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Quiz, QuizWithQuestions, UserQuizAttempt, UserAwarenessScore } from '../types';

const QuizPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [awarenessScore, setAwarenessScore] = useState<UserAwarenessScore | null>(null);
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);

  useEffect(() => {
    loadQuizzes();
    loadUserData();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await api.get('/quizzes');
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
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'needs_improvement': return 'text-yellow-400';
      case 'restricted': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center text-gray-400">
        <span className="animate-pulse">Loading quizzes...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Disease Awareness Quizzes</h1>
          {awarenessScore && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-gray-400">Your Awareness Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(awarenessScore.overall_score)}`}>
                {awarenessScore.overall_score.toFixed(1)}%
              </div>
              <div className={`text-xs ${getStatusColor(awarenessScore.status)}`}>
                Status: {awarenessScore.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Awareness Status Warning */}
        {awarenessScore?.status === 'restricted' && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <span>⚠️</span>
              <span className="font-semibold">Access Restricted</span>
            </div>
            <p className="text-red-300 text-sm mt-2">
              Your awareness score is low. Complete more quizzes to improve your score and regain full access to features.
            </p>
          </div>
        )}

        {selectedQuiz ? (
          /* Quiz Taking Interface */
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">{selectedQuiz.title}</h2>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedQuiz.description && (
              <p className="text-gray-300 mb-6">{selectedQuiz.description}</p>
            )}

            <div className="space-y-6">
              {selectedQuiz.questions.map((question, qIndex) => (
                <div key={question.id} className="border-b border-gray-700 pb-6 last:border-b-0">
                  <h3 className="text-lg font-medium text-white mb-4">
                    {qIndex + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="flex items-center gap-3 cursor-pointer">
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
                    <div className="mt-4 p-3 bg-gray-700 rounded">
                      <div className={`text-sm ${userAnswers[qIndex] === question.correct_answer ? 'text-green-400' : 'text-red-400'}`}>
                        {userAnswers[qIndex] === question.correct_answer ? '✓ Correct' : '✗ Incorrect'}
                      </div>
                      {question.explanation && (
                        <p className="text-xs text-gray-400 mt-1">{question.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!showResults ? (
              <div className="flex justify-end mt-6">
                <button
                  onClick={submitQuiz}
                  disabled={userAnswers.includes(-1)}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-medium"
                >
                  Submit Quiz
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mt-6">
                <div className="text-gray-300">
                  Quiz completed! Check your results above.
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-medium"
                >
                  Back to Quizzes
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Quiz List */
          quizzes.length === 0 ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-10 text-center text-gray-400">
              <p className="text-lg font-semibold text-white mb-2">No quizzes are available yet.</p>
              <p className="text-sm">Please check back after the system seeds the quiz content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-green-500 transition">
                  <h3 className="text-lg font-semibold text-white mb-2">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>Topic: {quiz.topic}</span>
                    <span>Difficulty: {quiz.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {quiz.time_limit ? `${quiz.time_limit} min` : 'No time limit'}
                    </span>
                    <button
                      onClick={() => startQuiz(quiz.id)}
                      className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm text-white font-medium"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Quiz Attempts</h3>
            <div className="space-y-3">
              {attempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <div>
                    <span className="text-gray-300">Quiz completed</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getScoreColor(attempt.score)}`}>
                      {attempt.score.toFixed(1)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      attempt.status === 'completed'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-red-900 text-red-400'
                    }`}>
                      {attempt.status}
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