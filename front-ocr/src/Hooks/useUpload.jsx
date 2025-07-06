import { useState } from 'react';
import axios from 'axios';

export function useUpload(type) {
  const [loading, setLoading] = useState(false);

  const upload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = type === 'facture'
      ? `/workspaces/1/facture-globale/`
      : `/workspaces/1/documents/`;

    try {
      setLoading(true);
      await axios.post(import.meta.env.VITE_API_URL + endpoint, formData);
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading };
}