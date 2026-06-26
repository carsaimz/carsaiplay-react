import { NavLink } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

export default function MobileNav() {
  const { lang } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();

  const items = [
    { to: '/',        icon: 'fa-house',         label: lang === 'pt' ? 'Início' : 'Home',    end: true },
    { to: '/catalog', icon: 'fa-film',           label: lang === 'pt' ? 'Catálogo' : 'Catalog' },
    { to: '/search',  icon: 'fa-magnifying-glass', label: lang === 'pt' ? 'Pesquisar' : 'Search' },
    { to: '/schedule',icon: 'fa-calendar',       label: lang === 'pt' ? 'Cronograma' : 'Schedule' },
    isAuthenticated
      ? { to: '/user/dashboard', icon: 'fa-user', label: lang === 'pt' ? 'Perfil' : 'Profile' }
      : { to: '/login',          icon: 'fa-right-to-bracket', label: lang === 'pt' ? 'Entrar' : 'Login' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur border-t border-surface-border safe-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`
            }
          >
            <i className={`fa-solid ${icon} text-lg`} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
