
import React from 'react';

interface ToastProps {
  status: 'success' | 'error' | 'pending';
  message: string;
  onClose?: () => void;
}

const statusClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  pending: 'bg-yellow-500',
};

const Toast: React.FC<ToastProps> = ({ status, message, onClose }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${statusClasses[status]}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-4 font-bold">
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
