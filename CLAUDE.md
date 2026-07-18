# Sol-Log (솔로그)

우리 아이 '노이솔'을 위한 원터치 실시간 육아 로그 앱.  
모바일 전용(iPhone 390×844 기준) React 웹앱.

## 반드시 따를 규칙

- 제품/UX/DB/단계별 요구사항의 **단일 소스 오브 트루스**는 `.cursorrules`다. 구현·수정 전에 해당 파일을 확인한다.
- 추가 규칙: `.claude/rules/` 아래 파일을 함께 따른다.

## 기술 스택

- React 19 + Vite 8 (JavaScript)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React, Recharts
- Supabase (`@/lib/supabaseClient.js` 싱글톤)

## 로컬 실행

- **Node 22 필수** (`.nvmrc`). 셸이 18이어도 `npm run *`은 `scripts/with-nvm.sh`로 22를 쓴다.
- 환경변수: `.env.local` (템플릿은 `.env.example`)
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_DEFAULT_CHILD_ID`

```bash
nvm use          # 또는 npm 스크립트만 사용
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## 코드 구조

```
src/
  lib/           # supabaseClient, childId
  hooks/         # useCareLogs, useMedicalLogs
  pages/         # Home, QuickLog, History, Medical
  components/    # layout, quickLog, history, home, medical, ui
  constants/     # careLog 옵션
  utils/         # 포맷/통계/날짜
```

- 경로 별칭: `@/` → `src/`
- UI는 props 기반 Pure Component, 비즈니스 로직은 페이지/훅에 둔다.
- 컬러: 웜 베이지 `#FDFBF7`, 소프트 그린 `#E6F4EA`, 포인트 `#3D8B5A`

## 화면 (하단 4탭)

1. Home — 오늘 요약, 수유 경과 타이머, 7일 패턴/몸무게 차트  
2. Quick Log — 수유+기저귀 통합 폼, 시간 보정, `care_logs` insert  
3. History — 역순 타임라인, Realtime, 수정/삭제  
4. Medical — 진료/예약 탭, D-Day, 키·몸무게 (`medical_logs`)

## 보안 / 주의

- `.env`, `.env.local` 및 시크릿을 읽거나 커밋하지 않는다.
- DB 스키마는 `.cursorrules`의 DDL을 기준으로 한다.
- 파괴적 git 명령(`push --force`, hard reset 등)은 사용자가 명시할 때만 사용한다.
