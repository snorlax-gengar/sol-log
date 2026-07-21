import {
  AMOUNT_FEEDING_TYPES,
  BOTTLE_ML_TYPES,
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

export function diaperStatusEmoji(value) {
  return DIAPER_STATUSES.find((item) => item.value === value)?.emoji ?? null
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

export function breastMinutes(log) {
  return (log.breast_left_minutes || 0) + (log.breast_right_minutes || 0)
}

/** 젖병 종류 해석 (신규 bottle_type 우선, legacy는 feeding_type로 폴백) — 구버전 단일값 데이터용 */
export function bottleTypeOf(log) {
  if ((log.feeding_amount_ml || 0) <= 0) return null
  if (log.bottle_type) return log.bottle_type
  if (AMOUNT_FEEDING_TYPES.has(log.feeding_type)) return log.feeding_type
  return null
}

/**
 * 분유/유축 모유/이유식 ml을 각각 읽는다.
 * 신규 컬럼(formula_ml 등)이 비어있으면 구버전 단일값(bottle_type + feeding_amount_ml)에서 폴백.
 */
export function bottleAmounts(log) {
  const amounts = {
    formula: log.formula_ml || 0,
    pumped: log.pumped_ml || 0,
    food: log.food_ml || 0,
  }
  if (amounts.formula > 0 || amounts.pumped > 0 || amounts.food > 0) {
    return amounts
  }
  const legacyType = bottleTypeOf(log)
  const legacyMl = log.feeding_amount_ml || 0
  if (legacyType && legacyMl > 0 && legacyType in amounts) {
    return { ...amounts, [legacyType]: legacyMl }
  }
  return amounts
}

/**
 * 한 기록의 수유 구성 요소를 분해.
 * { breast: {type} | {minutes} | null, bottles: [{type, ml}, ...] | null }
 * breast_type(직수/유축)이 있으면 그것을 우선하고,
 * 없으면 레거시 분단위 기록(breast_left/right_minutes)으로 폴백한다.
 */
export function feedingParts(log) {
  const amounts = bottleAmounts(log)
  const bottles = BOTTLE_ML_TYPES.map((item) => ({
    type: item.value,
    ml: amounts[item.value] || 0,
  })).filter((b) => b.ml > 0)

  let breast = null
  if (log.breast_type) {
    breast = { type: log.breast_type }
  } else {
    const min = breastMinutes(log)
    if (min > 0) breast = { minutes: min }
  }

  return {
    breast,
    bottles: bottles.length > 0 ? bottles : null,
  }
}

export function hasFeeding(log) {
  const { breast, bottles } = feedingParts(log)
  return Boolean(breast || bottles)
}

export function hasDiaper(log) {
  return Boolean(log.diaper_status && log.diaper_status !== 'none')
}

export function logToForm(log) {
  const amounts = bottleAmounts(log)
  return {
    loggedAt: new Date(log.logged_at),
    breastLeftMinutes: log.breast_left_minutes || 0,
    breastRightMinutes: log.breast_right_minutes || 0,
    breastType: log.breast_type || null,
    formulaMl: amounts.formula || 0,
    pumpedMl: amounts.pumped || 0,
    foodMl: amounts.food || 0,
    diaperStatus: log.diaper_status || 'none',
    diaperPoopColor: log.diaper_poop_color || null,
    diaperPoopTexture: log.diaper_poop_texture || null,
    generalNotes: log.general_notes || '',
  }
}

export function formToDbPayload(form) {
  // 레거시 분단위 직접수유 기록 (입력 UI는 없지만, 기존 값은 그대로 보존해서 되돌려 씀)
  const hasLegacyBreastMinutes =
    (form.breastLeftMinutes || 0) + (form.breastRightMinutes || 0) > 0
  // 모유는 이제 breastType(직수/유축)으로만 기록한다 (용량 없음)
  const hasBreast = Boolean(form.breastType) || hasLegacyBreastMinutes

  const formulaMl = form.formulaMl || 0
  // pumped_ml: 입력 UI는 없지만, 과거 유축 모유 ml 기록은 그대로 보존해서 되돌려 씀
  const pumpedMl = form.pumpedMl || 0
  const foodMl = form.foodMl || 0
  const totalBottleMl = formulaMl + pumpedMl + foodMl
  const hasBottle = totalBottleMl > 0

  // bottle_type/feeding_type(대표 종류, 레거시 호환용): ml이 가장 큰 젖병 종류를 대표로 삼는다.
  const dominantBottleType = hasBottle
    ? [
        ['formula', formulaMl],
        ['pumped', pumpedMl],
        ['food', foodMl],
      ].sort((a, b) => b[1] - a[1])[0][0]
    : null
  const feedingType = hasBreast ? 'breast' : hasBottle ? dominantBottleType : 'none'

  return {
    logged_at: form.loggedAt.toISOString(),
    feeding_type: feedingType,
    bottle_type: hasBottle ? dominantBottleType : null,
    feeding_amount_ml: totalBottleMl,
    formula_ml: formulaMl,
    pumped_ml: pumpedMl,
    food_ml: foodMl,
    breast_type: form.breastType || null,
    breast_left_minutes: hasLegacyBreastMinutes ? form.breastLeftMinutes : 0,
    breast_right_minutes: hasLegacyBreastMinutes ? form.breastRightMinutes : 0,
    diaper_status: form.diaperStatus,
    diaper_poop_color: form.diaperPoopColor,
    diaper_poop_texture: form.diaperPoopTexture,
    general_notes: form.generalNotes || null,
  }
}
