import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { ToastProvider } from '@/components/ui/ToastProvider'
import Home from '@/pages/Home'
import QuickLog from '@/pages/QuickLog'
import History from '@/pages/History'
import Medical from '@/pages/Medical'

const TAB_VIEWS = {
  home: Home,
  quickLog: QuickLog,
  history: History,
  medical: Medical,
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const ActiveView = TAB_VIEWS[activeTab] ?? Home

  return (
    <ToastProvider>
      <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
        <ActiveView />
      </AppShell>
    </ToastProvider>
  )
}

export default App
