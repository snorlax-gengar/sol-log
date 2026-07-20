-- 진료과(department) 컬럼 추가: 병원명/담당의와 별도로 "소아청소년과", "이비인후과" 등
-- 진료 부서를 기록할 수 있게 한다. 기존 컬럼은 건드리지 않는 추가(additive) 마이그레이션.

alter table public.medical_logs
  add column if not exists department varchar(50);
