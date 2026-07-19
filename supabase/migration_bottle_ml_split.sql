-- 젖병 종류별 ml 분리: 분유/유축 모유/이유식을 각각 독립적인 ml로 동시에 기록
-- (예: 유축 모유 8ml + 분유 70ml을 한 기록에 함께)
--
-- 기존 bottle_type(단일 종류) + feeding_amount_ml(단일 용량) 조합은
-- "대표 종류/총량" 용도로 계속 채워지므로 남겨둔다 (레거시 호환).

alter table public.care_logs
  add column if not exists formula_ml integer,
  add column if not exists pumped_ml integer,
  add column if not exists food_ml integer;

-- 기존 데이터 백필: bottle_type 하나에 몰려있던 값을 해당 ml 컬럼으로 복사
update public.care_logs
set formula_ml = feeding_amount_ml
where formula_ml is null
  and bottle_type = 'formula'
  and coalesce(feeding_amount_ml, 0) > 0;

update public.care_logs
set pumped_ml = feeding_amount_ml
where pumped_ml is null
  and bottle_type = 'pumped'
  and coalesce(feeding_amount_ml, 0) > 0;

update public.care_logs
set food_ml = feeding_amount_ml
where food_ml is null
  and bottle_type = 'food'
  and coalesce(feeding_amount_ml, 0) > 0;

-- bottle_type 이 비어있고(구버전 데이터) feeding_type 에만 종류가 있던 경우도 백필
update public.care_logs
set formula_ml = feeding_amount_ml
where formula_ml is null
  and bottle_type is null
  and feeding_type = 'formula'
  and coalesce(feeding_amount_ml, 0) > 0;

update public.care_logs
set pumped_ml = feeding_amount_ml
where pumped_ml is null
  and bottle_type is null
  and feeding_type = 'pumped'
  and coalesce(feeding_amount_ml, 0) > 0;

update public.care_logs
set food_ml = feeding_amount_ml
where food_ml is null
  and bottle_type is null
  and feeding_type = 'food'
  and coalesce(feeding_amount_ml, 0) > 0;
