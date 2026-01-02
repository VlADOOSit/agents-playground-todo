import { useState, useCallback, useRef } from 'react';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const timeoutsRef = useRef(new Map());

    const addToast = useCallback((message, options = {}) => {
        const id = ++toastId;
        const toast = {
            id,
            message,
            duration: options.duration || 5000,
            showCountdown: options.showCountdown !== false,
            onUndo: options.onUndo,
            onTimeout: options.onTimeout,
        };

        setToasts((prevToasts) => [...prevToasts, toast]);

        if (options.duration !== 0) {
            const timeoutId = setTimeout(() => {
                dismissToast(id);
                if (options.onTimeout) {
                    options.onTimeout();
                }
                timeoutsRef.current.delete(id);
            }, toast.duration);

            timeoutsRef.current.set(id, timeoutId);
        }

        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        const timeoutId = timeoutsRef.current.get(id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutsRef.current.delete(id);
        }

        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        timeoutsRef.current.clear();

        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        dismissToast,
        clearAllToasts,
    };
};
