import React from 'react';
import { useNotifier } from '../hooks/useNotifier';

const Notifier = () => {
  const { notifications, removeNotification } = useNotifier();

  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };

  const colorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed top-5 right-5 z-[200] w-full max-w-sm space-y-3">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`relative flex items-start gap-4 p-4 rounded-lg shadow-2xl text-white ${colorMap[notif.type]}`}
          style={{ animation: 'slideInLeft 0.3s ease-out forwards' }}
        >
          <div className="flex-shrink-0 pt-0.5">
            <i className={`fas ${iconMap[notif.type]} text-xl`}></i>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm leading-snug">{notif.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close notification"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      ))}
       <style>{`
          @keyframes slideInLeft {
            from { 
              opacity: 0; 
              transform: translateX(100%); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0); 
            }
          }
      `}</style>
    </div>
  );
};

export default Notifier;
