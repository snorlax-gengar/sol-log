import { useState } from 'react'
import { Download, KeyRound, LayoutGrid, LogOut, X } from 'lucide-react'
import Copyright from '@/components/ui/Copyright'
import { useAuth } from '@/context/AuthContext'
import { useHomeVisibility } from '@/context/HomeVisibilityContext'
import { useToast } from '@/components/ui/ToastProvider'
import { exportAllData } from '@/utils/exportData'
import { HOME_VISIBILITY_OPTIONS } from '@/utils/homeVisibility'

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-[#E8E2D9]">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] leading-snug text-stone-400">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#3D8B5A]' : 'bg-stone-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function AccountModal({ onClose }) {
  const { displayName, role, changePassword, signOut } = useAuth()
  const { visibility, setVisible, resetToDefault } = useHomeVisibility()
  const { showToast } = useToast()
  const isParent = role === 'parent'

  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwError, setPwError] = useState('')
  const [isChanging, setIsChanging] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')

    if (newPassword.length < 8) {
      setPwError('비밀번호는 8자 이상으로 설정해주세요.')
      return
    }
    if (newPassword !== confirm) {
      setPwError('두 비밀번호가 일치하지 않아요.')
      return
    }

    setIsChanging(true)
    const { error } = await changePassword(newPassword)
    setIsChanging(false)

    if (error) {
      setPwError(error)
    } else {
      setNewPassword('')
      setConfirm('')
      showToast('비밀번호가 변경되었습니다.')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    const { error, counts } = await exportAllData()
    setIsExporting(false)

    if (error) {
      showToast(`백업 실패: ${error}`, 'error')
    } else {
      showToast(
        `백업 완료 · 기록 ${counts.care} · 진료 ${counts.medical} · 일기 ${counts.diaries}`,
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="계정 설정"
        className="max-h-[90dvh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl bg-[#FDFBF7] p-5 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">
            {displayName || '계정'} 설정
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-500 hover:bg-[#E6F4EA]"
          >
            <X size={20} />
          </button>
        </div>

        {isParent && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                  <LayoutGrid size={15} className="text-[#3D8B5A]" />
                  홈 화면 표시
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetToDefault()
                    showToast('홈 표시를 기본값으로 되돌렸어요.')
                  }}
                  className="min-h-9 rounded-lg px-2 text-[11px] font-medium text-[#3D8B5A] hover:bg-[#E6F4EA]"
                >
                  기본값
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-400">
                이 기기에만 저장돼요. 끄면 홈에서 해당 블록이 숨겨져요.
              </p>
              {HOME_VISIBILITY_OPTIONS.map((option) => (
                <ToggleRow
                  key={option.key}
                  label={option.label}
                  description={option.description}
                  checked={visibility[option.key]}
                  onChange={(enabled) => setVisible(option.key, enabled)}
                />
              ))}
            </div>

            <div className="my-4 h-px bg-[#E8E2D9]" />
          </>
        )}

        {/* 비밀번호 변경 */}
        <form onSubmit={handleChangePassword} className="space-y-2.5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
            <KeyRound size={15} className="text-[#3D8B5A]" />
            비밀번호 변경
          </p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setPwError('')
            }}
            placeholder="새 비밀번호 (8자 이상)"
            autoComplete="new-password"
            className="min-h-12 w-full rounded-xl bg-white px-3.5 text-sm text-stone-800 ring-1 ring-[#E8E2D9] outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-[#3D8B5A]/40"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              setPwError('')
            }}
            placeholder="새 비밀번호 확인"
            autoComplete="new-password"
            className="min-h-12 w-full rounded-xl bg-white px-3.5 text-sm text-stone-800 ring-1 ring-[#E8E2D9] outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-[#3D8B5A]/40"
          />
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          <button
            type="submit"
            disabled={isChanging || !newPassword || !confirm}
            className="min-h-12 w-full rounded-xl bg-[#3D8B5A] text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {isChanging ? '변경 중…' : '비밀번호 변경'}
          </button>
        </form>

        <div className="my-4 h-px bg-[#E8E2D9]" />

        {/* 데이터 백업 */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-stone-700 ring-1 ring-[#E8E2D9] transition-colors hover:bg-[#E6F4EA]/60 disabled:opacity-50"
        >
          <Download size={16} className="text-[#3D8B5A]" />
          {isExporting ? '내보내는 중…' : '데이터 백업 (JSON)'}
        </button>
        <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">
          기록·진료·일기를 파일로 저장해요. 일기는 내가 쓴 것만 포함됩니다.
        </p>

        <div className="my-4 h-px bg-[#E8E2D9]" />

        <button
          type="button"
          onClick={signOut}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-red-600 ring-1 ring-red-100 transition-colors hover:bg-red-50"
        >
          <LogOut size={16} />
          로그아웃
        </button>

        <Copyright className="mt-5" />
      </div>
    </div>
  )
}

export default AccountModal
