import { useEffect, useRef } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import Logo from '@/components/ui/Logo'

function AppShell({ activeTab, onTabChange, children }) {
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
            <div>
              <p className="text-xs font-medium tracking-wide text-[#3D8B5A]">
                SOL-LOG
              </p>
              <h1 className="mt-0.5 text-lg font-semibold text-stone-800">
                노이솔의 하루
              </h1>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </main>

        <BottomNav activeTab={activeTab} onChange={onTabChange} />
      </div>
    </div>
  )
}

export default AppShell
