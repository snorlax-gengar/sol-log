-- ============================================================
-- 모유 + 젖병(분유/유축/이유식) 동시 기록 지원
-- Supabase Dashboard > SQL Editor에서 1회 실행
-- ============================================================
--
-- 설계: 한 care_logs 행이 '모유'와 '젖병'을 동시에 가질 수 있다.
--   - 모유: breast_left_minutes / breast_right_minutes (기존 컬럼)
--   - 젖병: feeding_amount_ml (기존) + bottle_type (신규, 분유/유축/이유식)
--   - feeding_type(기존)은 하위호환용 '대표 종류'로 계속 유지
--     (모유가 있으면 'breast', 없으면 젖병 종류)
--
-- bottle_type을 추가하면 legacy 데이터도 그대로 유효:
--   기존 formula 행 -> bottle_type NULL이지만 feeding_type='formula'로 해석 가능

alter table public.care_logs
  add column if not exists bottle_type varchar(20); -- 'formula' | 'pumped' | 'food' | NULL

-- (선택) 기존 젖병 기록의 bottle_type을 feeding_type 기준으로 백필해두면
-- 표시/집계가 더 명확해집니다. 안 해도 앱은 정상 동작합니다.
update public.care_logs
set bottle_type = feeding_type
where bottle_type is null
  and feeding_type in ('formula', 'pumped', 'food')
  and coalesce(feeding_amount_ml, 0) > 0;
