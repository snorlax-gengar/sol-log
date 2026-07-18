/**
 * 잊어버린 비밀번호를 관리자 권한으로 재설정하는 스크립트.
 * (인앱 "비밀번호 변경"은 로그인한 본인만 가능하므로, 로그인조차 못 하는 경우용)
 *
 * 이 스크립트는 service_role 키를 사용하므로 절대 브라우저/클라이언트에 넣지 말 것.
 * 로컬에서만 실행하세요.
 *
 * 사용법:
 *   SUPABASE_URL="https://xxxx.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
 *   node scripts/reset-password.mjs dad@sol-log.family 새비밀번호
 *
 * service_role 키는 Supabase 대시보드 > Settings > API > service_role 에서 복사.
 */
import { createClient } from '@supabase/supabase-js'

const [, , email, newPassword] = process.argv
const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('환경변수 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.')
  process.exit(1)
}
if (!email || !newPassword) {
  console.error('사용법: node scripts/reset-password.mjs <이메일> <새 비밀번호>')
  process.exit(1)
}
if (newPassword.length < 8) {
  console.error('비밀번호는 8자 이상이어야 합니다.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// 이메일로 사용자 찾기 (페이지네이션)
async function findUserByEmail(targetEmail) {
  let page = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find((u) => u.email === targetEmail)
    if (found) return found
    if (data.users.length < 200) return null
    page += 1
  }
}

const user = await findUserByEmail(email)
if (!user) {
  console.error(`계정을 찾을 수 없습니다: ${email}`)
  process.exit(1)
}

const { error } = await admin.auth.admin.updateUserById(user.id, {
  password: newPassword,
})
if (error) {
  console.error('변경 실패:', error.message)
  process.exit(1)
}

console.log(`✔ ${email} 비밀번호가 변경되었습니다. (일기/기록은 그대로 유지됩니다)`)
