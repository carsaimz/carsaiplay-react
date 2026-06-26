import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';

export default function MainLayout() {
  const { pathname } = useLocation();
  const isEpisode = pathname.startsWith('/episode/');

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {!isEpisode && <Header />}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {!isEpisode && <Footer />}
      <MobileNav />
    </div>
  );
}
