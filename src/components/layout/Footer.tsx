import { Link } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';

export default function Footer() {
  const { lang } = useSettingsStore();
  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  return (
    <footer className="bg-surface-card border-t border-surface-border mt-16 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="font-display text-2xl text-gradient tracking-widest">CARSAIPLAY</span>
            <p className="text-xs text-text-muted mt-2">{t('Filmes, Séries e Animes', 'Movies, Series & Anime')}</p>
            <p className="text-xs text-text-muted mt-1">Moçambique 🇲🇿</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t('Navegar', 'Navigate')}</h4>
            <div className="space-y-2">
              {[
                ['/catalog', t('Catálogo', 'Catalog')],
                ['/schedule', t('Cronograma', 'Schedule')],
                ['/blog', 'Blog'],
                ['/request', t('Pedidos', 'Requests')],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="block text-sm text-text-secondary hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t('Conta', 'Account')}</h4>
            <div className="space-y-2">
              {[
                ['/login', t('Entrar', 'Sign in')],
                ['/register', t('Registar', 'Register')],
                ['/user/favorites', t('Favoritos', 'Favorites')],
                ['/user/history', t('Histórico', 'History')],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="block text-sm text-text-secondary hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">{t('Legal', 'Legal')}</h4>
            <div className="space-y-2">
              {[
                ['/terms', t('Termos de Uso', 'Terms of Use')],
                ['/privacy', t('Privacidade', 'Privacy')],
                ['/about', t('Sobre nós', 'About us')],
                ['/contact', 'Contacto'],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="block text-sm text-text-secondary hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-surface-border text-center text-xs text-text-muted">
          © {new Date().getFullYear()} CarsaiPlay. {t('Todos os direitos reservados.', 'All rights reserved.')}
          <span className="mx-2">·</span>
          {t('Conteúdo fornecido por terceiros.', 'Content provided by third parties.')}
        </div>
      </div>
    </footer>
  );
}
