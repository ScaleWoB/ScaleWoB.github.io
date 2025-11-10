import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Homepage from './pages/Homepage';
import LeaderboardHome from './pages/LeaderboardHome';
import OpenLeaderboard from './pages/OpenLeaderboard';
import ClosedLeaderboard from './pages/ClosedLeaderboard';
import Environment from './pages/Environment';
import Gallery from './pages/Gallery';
import EnvironmentLauncher from './pages/EnvironmentLauncher';
import EnvironmentPlaceholder from './pages/EnvironmentPlaceholder';

function App() {
  return (
    <Router>
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
          path="/leaderboard/open"
          element={
            <Layout>
              <OpenLeaderboard />
            </Layout>
          }
        />
        <Route
          path="/leaderboard/closed"
          element={
            <Layout>
              <ClosedLeaderboard />
            </Layout>
          }
        />
        <Route
          path="/environment"
          element={
            <Layout>
              <Environment />
            </Layout>
          }
        />
        <Route
          path="/gallery"
          element={
            <Layout>
              <Gallery />
            </Layout>
          }
        />
        <Route path="/launcher/env-006" element={<EnvironmentLauncher />} />
        <Route
          path="/launcher/:envId"
          element={
            <Layout>
              <EnvironmentPlaceholder />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
