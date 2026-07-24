-- 투약 추적이 필요한 진료만 카드에 '투약 체크'를 표시하기 위한 플래그
ALTER TABLE medical_logs
  ADD COLUMN IF NOT EXISTS medicine_required BOOLEAN DEFAULT false;

-- 이미 투약 완료로 표시된 기록은 투약 대상으로 간주
UPDATE medical_logs
SET medicine_required = true
WHERE medicine_checked = true
  AND COALESCE(medicine_required, false) = false;
