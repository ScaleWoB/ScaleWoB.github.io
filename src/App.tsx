import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Homepage from './pages/Homepage';
import LeaderboardHome from './pages/LeaderboardHome';
import OpenLeaderboard from './pages/OpenLeaderboard';
import ClosedLeaderboard from './pages/ClosedLeaderboard';
import Environment from './pages/Environment';
import Gallery from './pages/Gallery';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/leaderboard" element={<LeaderboardHome />} />
          <Route path="/leaderboard/open" element={<OpenLeaderboard />} />
          <Route path="/leaderboard/closed" element={<ClosedLeaderboard />} />
          <Route path="/environment" element={<Environment />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
