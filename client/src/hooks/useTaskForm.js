import { useState } from 'react';
import { DEFAULT_TASK_FORM_DATA, prepareTaskData, createInitialFormData } from '../utils/taskUtils';

export const useTaskForm = (initialTask = null, options = {}) => {
    const { onSubmit, onCancel } = options;

    const initialFormData = initialTask
        ? createInitialFormData(initialTask)
        : DEFAULT_TASK_FORM_DATA;

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const setTitle = (title) => updateField('title', title);
    const setDescription = (description) => updateField('description', description);
    const setStatus = (status) => updateField('status', status);
    const setDeadline = (deadline) => updateField('deadline', deadline);

    const resetForm = () => {
        setFormData(initialFormData);
    };

    const resetToDefault = () => {
        setFormData(DEFAULT_TASK_FORM_DATA);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const preparedData = prepareTaskData(formData);
            if (onSubmit) {
                await onSubmit(preparedData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) {
            onCancel();
        }
    };

    const hasChanges = () => {
        return Object.keys(formData).some(key => formData[key] !== initialFormData[key]);
    };

    return {
        formData,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline,
        isSubmitting,
        setTitle,
        setDescription,
        setStatus,
        setDeadline,
        updateField,
        handleSubmit,
        handleCancel,
        resetForm,
        resetToDefault,
        hasChanges,
        setFormData
    };
};
