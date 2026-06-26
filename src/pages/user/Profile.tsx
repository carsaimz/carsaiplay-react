import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/api/user';
import { toast } from 'react-toastify';
import { useSettingsStore } from '@/store/settingsStore';
import { imgUrl } from '@/utils/helpers';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      const res = await userApi.profile(fd);
      if (res.data.ok) { setUser(res.data.data); toast.success(t('Perfil actualizado!', 'Profile updated!')); }
    } catch { toast.error(t('Erro ao actualizar.', 'Update error.')); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-8">
      <h1 className="page-title mb-8"><i className="fa-solid fa-user-pen text-primary mr-3" />{t('Editar perfil', 'Edit profile')}</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <img src={imgUrl(user?.avatar, '/avatar.svg')} className="w-16 h-16 rounded-full object-cover border-2 border-primary/50" alt="" />
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="label">{t('Nome', 'Name')}</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <i className="fa-solid fa-circle-notch animate-spin" /> : <i className="fa-solid fa-floppy-disk" />}
            {t('Guardar', 'Save')}
          </button>
        </form>
      </div>
    </div>
  );
}
