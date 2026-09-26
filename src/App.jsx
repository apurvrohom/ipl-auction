import './App.css'
import { Route, Routes } from 'react-router-dom';
import AudienceView from './pages/AudienceView';
import ControlDashboard from './pages/ControlDashboard';
import TeamsWithCompactDesign from './pages/FinalSquad';
import BudgetGraph from './pages/BudgetGraph';

// The broadcast screen (/) and the control board are the main two routes.
// Everything the crowd sees there (bidding, squads, break, chart) is
// switched remotely from /control's Live tab (cycle mode rotates through
// them). /team-overview and /graph expose those same squads/chart
// components directly, for standalone viewing outside the cycle.
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AudienceView />} />
        <Route path="/control" element={<ControlDashboard />} />
        <Route path="/team-overview" element={<TeamsWithCompactDesign />} />
        <Route path="/graph" element={<BudgetGraph />} />
      </Routes>

    </>
  )
}

export default App
