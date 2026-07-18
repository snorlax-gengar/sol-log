import {
  DIAPER_STATUSES,
  FEEDING_TYPES,
  POOP_COLORS,
  POOP_TEXTURES,
} from '@/constants/careLog'

function labelOf(list, value) {
  return list.find((item) => item.value === value)?.label ?? value
}

export function feedingTypeLabel(value) {
  return labelOf(FEEDING_TYPES, value)
}

export function diaperStatusLabel(value) {
  return labelOf(DIAPER_STATUSES, value)
}

export function poopColorLabel(value) {
  return labelOf(POOP_COLORS, value)
}

export function poopTextureLabel(value) {
  return labelOf(POOP_TEXTURES, value)
}

export function formatLoggedAt(value) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function hasFeeding(log) {
  return Boolean(log.feeding_type && log.feeding_type !== 'none')
}

export function hasDiaper(log) {
  return Boolean(log.diaper_status && log.diaper_status !== 'none')
}

export function breastMinutes(log) {
  return (log.breast_left_minutes || 0) + (log.breast_right_minutes || 0)
}

export function logToForm(log) {
  return {
    loggedAt: new Date(log.logged_at),
    feedingType: log.feeding_type || 'none',
    feedingAmountMl: log.feeding_amount_ml || 0,
    breastLeftMinutes: log.breast_left_minutes || 0,
    breastRightMinutes: log.breast_right_minutes || 0,
    diaperStatus: log.diaper_status || 'none',
    diaperPoopColor: log.diaper_poop_color || null,
    diaperPoopTexture: log.diaper_poop_texture || null,
    generalNotes: log.general_notes || '',
  }
}

export function formToDbPayload(form) {
  return {
    logged_at: form.loggedAt.toISOString(),
    feeding_type: form.feedingType,
    feeding_amount_ml: form.feedingAmountMl,
    breast_left_minutes: form.breastLeftMinutes,
    breast_right_minutes: form.breastRightMinutes,
    diaper_status: form.diaperStatus,
    diaper_poop_color: form.diaperPoopColor,
    diaper_poop_texture: form.diaperPoopTexture,
    general_notes: form.generalNotes || null,
  }
}
