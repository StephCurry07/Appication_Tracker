import React, { useState, useEffect } from 'react';

interface DraftNotificationProps {
  show: boolean;
  message: string;
}

export const DraftNotification: React.FC<DraftNotificationProps> = ({ show, message }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="draft-notification">
      <span>💾 {message}</span>
    </div>
  );
};