import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/admin',               label: 'Dashboard',       icon: 'fa-gauge-high',    end: true },
  { to: '/admin/content',       label: 'Conteúdo',        icon: 'fa-film' },
  { to: '/admin/users',         label: 'Utilizadores',    icon: 'fa-users' },
  { to: '/admin/comments',      label: 'Comentários',     icon: 'fa-comments' },
  { to: '/admin/requests',      label: 'Pedidos',         icon: 'fa-hand' },
  { to: '/admin/categories',    label: 'Categorias',      icon: 'fa-tags' },
  { to: '/admin/schedule',      label: 'Cronograma',      icon: 'fa-calendar-days' },
  { to: '/admin/blog',          label: 'Blog',            icon: 'fa-newspaper' },
  { to: '/admin/ads',           label: 'Anúncios',        icon: 'fa-rectangle-ad' },
  { to: '/admin/emails',        label: 'Emails',          icon: 'fa-envelope' },
  { to: '/admin/notifications', label: 'Notificações',    icon: 'fa-bell' },
  { to: '/admin/reports',       label: 'Relatórios',      icon: 'fa-chart-bar' },
  { to: '/admin/logs',          label: 'Logs',            icon: 'fa-terminal' },
  { to: '/admin/db',            label: 'Gestor de BD',    icon: 'fa-database' },
  { to: '/admin/settings',      label: 'Definições',      icon: 'fa-gear' },
];

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão encerrada');
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-surface-border">
        <span className="font-display text-2xl text-gradient tracking-widest">CARSAIPLAY</span>
        <p className="text-xs text-text-muted mt-1">Painel de Administração</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-white'
              }`
            }
          >
            <i className={`fa-solid ${icon} w-4 text-center`} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-surface-border space-y-2">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <i className="fa-solid fa-user text-primary text-xs" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <NavLink to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-white transition-colors">
          <i className="fa-solid fa-arrow-left w-4 text-center" /> Ver site
        </NavLink>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/20">
          <i className="fa-solid fa-right-from-bracket w-4 text-center" /> Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Desktop sidebar */}
      <aside className="w-60 bg-surface-card border-r border-surface-border hidden md:flex flex-col fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-surface-card border-b border-surface-border px-4 h-14 flex items-center justify-between">
        <span className="font-display text-xl text-gradient tracking-widest">CARSAIPLAY</span>
        <button onClick={() => setMobileOpen(v => !v)} className="btn-icon w-9 h-9">
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-surface-card border-r border-surface-border flex flex-col z-50">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="md:ml-60 flex-1 p-4 md:p-6 pt-20 md:pt-6 min-h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
