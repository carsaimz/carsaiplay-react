import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'react-toastify';

interface Props {
  url?: string;
  title: string;
  text?: string;
}

export default function ShareButton({ url, title, text }: Props) {
  const { lang } = useSettingsStore();
  const shareUrl = url || window.location.href;

  const share = async () => {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text: text || title, url: shareUrl });
    } else if (navigator.share) {
      await navigator.share({ title, text: text || title, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(lang === 'en' ? 'Link copied!' : 'Link copiado!');
    }
  };

  return (
    <button onClick={share} className="btn-ghost text-sm gap-2">
      <i className="fa-solid fa-share-nodes" />
      {lang === 'en' ? 'Share' : 'Partilhar'}
    </button>
  );
}
