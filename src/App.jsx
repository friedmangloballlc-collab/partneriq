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
import Login from '@/pages/Login';
import Onboarding from '@/pages/Onboarding';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import CreatorCalculator from '@/pages/CreatorCalculator';
import About from '@/pages/About';
import Blog from '@/pages/Blog';
import Careers from '@/pages/Careers';
import Contact from '@/pages/Contact';
import Customers from '@/pages/Customers';
import CookiePolicy from '@/pages/CookiePolicy';
import GDPR from '@/pages/GDPR';
import Demo from '@/pages/Demo';
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
                <Suspense fallback={pageFallback}>
                  <Page />
                </Suspense>
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

  // Public routes: legal pages and tools (no auth needed)
  if (location.pathname === '/terms') {
    return <Routes><Route path="/terms" element={<Terms />} /></Routes>;
  }
  if (location.pathname === '/privacy') {
    return <Routes><Route path="/privacy" element={<Privacy />} /></Routes>;
  }
  if (location.pathname === '/calculator') {
    return <Routes><Route path="/calculator" element={<CreatorCalculator />} /></Routes>;
  }
  // Public marketing routes (no auth needed)
  const publicMarketingRoutes = {
    '/About': <About />,
    '/Blog': <Blog />,
    '/Careers': <Careers />,
    '/Contact': <Contact />,
    '/Customers': <Customers />,
    '/CookiePolicy': <CookiePolicy />,
    '/GDPR': <GDPR />,
    '/Demo': <Demo />,
    '/features/talent-discovery': <Suspense fallback={<div>Loading...</div>}><FeatureTalentDiscovery /></Suspense>,
    '/features/deal-pipeline': <Suspense fallback={<div>Loading...</div>}><FeatureDealPipeline /></Suspense>,
    '/features/media-kits': <Suspense fallback={<div>Loading...</div>}><FeatureMediaKits /></Suspense>,
    '/features/payments': <Suspense fallback={<div>Loading...</div>}><FeaturePayments /></Suspense>,
    '/features/integrations': <Suspense fallback={<div>Loading...</div>}><FeatureIntegrations /></Suspense>,
    '/features/campaign-analytics': <Suspense fallback={<div>Loading...</div>}><FeatureCampaignAnalytics /></Suspense>,
    '/features/send-deals': <Suspense fallback={<div>Loading...</div>}><FeatureSendDeals /></Suspense>,
    '/features/manage-deals': <Suspense fallback={<div>Loading...</div>}><FeatureManageDeals /></Suspense>,
    '/features/browse-talent': <Suspense fallback={<div>Loading...</div>}><FeatureBrowseTalent /></Suspense>,
    '/features/manage-talent': <Suspense fallback={<div>Loading...</div>}><FeatureManageTalent /></Suspense>,
  };
  if (Object.prototype.hasOwnProperty.call(publicMarketingRoutes, location.pathname)) {
    const element = publicMarketingRoutes[location.pathname];
    return <Routes><Route path={location.pathname} element={element} /></Routes>;
  }

  // Public routes: onboarding (landing) and login
  if (location.pathname === '/login') {
    if (isAuthenticated) return <Navigate to="/Dashboard" replace />;
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  if (location.pathname === '/check-email') {
    return (
      <Routes>
        <Route path="/check-email" element={<Suspense fallback={<div />}><CheckEmail /></Suspense>} />
      </Routes>
    );
  }

  if (location.pathname === '/' || location.pathname === '/Onboarding') {
    if (isAuthenticated) return <Navigate to="/Dashboard" replace />;
    return <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/Onboarding" element={<Onboarding />} />
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
