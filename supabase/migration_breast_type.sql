-- 모유는 용량(ml)이 아니라 방식(직접수유/유축)만 구분해서 기록한다.
-- 기존 pumped_ml("유축 모유" ml)은 과거 기록 표시/집계 호환용으로 남겨두되,
-- 입력 폼에서는 더 이상 채우지 않는다 (breast_left_minutes/breast_right_minutes와 동일한 처리 방식).

alter table public.care_logs
  add column if not exists breast_type varchar(10); -- 'direct'(직수) | 'pumped'(유축)
