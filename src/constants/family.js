// 로그인 화면 프로필 카드. 이메일은 내부 식별용이며 화면에 노출되지 않는다.
// 실제 Supabase 계정 이메일과 다르면 .env.local의 VITE_ACCOUNT_*_EMAIL로 맞춰주세요.
export const FAMILY_PROFILES = [
  {
    key: 'mom',
    label: '엄마',
    emoji: '👩',
    email: import.meta.env.VITE_ACCOUNT_MOM_EMAIL || 'mom@sol-log.family',
  },
  {
    key: 'dad',
    label: '아빠',
    emoji: '👨',
    email: import.meta.env.VITE_ACCOUNT_DAD_EMAIL || 'dad@sol-log.family',
  },
  {
    key: 'child',
    label: '노이솔',
    emoji: '👶',
    email: import.meta.env.VITE_ACCOUNT_CHILD_EMAIL || 'child@sol-log.family',
  },
]
