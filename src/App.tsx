import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Homepage from './pages/Homepage';
import LeaderboardHome from './pages/LeaderboardHome';

import Gallery from './pages/Gallery';
import EnvironmentWrapper from './pages/EnvironmentWrapper';

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
          path="/gallery"
          element={
            <Layout>
              <Gallery />
            </Layout>
          }
        />
        <Route path="/launcher/:envId" element={<EnvironmentWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;
