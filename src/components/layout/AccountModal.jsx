import { useState } from 'react'
import { Download, KeyRound, LogOut, X } from 'lucide-react'
import Copyright from '@/components/ui/Copyright'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/ToastProvider'
import { exportAllData } from '@/utils/exportData'

function AccountModal({ onClose }) {
  const { displayName, changePassword, signOut } = useAuth()
  const { showToast } = useToast()

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
        className="w-full max-w-[390px] rounded-t-3xl bg-[#FDFBF7] p-5 shadow-xl sm:rounded-3xl"
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
