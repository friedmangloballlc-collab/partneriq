import React, { Suspense } from "react";
import { SkeletonDashboard } from "./components/ui/skeleton";
import * as Sentry from "@sentry/react";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
const Login = React.lazy(() => import('@/pages/Login'));
const Onboarding = React.lazy(() => import('@/pages/Onboarding'));
const Terms = React.lazy(() => import('@/pages/Terms'));
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const CreatorCalculator = React.lazy(() => import('@/pages/CreatorCalculator'));
const Pricing = React.lazy(() => import('@/pages/Pricing'));
const About = React.lazy(() => import('@/pages/About'));
const Blog = React.lazy(() => import('@/pages/Blog'));
const Careers = React.lazy(() => import('@/pages/Careers'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const CookiePolicy = React.lazy(() => import('@/pages/CookiePolicy'));
const GDPR = React.lazy(() => import('@/pages/GDPR'));
const Demo = React.lazy(() => import('@/pages/Demo'));
import AuthCallback from '@/pages/AuthCallback';
import ResetPassword from '@/pages/ResetPassword';
import { useAutoSeed } from '@/hooks/useAutoSeed';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { canAccessPage } from '@/lib/routePermissions';

const CheckEmail = React.lazy(() => import("./pages/CheckEmail"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const FeatureTalentDiscovery = React.lazy(() => import("./pages/FeatureTalentDiscovery"));
const FeatureDealPipeline = React.lazy(() => import("./pages/FeatureDealPipeline"));
const FeatureMediaKits = React.lazy(() => import("./pages/FeatureMediaKits"));
const FeaturePayments = React.lazy(() => import("./pages/FeaturePayments"));
const FeatureIntegrations = React.lazy(() => import("./pages/FeatureIntegrations"));
const FeatureCampaignAnalytics = React.lazy(() => import("./pages/FeatureCampaignAnalytics"));
const FeatureSendDeals = React.lazy(() => import("./pages/FeatureSendDeals"));
const FeatureManageDeals = React.lazy(() => import("./pages/FeatureManageDeals"));
const FeatureBrowseTalent = React.lazy(() => import("./pages/FeatureBrowseTalent"));
const FeatureManageTalent = React.lazy(() => import("./pages/FeatureManageTalent"));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    Sentry.captureException(error, { extra: { componentStack: info?.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-4 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route guard component — redirects if user's role can't access the page
const RoleGuard = ({ pageName, children }) => {
  const { user } = useAuth();
  if (!canAccessPage(user?.role, pageName)) {
    return <Navigate to="/Dashboard" replace />;
  }
  return children;
};

// Separate component for authenticated content so useAutoSeed is never called conditionally
const AuthenticatedRoutes = ({ authError }) => {
  // Hook is always called when this component mounts (only rendered for authenticated users)
  const { seeding, seeded, error: seedError } = useAutoSeed();
  // Subscribe to Supabase Realtime and keep React Query caches live
  useRealtimeSync();

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Show a loading screen while demo data is being seeded so that
  // pages don't render with empty query caches.
  if (seeding && !seeded) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-4">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">Setting up your workspace...</p>
      </div>
    );
  }

  const pageFallback = (
    <div className="p-6"><SkeletonDashboard /></div>
  );

  const pageErrorFallback = ({ error, resetError }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <span className="text-2xl" role="img" aria-label="Warning">⚠️</span>
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong on this page</h2>
      <p className="text-sm text-slate-500 mb-5 max-w-sm">
        {error?.message || "An unexpected error occurred. You can try reloading the page."}
      </p>
      <button
        onClick={() => { resetError(); window.location.reload(); }}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Reload page
      </button>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <RoleGuard pageName={path}>
              <LayoutWrapper currentPageName={path}>
                <Sentry.ErrorBoundary fallback={pageErrorFallback}>
                  <Suspense fallback={pageFallback}>
                    <Page />
                  </Suspense>
                </Sentry.ErrorBoundary>
              </LayoutWrapper>
            </RoleGuard>
          }
        />
      ))}
      <Route path="*" element={<Suspense fallback={<div />}><NotFound /></Suspense>} />
    </Routes>
  );
};

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const marketingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  // Public routes: legal pages and tools (no auth needed)
  if (location.pathname === '/terms') {
    return <Routes><Route path="/terms" element={<Suspense fallback={marketingFallback}><Terms /></Suspense>} /></Routes>;
  }
  if (location.pathname === '/privacy') {
    return <Routes><Route path="/privacy" element={<Suspense fallback={marketingFallback}><Privacy /></Suspense>} /></Routes>;
  }
  if (location.pathname === '/calculator') {
    return <Routes><Route path="/calculator" element={<Suspense fallback={marketingFallback}><CreatorCalculator /></Suspense>} /></Routes>;
  }
  if (location.pathname === '/Pricing' || location.pathname === '/pricing') {
    return <Routes><Route path={location.pathname} element={<Suspense fallback={marketingFallback}><Pricing /></Suspense>} /></Routes>;
  }
  if (location.pathname === '/FAQ' || location.pathname === '/faq') {
    const FAQ = React.lazy(() => import('@/pages/FAQ'));
    return <Routes><Route path={location.pathname} element={<Suspense fallback={marketingFallback}><FAQ /></Suspense>} /></Routes>;
  }
  // Public marketing routes (no auth needed)
  const publicMarketingRoutes = {
    '/About': <Suspense fallback={marketingFallback}><About /></Suspense>,
    '/Blog': <Suspense fallback={marketingFallback}><Blog /></Suspense>,
    '/Careers': <Suspense fallback={marketingFallback}><Careers /></Suspense>,
    '/Contact': <Suspense fallback={marketingFallback}><Contact /></Suspense>,
    '/Customers': <Suspense fallback={marketingFallback}><Customers /></Suspense>,
    '/CookiePolicy': <Suspense fallback={marketingFallback}><CookiePolicy /></Suspense>,
    '/GDPR': <Suspense fallback={marketingFallback}><GDPR /></Suspense>,
    '/Demo': <Suspense fallback={marketingFallback}><Demo /></Suspense>,
    '/features/talent-discovery': <Suspense fallback={marketingFallback}><FeatureTalentDiscovery /></Suspense>,
    '/features/deal-pipeline': <Suspense fallback={marketingFallback}><FeatureDealPipeline /></Suspense>,
    '/features/media-kits': <Suspense fallback={marketingFallback}><FeatureMediaKits /></Suspense>,
    '/features/payments': <Suspense fallback={marketingFallback}><FeaturePayments /></Suspense>,
    '/features/integrations': <Suspense fallback={marketingFallback}><FeatureIntegrations /></Suspense>,
    '/features/campaign-analytics': <Suspense fallback={marketingFallback}><FeatureCampaignAnalytics /></Suspense>,
    '/features/send-deals': <Suspense fallback={marketingFallback}><FeatureSendDeals /></Suspense>,
    '/features/manage-deals': <Suspense fallback={marketingFallback}><FeatureManageDeals /></Suspense>,
    '/features/browse-talent': <Suspense fallback={marketingFallback}><FeatureBrowseTalent /></Suspense>,
    '/features/manage-talent': <Suspense fallback={marketingFallback}><FeatureManageTalent /></Suspense>,
  };
  if (Object.prototype.hasOwnProperty.call(publicMarketingRoutes, location.pathname)) {
    const element = publicMarketingRoutes[location.pathname];
    return <Routes><Route path={location.pathname} element={element} /></Routes>;
  }

  // Public routes: onboarding (landing) and login
  if (location.pathname === '/login') {
    if (isAuthenticated) return <Navigate to="/Dashboard" replace />;
    return <Routes><Route path="/login" element={<Suspense fallback={marketingFallback}><Login /></Suspense>} /></Routes>;
  }

  if (location.pathname === '/check-email') {
    return (
      <Routes>
        <Route path="/check-email" element={<Suspense fallback={<div />}><CheckEmail /></Suspense>} />
      </Routes>
    );
  }

  if (location.pathname === '/auth/callback') {
    return <Routes><Route path="/auth/callback" element={<AuthCallback />} /></Routes>;
  }

  if (location.pathname === '/reset-password') {
    return <Routes><Route path="/reset-password" element={<ResetPassword />} /></Routes>;
  }

  if (location.pathname === '/' || location.pathname === '/Onboarding') {
    if (isAuthenticated) return <Navigate to="/Dashboard" replace />;
    return <Routes>
      <Route path="/" element={<Suspense fallback={marketingFallback}><Onboarding /></Suspense>} />
      <Route path="/Onboarding" element={<Suspense fallback={marketingFallback}><Onboarding /></Suspense>} />
    </Routes>;
  }

  // Unknown public URL → show branded 404
  if (!isAuthenticated) {
    // Known entry points redirect to landing; everything else is a 404
    const knownEntryPaths = ['/Dashboard', '/Settings', '/Notifications'];
    const isKnownAppRoute = knownEntryPaths.some(p => location.pathname.startsWith(p)) ||
      Object.keys(Pages).some(p => `/${p}` === location.pathname);
    if (isKnownAppRoute) {
      return <Navigate to="/login" replace />;
    }
    return <Routes><Route path="*" element={<Suspense fallback={<div />}><NotFound /></Suspense>} /></Routes>;
  }

  return <AuthenticatedRoutes authError={authError} />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
