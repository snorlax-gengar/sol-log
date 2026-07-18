import { useEffect, useRef } from 'react'
import { LogOut } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'
import Logo from '@/components/ui/Logo'

function AppShell({
  activeTab,
  onTabChange,
  visibleTabs,
  userLabel,
  onSignOut,
  children,
}) {
  const mainRef = useRef(null)

  // 탭 전환 시 스크롤 최상단으로
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeTab])

  return (
    <div className="flex min-h-dvh justify-center bg-[#EFE9DF]">
      <div className="flex min-h-dvh w-full max-w-[390px] flex-col bg-[#FDFBF7] shadow-[0_0_40px_rgba(120,100,80,0.08)]">
        <header className="safe-top border-b border-[#E8E2D9] px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo size={40} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-[#3D8B5A]">
                SOL-LOG
              </p>
              <h1 className="mt-0.5 text-lg font-semibold text-stone-800">
                노이솔의 하루
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {userLabel && (
                <span className="rounded-lg bg-[#E6F4EA] px-2 py-1 text-xs font-semibold text-[#2F6B45]">
                  {userLabel}
                </span>
              )}
              {onSignOut && (
                <button
                  type="button"
                  aria-label="로그아웃"
                  onClick={onSignOut}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-[#E6F4EA] hover:text-[#2F6B45]"
                >
                  <LogOut size={17} />
                </button>
              )}
            </div>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </main>

        <BottomNav
          activeTab={activeTab}
          onChange={onTabChange}
          visibleTabs={visibleTabs}
        />
      </div>
    </div>
  )
}

export default AppShell
