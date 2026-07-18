-- ============================================================
-- 서버 푸시 알람 셋업 (Web Push)
-- Supabase Dashboard > SQL Editor에서 1회 실행
-- (계정/일기 셋업인 setup_auth_and_diary.sql 이후에 실행)
-- ============================================================

-- ---------- 1) 푸시 구독 저장 ----------
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  endpoint text not null unique,       -- 브라우저 push endpoint (기기별 고유)
  p256dh text not null,                -- 구독 공개키
  auth text not null,                  -- 구독 auth secret
  enabled boolean not null default true,
  last_notified_at timestamp with time zone,       -- 마지막 발송 시각 (중복 방지)
  last_notified_feeding_id uuid,       -- 마지막 알림을 보낸 수유 기록 (사이클 구분)
  created_at timestamp with time zone default now()
);

create index if not exists push_subscriptions_child_idx
  on public.push_subscriptions (child_id) where enabled;

alter table public.push_subscriptions enable row level security;

-- 부모 본인 구독만 CRUD (service_role은 RLS를 우회하므로 Edge Function은 전체 접근)
drop policy if exists "push_sub_owner_all" on public.push_subscriptions;
create policy "push_sub_owner_all" on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- 2) 알람 설정(텀/온오프)을 서버도 알 수 있게 children에 컬럼 추가 ----------
-- (클라이언트 로컬 설정만으로는 서버가 판단할 수 없으므로 서버 기준값을 둔다)
alter table public.children
  add column if not exists feeding_alarm_enabled boolean not null default false;
alter table public.children
  add column if not exists feeding_alarm_interval_min integer not null default 180;
