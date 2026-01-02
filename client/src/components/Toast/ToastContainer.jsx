import React from 'react';
import Toast from './Toast';
import './ToastContainer.css';

const ToastContainer = ({ toasts, onDismissToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          onUndo={toast.onUndo}
          onDismiss={() => onDismissToast(toast.id)}
          duration={toast.duration}
          showCountdown={toast.showCountdown}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
