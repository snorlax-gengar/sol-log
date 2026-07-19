import { useState } from 'react'
import { LogIn } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import BrandEasterEgg from '@/components/ui/BrandEasterEgg'
import Copyright from '@/components/ui/Copyright'
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand'
import { FAMILY_PROFILES } from '@/constants/family'
import { useAuth } from '@/context/AuthContext'

function Login() {
  const { signIn } = useAuth()
  const [selected, setSelected] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelect = (profile) => {
    setSelected(profile)
    setPassword('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selected || !password) return

    setIsSubmitting(true)
    setError('')
    const { error: signInError } = await signIn(selected.email, password)
    setIsSubmitting(false)

    if (signInError) setError(signInError)
  }

  return (
    <div className="flex min-h-dvh justify-center bg-[#EFE9DF]">
      <div className="flex min-h-dvh w-full max-w-[390px] flex-col justify-center bg-[#FDFBF7] px-6 py-10">
        <div className="flex flex-col items-center">
          <BrandEasterEgg>
            <Logo size={88} />
          </BrandEasterEgg>
          <p className="mt-4 text-xs font-medium tracking-wide text-[#3D8B5A]">
            {BRAND_NAME}
          </p>
          <h1 className="mt-1 text-xl font-bold text-stone-800">{BRAND_TAGLINE}</h1>
          <p className="mt-2 text-sm text-stone-500">누구세요?</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {FAMILY_PROFILES.map((profile) => (
            <button
              key={profile.key}
              type="button"
              onClick={() => handleSelect(profile)}
              className={`flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl transition-colors ${
                selected?.key === profile.key
                  ? 'bg-[#3D8B5A] text-white shadow-md'
                  : 'bg-white text-stone-700 ring-1 ring-[#E8E2D9] hover:bg-[#E6F4EA]/60'
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {profile.emoji}
              </span>
              <span className="text-sm font-semibold">{profile.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-500">
                {selected.label}의 비밀번호
              </span>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="비밀번호"
                className="min-h-13 w-full rounded-2xl bg-white px-4 text-base text-stone-800 ring-1 ring-[#E8E2D9] outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-[#3D8B5A]/40"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password}
              className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#3D8B5A] text-base font-semibold text-white shadow-sm transition-opacity disabled:opacity-50"
            >
              <LogIn size={18} />
              {isSubmitting ? '들어가는 중…' : '들어가기'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-[11px] leading-relaxed text-stone-400">
          가족 전용 공간이에요. 계정은 Supabase 대시보드에서 관리합니다.
        </p>
        <Copyright className="mt-3" />
      </div>
    </div>
  )
}

export default Login
