import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface AlarmingNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  isRead: boolean;
}

const AlarmingNotifications: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AlarmingNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/alerts/alarming');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch alarming notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-900/90 border-red-600',
          text: 'text-red-100',
          icon: '🚨'
        };
      case 'warning':
        return {
          bg: 'bg-orange-900/90 border-orange-600',
          text: 'text-orange-100',
          icon: '⚠️'
        };
      default:
        return {
          bg: 'bg-blue-900/90 border-blue-600',
          text: 'text-blue-100',
          icon: 'ℹ️'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="animate-pulse text-gray-400">{t('dashboard.loadingAlerts')}</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            🚨 {t('dashboard.alarmingNotifications')}
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('dashboard.awaitingFirstSensorReading')}</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config = getSeverityConfig(notification.severity);
            return (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-700 last:border-b-0 ${config.bg} ${
                  !notification.isRead ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{config.icon}</span>
                      <h4 className={`font-semibold ${config.text}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                          {t('dashboard.newAlert')}
                        </span>
                      )}
                    </div>
                    <p className={`${config.text} text-sm mb-2`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-4 text-xs text-gray-300 hover:text-white underline"
                    >
                      {t('dashboard.markRead')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlarmingNotifications;