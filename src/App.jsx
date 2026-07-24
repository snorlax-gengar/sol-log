import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import ErrorBoundary from '@/components/layout/ErrorBoundary'
import Logo from '@/components/ui/Logo'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ChildProvider } from '@/context/ChildContext'
import { CareLogsProvider } from '@/context/CareLogsContext'
import { MedicalLogsProvider } from '@/context/MedicalLogsContext'
import { FeedingAlarmProvider } from '@/context/FeedingAlarmContext'
import { HomeVisibilityProvider } from '@/context/HomeVisibilityContext'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import QuickLog from '@/pages/QuickLog'
import History from '@/pages/History'
import Medical from '@/pages/Medical'
import Diary from '@/pages/Diary'

const TAB_VIEWS = {
  home: Home,
  quickLog: QuickLog,
  history: History,
  medical: Medical,
  diary: Diary,
}

const PARENT_TABS = ['home', 'quickLog', 'history', 'medical', 'diary']
const CHILD_TABS = ['diary']

function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#FDFBF7]">
      <div className="animate-pulse">
        <Logo size={72} />
      </div>
    </div>
  )
}

function PendingScreen({ onSignOut }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#FDFBF7] px-8">
      <div className="text-center">
        <Logo size={64} className="mx-auto" />
        <p className="mt-4 text-sm font-semibold text-stone-800">
          아직 가족 등록이 안 된 계정이에요.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
          관리자(부모님)가 Supabase에서 역할을 지정하면 이용할 수 있어요.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-5 min-h-12 rounded-2xl bg-[#3D8B5A] px-6 text-sm font-semibold text-white"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}

function AuthedApp() {
  const { session, isLoading, role, displayName, signOut } = useAuth()
  const isChild = role === 'child'
  const [activeTab, setActiveTab] = useState('home')

  // 자녀 계정은 일기 탭으로 고정
  useEffect(() => {
    if (isChild) setActiveTab('diary')
  }, [isChild])

  if (isLoading) return <SplashScreen />
  if (!session) return <Login />
  if (role === 'pending') return <PendingScreen onSignOut={signOut} />

  const visibleTabs = isChild ? CHILD_TABS : PARENT_TABS
  const safeTab = visibleTabs.includes(activeTab) ? activeTab : visibleTabs[0]
  const ActiveView = TAB_VIEWS[safeTab]

  const shell = (
    <HomeVisibilityProvider>
      <AppShell
        activeTab={safeTab}
        onTabChange={setActiveTab}
        visibleTabs={visibleTabs}
        userLabel={displayName}
        onSignOut={signOut}
      >
        <ActiveView />
      </AppShell>
    </HomeVisibilityProvider>
  )

  // 부모 계정만 기록/알람 사용 (자녀는 기록 접근 권한 없음).
  // ChildProvider가 활성 아이를 먼저 해석한 뒤 CareLogsProvider가 그 아이로 조회한다.
  if (isChild) return shell

  return (
    <ChildProvider>
      <CareLogsProvider>
        <MedicalLogsProvider>
          <FeedingAlarmProvider>{shell}</FeedingAlarmProvider>
        </MedicalLogsProvider>
      </CareLogsProvider>
    </ChildProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AuthedApp />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
