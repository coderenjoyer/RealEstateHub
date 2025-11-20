import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useFeatureStatus } from '@/hooks/useFeatureStatus';

interface FeatureDisabledNotificationProps {
  showMessaging?: boolean;
  showNotifications?: boolean;
}

export const FeatureDisabledNotification: React.FC<FeatureDisabledNotificationProps> = ({
  showMessaging = true,
  showNotifications = true,
}) => {
  const { messagingEnabled, notificationsEnabled, loading } = useFeatureStatus();

  if (loading) {
    return null;
  }

  const disabledFeatures: string[] = [];

  if (showMessaging && !messagingEnabled) {
    disabledFeatures.push('Messaging');
  }

  if (showNotifications && !notificationsEnabled) {
    disabledFeatures.push('Notifications');
  }

  if (disabledFeatures.length === 0) {
    return null;
  }

  const message =
    disabledFeatures.length === 2
      ? 'Messaging and Notifications are currently disabled'
      : `${disabledFeatures[0]} is currently disabled`;

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
        <div>
          <p className="font-semibold text-yellow-800">{message}</p>
          <p className="text-sm text-yellow-700 mt-1">
            Some features are temporarily unavailable. Please try again later.
          </p>
        </div>
      </div>
    </div>
  );
};
