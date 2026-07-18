# 서버 푸시 알람 배포 가이드

앱을 완전히 껐어도 수유 예상 시각에 알림이 오게 하는 Web Push 설정입니다.
아래 순서대로 한 번만 하면 됩니다. (터미널 + Supabase 대시보드)

구조: 브라우저가 푸시 구독 → `push_subscriptions`에 저장 → Edge Function이
cron으로 주기 실행하며 예상 시각 지난 아이를 찾아 푸시 발송 → 서비스워커가 알림 표시.

---

## 0. 사전 준비

```bash
npm i -g supabase          # 이미 있으면 생략
supabase login             # 브라우저 인증
cd sol-log
supabase link --project-ref <프로젝트 ref>   # 대시보드 Settings > General의 Reference ID
```

## 1. DB 테이블/컬럼 생성

Supabase 대시보드 > SQL Editor에서 **`supabase/setup_push.sql`** 실행.
(push_subscriptions 테이블 + children에 알람 on/off 컬럼 추가)

## 2. VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

출력된 **Public Key / Private Key**를 아래에 나눠서 사용합니다.

- Public Key → 프론트엔드 환경변수 (공개돼도 되는 키)
- Private Key → Supabase secret (절대 프론트에 넣지 말 것)

## 3. 프론트엔드 환경변수 (Vercel)

Vercel 프로젝트 > Settings > Environment Variables에 추가 후 재배포:

```
VITE_VAPID_PUBLIC_KEY = <2단계의 Public Key>
```

로컬 테스트라면 `.env.local`에도 같은 값을 넣으세요.

## 4. Edge Function secrets 등록

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY="<Public Key>" \
  VAPID_PRIVATE_KEY="<Private Key>" \
  VAPID_SUBJECT="mailto:본인이메일@example.com" \
  CRON_SECRET="$(openssl rand -hex 16)"
```


`CRON_SECRET` 출력값은 6단계 cron 등록에 쓰이니 복사해 두세요.
(SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY는 자동 제공되므로 등록 불필요)

## 5. Edge Function 배포

```bash
supabase functions deploy feeding-alarm
```

배포 후 함수 URL: `https://<프로젝트ref>.supabase.co/functions/v1/feeding-alarm`

## 6. cron 스케줄 등록 (5분마다 실행)

Supabase 대시보드 > SQL Editor에서 실행 (pg_cron + pg_net 확장 사용):

```sql
-- 확장 활성화 (한 번만)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 5분마다 함수 호출
select cron.schedule(
  'feeding-alarm-every-5min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://<프로젝트ref>.supabase.co/functions/v1/feeding-alarm',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<4단계의 CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

스케줄 확인/삭제:

```sql
select * from cron.job;                         -- 목록
select cron.unschedule('feeding-alarm-every-5min');  -- 제거
```

## 7. 동작 테스트

1. 배포된 앱을 **아이폰 홈 화면에 설치**(Safari 공유 → 홈 화면에 추가)한 뒤 그 앱으로 열기.
2. 홈 > "다음 수유 예상" 카드에서 **알람 켜기** → 알림 권한 허용.
   (이때 이 기기가 `push_subscriptions`에 저장되고, 아이의 알람이 켜짐)
3. 앱을 완전히 종료.
4. 수유 예상 시각이 지나면(마지막 수유 + 텀), 5분 이내 cron이 돌며 푸시가 옵니다.

수동 테스트로 바로 쏘고 싶으면:

```bash
curl -X POST 'https://<프로젝트ref>.supabase.co/functions/v1/feeding-alarm' \
  -H 'x-cron-secret: <CRON_SECRET>' -H 'Content-Type: application/json' -d '{}'
```

응답 `{"ok":true,"sent":N}` 의 N이 발송 건수입니다.

---

## 동작 규칙 (요약)

- 대상: `children.feeding_alarm_enabled = true` 인 아이.
- 텀: 최근 7일 내 마지막 7건 수유 간격 평균(60~300분, 부족하면 3시간).
- 발송: 예상 시각이 지난 뒤 ~90분 동안, 같은 수유 사이클은 15분 간격으로 재알림.
- 새 수유를 기록하면 사이클이 바뀌어 자동 리셋.
- 만료된 구독(410/404)은 자동으로 정리됩니다.

## 참고

- 알람 on/off는 가족 공용(`children`)이라, 한 부모가 켜면 구독한 모든 기기로 갑니다.
- 앱 안(포그라운드) 알림은 서버 푸시와 별개로 계속 동작하므로, 서버 설정 전에도
  앱이 열려 있으면 알림이 옵니다.
