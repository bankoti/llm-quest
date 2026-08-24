import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { loadProgress, ProgressState } from '@/engine/progress'

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const MapPage = lazy(() => import('@/pages/MapPage').then(m => ({ default: m.MapPage })))
const LevelPage = lazy(() => import('@/pages/LevelPage').then(m => ({ default: m.LevelPage })))
const ReviewPage = lazy(() => import('@/pages/ReviewPage').then(m => ({ default: m.ReviewPage })))
const CertPage = lazy(() => import('@/pages/CertPage').then(m => ({ default: m.CertPage })))
const ReferencePage = lazy(() => import('@/pages/ReferencePage').then(m => ({ default: m.ReferencePage })))
const InteractiveHubPage = lazy(() => import('@/interactive/InteractiveHubPage').then(m => ({ default: m.InteractiveHubPage })))
const InteractiveLessonPage = lazy(() => import('@/interactive/InteractiveLessonPage').then(m => ({ default: m.InteractiveLessonPage })))
const PracticePage = lazy(() => import('@/interactive/PracticePage').then(m => ({ default: m.PracticePage })))
const DailyMixPage = lazy(() => import('@/interactive/DailyMixPage').then(m => ({ default: m.DailyMixPage })))
const WarmupPage = lazy(() => import('@/interactive/WarmupPage').then(m => ({ default: m.WarmupPage })))
const DemoBrilliantPage = lazy(() => import('@/pages/DemoBrilliantPage').then(m => ({ default: m.DemoBrilliantPage })))

function PageLoading() {
  return <div className="min-h-screen bg-gray-950 text-gray-500 grid place-items-center font-mono text-sm" role="status">Loading…</div>
}

export default function App() {
  const [progress, setProgress] = useState<ProgressState>(loadProgress)
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <main id="main-content" tabIndex={-1}>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<HomePage progress={progress} />} />
              <Route path="/map" element={<MapPage progress={progress} onProgressChange={setProgress} />} />
              <Route path="/level/:levelId" element={<LevelPage onProgressChange={setProgress} />} />
              <Route path="/warmup/:levelId" element={<WarmupPage />} />
              <Route path="/review" element={<ReviewPage onProgressChange={setProgress} />} />
              <Route path="/cert" element={<CertPage />} />
              <Route path="/reference" element={<ReferencePage />} />
              <Route path="/demo" element={<DemoBrilliantPage />} />
              <Route path="/interactive" element={<InteractiveHubPage />} />
              <Route path="/interactive/practice" element={<PracticePage />} />
              <Route path="/interactive/mix" element={<DailyMixPage />} />
              <Route path="/interactive/:slug" element={<InteractiveLessonPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
    </MotionConfig>
  )
}
