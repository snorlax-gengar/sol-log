# Sol-Log 제품 규칙 요약

상세 DDL·화면 요구사항은 루트 `.cursorrules`를 따른다.

## UX

- 한 손 조작: 타이핑 최소화, 퀵 버튼/칩, 터치 영역 ≥ 48×48px
- 시간 보정: 방금 전 / 30분 전 / 1시간 전 / 직접 선택
- Realtime: `care_logs`, `medical_logs` 변경 시 새로고침 없이 반영

## 아키텍처

- Supabase는 `@/lib/supabaseClient.js`만 사용
- 훅: `useCareLogs`, `useMedicalLogs`
- 파스텔 톤(베이지/솔잎 그린) 유지, 과한 카드·보라 테마 지양

## 구현 상태 (2026-07 기준)

Step 1~5 기본 구현 완료. 이후 작업은 버그 수정·UX 개선·기능 확장이며, 범위 밖 대규모 리팩터는 사용자 요청 시에만 진행한다.
