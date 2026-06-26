import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import PageLoader from '@/components/ui/PageLoader';
import PwaInstallBanner from '@/components/ui/PwaInstallBanner';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

// ── Public pages ──────────────────────────────────────────────────────
const Home        = lazy(() => import('@/pages/Home'));
const Catalog     = lazy(() => import('@/pages/Catalog'));
const ContentPage = lazy(() => import('@/pages/Content'));
const Episode     = lazy(() => import('@/pages/Episode'));
const Search      = lazy(() => import('@/pages/Search'));
const Schedule    = lazy(() => import('@/pages/Schedule'));
const Blog        = lazy(() => import('@/pages/Blog'));
const BlogPost    = lazy(() => import('@/pages/BlogPost'));
const About       = lazy(() => import('@/pages/About'));
const Contact     = lazy(() => import('@/pages/Contact'));
const Request     = lazy(() => import('@/pages/Request'));
const Terms       = lazy(() => import('@/pages/Terms'));
const Privacy     = lazy(() => import('@/pages/Privacy'));
const Faq         = lazy(() => import('@/pages/Faq'));
const Dmca        = lazy(() => import('@/pages/Dmca'));
const ApiDocs     = lazy(() => import('@/pages/ApiDocs'));
const SharedList  = lazy(() => import('@/pages/SharedList'));
const NotFound    = lazy(() => import('@/pages/NotFound'));

// ── Auth pages ────────────────────────────────────────────────────────
const Login    = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Forgot   = lazy(() => import('@/pages/auth/Forgot'));
const Reset    = lazy(() => import('@/pages/auth/Reset'));

// ── User pages ────────────────────────────────────────────────────────
const UserDashboard  = lazy(() => import('@/pages/user/Dashboard'));
const UserFavorites  = lazy(() => import('@/pages/user/Favorites'));
const UserHistory    = lazy(() => import('@/pages/user/History'));
const UserProfile    = lazy(() => import('@/pages/user/Profile'));
const UserSettings   = lazy(() => import('@/pages/user/Settings'));
const WatchLater     = lazy(() => import('@/pages/user/WatchLater'));
const Notifications  = lazy(() => import('@/pages/user/Notifications'));
const Achievements   = lazy(() => import('@/pages/user/Achievements'));
const Profiles       = lazy(() => import('@/pages/user/Profiles'));
const Follows        = lazy(() => import('@/pages/user/Follows'));
const Reminders      = lazy(() => import('@/pages/user/Reminders'));
const UserStats      = lazy(() => import('@/pages/user/Stats'));
const UserRequests   = lazy(() => import('@/pages/user/Requests'));

// ── Admin pages ───────────────────────────────────────────────────────
const AdminDashboard     = lazy(() => import('@/pages/admin/Dashboard'));
const AdminContent       = lazy(() => import('@/pages/admin/Content'));
const AdminContentForm   = lazy(() => import('@/pages/admin/ContentForm'));
const AdminEpisodes      = lazy(() => import('@/pages/admin/Episodes'));
const AdminUsers         = lazy(() => import('@/pages/admin/Users'));
const AdminBlog          = lazy(() => import('@/pages/admin/Blog'));
const AdminBlogForm      = lazy(() => import('@/pages/admin/BlogForm'));
const AdminSettings      = lazy(() => import('@/pages/admin/Settings'));
const AdminReports       = lazy(() => import('@/pages/admin/Reports'));
const AdminAds           = lazy(() => import('@/pages/admin/Ads'));
const AdminComments      = lazy(() => import('@/pages/admin/Comments'));
const AdminRequests      = lazy(() => import('@/pages/admin/Requests'));
const AdminCategories    = lazy(() => import('@/pages/admin/Categories'));
const AdminSchedule      = lazy(() => import('@/pages/admin/Schedule'));
const AdminNotifications = lazy(() => import('@/pages/admin/Notifications'));
const AdminEmails        = lazy(() => import('@/pages/admin/Emails'));
const AdminLogs          = lazy(() => import('@/pages/admin/Logs'));
const AdminDbManager     = lazy(() => import('@/pages/admin/DbManager'));

function AppInner() {
  usePushNotifications();
  useRealtimeNotifications();
  return null;
}

export default function App() {
  const { loadSession } = useAuthStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSession();
    loadSettings();
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#0a0a0f' });
    }
  }, []);

  return (
    <>
      <AppInner />
      <ToastContainer position="top-right" autoClose={3000} theme="dark"
        toastStyle={{ background: '#111118', border: '1px solid #1e1e2a', color: '#f5f5f5' }} />
      <PwaInstallBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Auth ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<Forgot />} />
            <Route path="/reset-password"  element={<Reset />} />
          </Route>

          {/* ── Admin ── */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index                        element={<AdminDashboard />} />
            <Route path="content"              element={<AdminContent />} />
            <Route path="content/new"          element={<AdminContentForm />} />
            <Route path="content/:id/edit"     element={<AdminContentForm />} />
            <Route path="content/:id/episodes" element={<AdminEpisodes />} />
            <Route path="users"                element={<AdminUsers />} />
            <Route path="blog"                 element={<AdminBlog />} />
            <Route path="blog/new"             element={<AdminBlogForm />} />
            <Route path="blog/:id/edit"        element={<AdminBlogForm />} />
            <Route path="ads"                  element={<AdminAds />} />
            <Route path="reports"              element={<AdminReports />} />
            <Route path="settings"             element={<AdminSettings />} />
            <Route path="comments"             element={<AdminComments />} />
            <Route path="requests"             element={<AdminRequests />} />
            <Route path="categories"           element={<AdminCategories />} />
            <Route path="schedule"             element={<AdminSchedule />} />
            <Route path="notifications"        element={<AdminNotifications />} />
            <Route path="emails"               element={<AdminEmails />} />
            <Route path="logs"                 element={<AdminLogs />} />
            <Route path="db"                   element={<AdminDbManager />} />
          </Route>

          {/* ── Main ── */}
          <Route element={<MainLayout />}>
            <Route path="/"                        element={<Home />} />
            <Route path="/catalog"                 element={<Catalog />} />
            <Route path="/content/:slug"           element={<ContentPage />} />
            <Route path="/episode/:id"             element={<Episode />} />
            <Route path="/search"                  element={<Search />} />
            <Route path="/schedule"                element={<Schedule />} />
            <Route path="/cronograma"              element={<Schedule />} />
            <Route path="/blog"                    element={<Blog />} />
            <Route path="/blog/:slug"              element={<BlogPost />} />
            <Route path="/about"                   element={<About />} />
            <Route path="/contact"                 element={<Contact />} />
            <Route path="/request"                 element={<Request />} />
            <Route path="/terms"                   element={<Terms />} />
            <Route path="/privacy"                 element={<Privacy />} />
            <Route path="/faq"                     element={<Faq />} />
            <Route path="/dmca"                    element={<Dmca />} />
            <Route path="/docs"                    element={<ApiDocs />} />
            <Route path="/api/docs"                element={<ApiDocs />} />
            <Route path="/shared-list/:token"      element={<SharedList />} />

            {/* ── User (autenticado) ── */}
            <Route path="/user" element={<ProtectedRoute />}>
              <Route path="dashboard"     element={<UserDashboard />} />
              <Route path="favorites"     element={<UserFavorites />} />
              <Route path="history"       element={<UserHistory />} />
              <Route path="watch-later"   element={<WatchLater />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="achievements"  element={<Achievements />} />
              <Route path="profile"       element={<UserProfile />} />
              <Route path="profiles"      element={<Profiles />} />
              <Route path="follows"       element={<Follows />} />
              <Route path="reminders"     element={<Reminders />} />
              <Route path="stats"         element={<UserStats />} />
              <Route path="requests"      element={<UserRequests />} />
              <Route path="settings"      element={<UserSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
