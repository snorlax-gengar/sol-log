// 활성 아이 ID. 로그인 후 DB에서 해석한 값(ChildProvider)이 우선하고,
// 없으면 빌드타임 환경변수(VITE_DEFAULT_CHILD_ID)를 폴백으로 쓴다.
let activeChildId = null

/** ChildProvider가 DB에서 아이를 불러온 뒤 1회 설정 */
export function setActiveChildId(id) {
  activeChildId = id || null
}

export function getDefaultChildId() {
  return activeChildId || import.meta.env.VITE_DEFAULT_CHILD_ID || null
}

export function requireChildId() {
  const childId = getDefaultChildId()
  if (!childId) {
    throw new Error(
      '활성 아이 정보가 없습니다. children 테이블에 아이가 등록되어 있는지 확인해주세요.',
    )
  }
  return childId
}
