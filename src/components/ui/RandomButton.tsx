import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { useSettingsStore } from '@/store/settingsStore';

export default function RandomButton({ type = '', category = '' }: { type?: string; category?: string }) {
  const [loading, setLoading] = useState(false);
  const { lang } = useSettingsStore();
  const navigate = useNavigate();

  const surprise = async () => {
    setLoading(true);
    try {
      const res = await api.get('/random', { params: { type, category } });
      if (res.data.ok) navigate(`/content/${res.data.data.slug}`);
    } catch {} finally { setLoading(false); }
  };

  return (
    <button onClick={surprise} disabled={loading} className="btn-ghost gap-2">
      {loading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-shuffle" />}
      {lang === 'en' ? 'Surprise me' : 'Surpreende-me!'}
    </button>
  );
}
