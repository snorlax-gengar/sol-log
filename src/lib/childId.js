export function getDefaultChildId() {
  return import.meta.env.VITE_DEFAULT_CHILD_ID || null
}

export function requireChildId() {
  const childId = getDefaultChildId()
  if (!childId) {
    throw new Error(
      'VITE_DEFAULT_CHILD_ID가 없습니다. .env에 children.id를 설정해주세요.',
    )
  }
  return childId
}
