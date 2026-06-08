import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/common/Layout';
import { useI18n } from './i18n/useI18n';

// Lazy load route components for code splitting
const Homepage = lazy(() => import('./pages/Homepage'));
const LeaderboardHome = lazy(() => import('./pages/LeaderboardHome'));
const Environments = lazy(() => import('./pages/Environments'));
const EnvironmentWrapper = lazy(() => import('./pages/EnvironmentWrapper'));

// Loading fallback component
const PageLoader = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          {t('app.loading')}
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Homepage />
              </Layout>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Layout>
                <LeaderboardHome />
              </Layout>
            }
          />

          <Route
            path="/environments"
            element={
              <Layout>
                <Environments />
              </Layout>
            }
          />
          <Route path="/launcher/:envId" element={<EnvironmentWrapper />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
