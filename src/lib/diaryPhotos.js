import { supabase } from '@/lib/supabaseClient'

export const DIARY_BUCKET = 'diary-photos'
// 서명 URL 수명: 앱을 오래 열어둬도 사진이 깨지지 않도록 넉넉히 8시간
export const SIGNED_URL_TTL_SEC = 8 * 3600

/** 여러 경로를 한 번에 서명 -> { path: url } 맵 */
export async function signPhotoPaths(paths) {
  if (!paths || paths.length === 0) return new Map()
  const { data } = await supabase.storage
    .from(DIARY_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SEC)

  const map = new Map()
  ;(data || []).forEach((item) => {
    if (item.signedUrl) map.set(item.path, item.signedUrl)
  })
  return map
}

/** 단일 경로 재서명 (이미지 로드 실패 시 폴백용) */
export async function resignPhotoPath(path) {
  const { data } = await supabase.storage
    .from(DIARY_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SEC)
  return data?.signedUrl || null
}
