import { useCallback, useRef, useMemo, useEffect, useState } from 'react';

export const useDraftAutosave = (draftKey, formData, initialFormData = {}, enabled = true, forceDisabled = false) => {
    const debounceRef = useRef(null);
    const [localStorageTrigger, setLocalStorageTrigger] = useState(0);

    const draftInfo = useMemo(() => {
        if (!enabled || !draftKey) {
            return { hasDraft: false, isDraftExpired: false, data: null };
        }

        try {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                const parsedDraft = JSON.parse(savedDraft);

                const now = new Date().getTime();
                const draftTime = parsedDraft.timestamp || 0;
                const daysDiff = (now - draftTime) / (1000 * 60 * 60 * 24);

                if (daysDiff > 7) {
                    localStorage.removeItem(draftKey);
                    return { hasDraft: false, isDraftExpired: true, data: null };
                }

                return { hasDraft: true, isDraftExpired: false, data: parsedDraft.data };
            }
        } catch (error) {
            console.error('Error loading draft:', error);
            localStorage.removeItem(draftKey);
        }

        return { hasDraft: false, isDraftExpired: false, data: null };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftKey, enabled, localStorageTrigger]);

    const { hasDraft, isDraftExpired, data: draftData } = draftInfo;

    const saveDraft = useCallback((data) => {
        if (!enabled || !draftKey) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            try {
                const draftToSave = {
                    data,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem(draftKey, JSON.stringify(draftToSave));
            } catch (error) {
                console.error('Error saving draft:', error);
            }
        }, 500);
    }, [draftKey, enabled]);

    useEffect(() => {
        if (enabled && !forceDisabled && formData && initialFormData) {
            const hasBeenModified = Object.keys(formData).some(key => {
                const currentValue = formData[key];
                const initialValue = initialFormData[key];
                return currentValue !== initialValue;
            });

            const hasMeaningfulData = Object.values(formData).some(value =>
                value !== '' && value !== null && value !== undefined
            );

            const isAtInitialState = Object.keys(formData).every(key => {
                const currentValue = formData[key];
                const initialValue = initialFormData[key];
                return currentValue === initialValue;
            });

            if (hasBeenModified && hasMeaningfulData && !isAtInitialState) {
                saveDraft(formData);
            }
        }
    }, [formData, initialFormData, saveDraft, enabled, forceDisabled]);

    const restoreDraft = useCallback(() => {
        const data = draftData;
        if (draftKey) {
            localStorage.removeItem(draftKey);
            setLocalStorageTrigger(prev => prev + 1);
        }
        return data;
    }, [draftData, draftKey]);

    const clearDraft = useCallback(() => {
        if (draftKey) {
            localStorage.removeItem(draftKey);
            setLocalStorageTrigger(prev => prev + 1);
        }
    }, [draftKey]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        hasDraft,
        isDraftExpired,
        draftData,
        restoreDraft,
        clearDraft,
        saveDraft
    };
};
