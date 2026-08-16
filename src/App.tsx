import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DemoBrilliantPage } from '@/pages/DemoBrilliantPage'
import { InteractiveHubPage } from '@/interactive/InteractiveHubPage'
import { InteractiveLessonPage } from '@/interactive/InteractiveLessonPage'
import { PracticePage } from '@/interactive/PracticePage'
import { loadProgress, ProgressState } from '@/engine/progress'
import { HomePage } from '@/pages/HomePage'
import { MapPage } from '@/pages/MapPage'
import { LevelPage } from '@/pages/LevelPage'
import { ReviewPage } from '@/pages/ReviewPage'
import { CertPage } from '@/pages/CertPage'
import { ReferencePage } from '@/pages/ReferencePage'

export default function App() {
  const [progress, setProgress] = useState<ProgressState>(loadProgress)

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/"        element={<HomePage progress={progress} />} />
        <Route path="/map"     element={<MapPage progress={progress} onProgressChange={setProgress} />} />
        <Route path="/level/:levelId" element={
          <LevelPage onProgressChange={setProgress} />
        } />
        <Route path="/review" element={<ReviewPage onProgressChange={setProgress} />} />
        <Route path="/cert"   element={<CertPage />} />
        <Route path="/reference" element={<ReferencePage />} />
        <Route path="/demo" element={<DemoBrilliantPage />} />  {/* hidden: Brilliant-style experiment */}
        <Route path="/interactive" element={<InteractiveHubPage />} />
        <Route path="/interactive/practice" element={<PracticePage />} />
        <Route path="/interactive/:slug" element={<InteractiveLessonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
