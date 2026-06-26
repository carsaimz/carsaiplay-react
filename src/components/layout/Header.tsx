import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSearch } from '@/hooks/useContent';
import { imgUrl } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { lang, setLang } = useSettingsStore();
  const { data: results } = useSearch(q);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const nav = [
    { to: '/',        label: lang === 'pt' ? 'Início' : 'Home' },
    { to: '/catalog', label: lang === 'pt' ? 'Catálogo' : 'Catalog' },
    { to: '/schedule',label: lang === 'pt' ? 'Cronograma' : 'Schedule' },
    { to: '/blog',    label: 'Blog' },
  ];

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else setQ('');
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="font-display text-2xl text-gradient tracking-widest shrink-0">
          CARSAIPLAY
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {nav.map(({ to, label }) => (
            <Link key={to} to={to}
              className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-surface-elevated transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search bar */}
        <div className="relative">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
                  placeholder={lang === 'pt' ? 'Pesquisar…' : 'Search…'}
                  className="input py-2 text-sm"
                  onKeyDown={e => { if (e.key === 'Enter' && q.trim()) { navigate(`/search?q=${q}`); setSearchOpen(false); }}}
                />
                {results?.length ? (
                  <div className="absolute top-full left-0 w-full mt-2 bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50">
                    {results.slice(0, 6).map(item => (
                      <Link key={item.id} to={`/content/${item.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-surface-elevated transition-colors">
                        <img src={imgUrl(item.poster_url)} alt={item.title_pt}
                          className="w-9 h-12 object-cover rounded" />
                        <div>
                          <p className="text-sm font-medium text-white line-clamp-1">{item.title_pt}</p>
                          <p className="text-xs text-text-muted">{item.release_year} · {item.type}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSearchOpen(v => !v)} className="btn-icon ml-1">
            <i className={`fa-solid ${searchOpen ? 'fa-xmark' : 'fa-magnifying-glass'} text-sm`} />
          </button>
        </div>

        {/* Lang toggle */}
        <button onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
          className="btn-ghost py-1.5 px-2.5 text-xs font-semibold">
          {lang === 'pt' ? '🇲🇿 PT' : '🇬🇧 EN'}
        </button>

        {/* Auth */}
        {isAuthenticated ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={imgUrl(user?.avatar, '/avatar.svg')} alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-primary/50" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute right-0 top-12 w-48 bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50">
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-warning hover:bg-surface-elevated">
                      <i className="fa-solid fa-shield-halved" /> Admin
                    </Link>
                  )}
                  <Link to="/user/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:bg-surface-elevated hover:text-white">
                    <i className="fa-solid fa-user" /> {lang === 'pt' ? 'O meu perfil' : 'My profile'}
                  </Link>
                  <Link to="/user/favorites" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:bg-surface-elevated hover:text-white">
                    <i className="fa-solid fa-heart" /> {lang === 'pt' ? 'Favoritos' : 'Favorites'}
                  </Link>
                  <hr className="border-surface-border" />
                  <button onClick={async () => { const { useAuthStore } = await import('@/store/authStore'); useAuthStore.getState().logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:bg-surface-elevated hover:text-white">
                    <i className="fa-solid fa-right-from-bracket" /> {lang === 'pt' ? 'Sair' : 'Logout'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login" className="btn-primary py-2 px-4 text-sm">
            <i className="fa-solid fa-right-to-bracket" />
            {lang === 'pt' ? 'Entrar' : 'Sign in'}
          </Link>
        )}
      </div>
    </header>
  );
}
