import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Homepage from './pages/Homepage';
import LeaderboardHome from './components/leaderboard/LeaderboardHome';
import OpenLeaderboard from './components/leaderboard/OpenLeaderboard';
import ClosedLeaderboard from './components/leaderboard/ClosedLeaderboard';
import Environment from './pages/Environment';

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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
