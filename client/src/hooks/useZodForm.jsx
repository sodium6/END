import { useState } from 'react';
import { ZodError } from 'zod';

export const useZodForm = ({ schema, initialValues, onValidSubmit }) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = schema.parse(formData);
      setErrors({});
      if (onValidSubmit) {
        onValidSubmit(parsed);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = {};
        error.issues.forEach((issue) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return {
    formData,
    setFormData,
    errors,
    handleInputChange,
    handleSubmit,
  };
};
