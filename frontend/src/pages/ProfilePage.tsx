import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserAwarenessScore } from '../types';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [awarenessScore, setAwarenessScore] = useState<UserAwarenessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('user-123'); // TODO: Get from auth context

  useEffect(() => {
    const loadAwarenessScore = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/quizzes/user/${userId}/awareness`);
        if (!response.ok) throw new Error('Failed to load awareness score');
        const data = await response.json();
        setAwarenessScore(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadAwarenessScore();
  }, [userId]);

  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case 'good':
        return 'bg-green-500/10 border-green-500 text-green-400';
      case 'needs_improvement':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      case 'restricted':
        return 'bg-red-500/10 border-red-500 text-red-400';
      default:
        return 'bg-gray-500/10 border-gray-500 text-gray-400';
    }
  };

  const getStatusBadge = (status: string | undefined): string => {
    switch (status) {
      case 'good':
        return 'Proficient Farmer';
      case 'needs_improvement':
        return 'Growing Farmer';
      case 'restricted':
        return 'Lagged Farmer';
      default:
        return 'Farmer';
    }
  };

  const isCertified = awarenessScore?.overall_score === 100;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Farmer Profile</h1>
            <p className="text-gray-400">View your achievement and certification status</p>
          </div>
        </div>

        {loading && (
          <div className="bg-farm-card border border-farm-border rounded-lg p-8 text-center">
            <div className="text-gray-400">Loading profile...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {awarenessScore && !loading && (
          <div className="space-y-6">
            {/* Awareness Score Card */}
            <div className="bg-farm-card border border-farm-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Awareness Score</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Display */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary-600/10"></div>
                    <div className="relative text-center">
                      <div className="text-6xl font-bold text-primary-400">
                        {awarenessScore.overall_score}
                      </div>
                      <div className="text-gray-400">%</div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Farmer Status</p>
                    <div className={`inline-block px-4 py-2 rounded-full border ${getStatusColor(awarenessScore.status)}`}>
                      {getStatusBadge(awarenessScore.status)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Quizzes Completed</p>
                      <p className="text-2xl font-bold text-white">{awarenessScore.quizzes_completed}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Quizzes Passed</p>
                      <p className="text-2xl font-bold text-green-400">{awarenessScore.quizzes_passed}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Last Updated</p>
                      <p className="text-sm text-gray-300">
                        {new Date(awarenessScore.last_updated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Section */}
            {isCertified && (
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">🏆</span>
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-300">Congratulations!</h2>
                    <p className="text-gray-300">You have achieved 100% Awareness Score</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-6">
                  <img
                    src="/images/certificate.png"
                    alt="Farm2Vets Certificate of Excellence"
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  />
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-300 mb-4">
                    Your certificate recognizes your exceptional commitment to herd health and farm management.
                  </p>
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Download Certificate
                  </button>
                </div>
              </div>
            )}

            {!isCertified && (
              <div className="bg-farm-card border border-farm-border rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">📚</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Keep Learning!</h3>
                    <p className="text-gray-400">
                      Complete more quizzes and improve your awareness score to unlock your certificate.
                      Currently at {awarenessScore.overall_score}% - you're {100 - awarenessScore.overall_score}% away from certification!
                    </p>
                    <button className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Take More Quizzes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
