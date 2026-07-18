import { Home, PlusCircle, Clock3, Stethoscope } from 'lucide-react'

const TABS = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'quickLog', label: '기록', Icon: PlusCircle },
  { id: 'history', label: '타임라인', Icon: Clock3 },
  { id: 'medical', label: '메디컬', Icon: Stethoscope },
]

function BottomNav({ activeTab, onChange }) {
  return (
    <nav
      className="safe-bottom sticky bottom-0 z-30 border-t border-[#E8E2D9] bg-[#FDFBF7]/95 backdrop-blur-sm"
      aria-label="하단 내비게이션"
    >
      <ul className="grid grid-cols-4 px-1 pt-1 pb-1">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id

          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                className={`flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors ${
                  isActive
                    ? 'bg-[#E6F4EA] text-[#2F6B45]'
                    : 'bg-transparent text-stone-400 hover:text-stone-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={isActive ? 'text-[#2F6B45]' : 'text-current'}
                />
                <span
                  className={`text-[11px] leading-none ${
                    isActive ? 'font-semibold text-[#2F6B45]' : 'font-medium'
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
