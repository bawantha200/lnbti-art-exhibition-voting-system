import { BrowserRouter, Route, Routes } from 'react-router-dom'

import VotingPage from './pages/voting/VotingPage'
import AdminPage from './pages/admin/AdminPage'
import LiveLeaderboardPage from './pages/voting/LiveLeaderboardPage'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/leaderboard" element={<LiveLeaderboardPage />} />
        <Route path="*" element={<VotingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
