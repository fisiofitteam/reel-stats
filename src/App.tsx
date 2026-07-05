import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useReelStore } from './stores/reelStore'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Reels from './pages/Reels'
import ReelDetail from './pages/ReelDetail'
import Themes from './pages/Themes'
import Compare from './pages/Compare'
import Strategy from './pages/Strategy'

export default function App() {
  const loadReels = useReelStore(s => s.loadReels)
  const loadInsights = useReelStore(s => s.loadInsights)
  const loadStrategy = useReelStore(s => s.loadStrategy)

  useEffect(() => {
    loadReels()
    loadInsights()
    loadStrategy()
  }, [loadReels, loadInsights, loadStrategy])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/reels/:id" element={<ReelDetail />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
