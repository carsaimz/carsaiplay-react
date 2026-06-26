import { Link } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';

export default function NotFound() {
  const { lang } = useSettingsStore();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-8xl text-primary/20 tracking-widest">404</p>
      <h1 className="text-2xl font-bold text-white mt-2 mb-2">
        {lang === 'pt' ? 'Página não encontrada' : 'Page not found'}
      </h1>
      <p className="text-text-muted mb-8 text-sm">
        {lang === 'pt' ? 'A página que procuras não existe ou foi removida.' : 'The page you are looking for does not exist or has been removed.'}
      </p>
      <Link to="/" className="btn-primary">
        <i className="fa-solid fa-house" /> {lang === 'pt' ? 'Voltar ao início' : 'Back to home'}
      </Link>
    </div>
  );
}
