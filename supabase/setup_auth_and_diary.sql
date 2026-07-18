-- ============================================================
-- Sol-Log 로그인 + 일기 기능 셋업
-- Supabase Dashboard > SQL Editor에서 1회 실행하세요.
--
-- 실행 후 할 일:
--   1) Authentication > Users에서 계정 3개 생성 (이메일/비밀번호)
--      - mom@sol-log.family   (엄마)
--      - dad@sol-log.family   (아빠)
--      - child@sol-log.family (자녀 - 나중에 사용)
--      * 다른 이메일을 쓰려면 .env.local의 VITE_ACCOUNT_*_EMAIL도 맞춰주세요.
--   2) 아래 "역할/이름 지정" 주석의 UPDATE 문 실행
--   3) Authentication > Providers > Email에서 "Confirm email" 끄기(가족용 내부 계정)
--      및 Sign-ups 비활성화 권장
-- ============================================================

-- ---------- 1) 프로필 (계정 1:1, 부모/자녀 역할) ----------
-- 기본 역할은 'pending'(권한 없음): 혹시 Sign-ups가 열려 있어도
-- 새로 가입한 계정은 아무 데이터에도 접근할 수 없다 (심층 방어)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(50) not null default '',
  role varchar(10) not null default 'pending' check (role in ('parent', 'child', 'pending')),
  created_at timestamp with time zone default now()
);

-- 역할 판별 헬퍼 (아래 모든 RLS 정책에서 사용하므로 정책보다 먼저 정의)
create or replace function public.is_parent()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from profiles where id = auth.uid() and role = 'parent') $$;

create or replace function public.is_child()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from profiles where id = auth.uid() and role = 'child') $$;

alter table public.profiles enable row level security;

-- 본인 프로필 + (가족 구성원이면) 다른 프로필 조회 가능. pending 계정은 본인 것만.
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_parent() or public.is_child());

-- 본인 프로필 수정 가능하되 role은 스스로 바꿀 수 없음 (권한 상승 차단)
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- 새 계정이 만들어지면 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 2) 일기 테이블 ----------
create table if not exists public.diaries (
  id uuid default gen_random_uuid() primary key,
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  diary_date date not null default current_date,
  content text not null,
  photo_paths text[] not null default '{}',
  created_at timestamp with time zone default now()
);

alter table public.diaries enable row level security;

-- 작성자 본인만 전체 권한 -> 부모끼리는 서로의 일기를 볼 수 없음 (프라이버시)
drop policy if exists "diaries_author_all" on public.diaries;
create policy "diaries_author_all" on public.diaries
  for all to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- 자녀 계정은 모든 일기 읽기 가능
drop policy if exists "diaries_child_select" on public.diaries;
create policy "diaries_child_select" on public.diaries
  for select to authenticated using (public.is_child());

-- ---------- 3) 기존 테이블 잠그기 (부모만 접근) ----------
alter table public.children enable row level security;
alter table public.care_logs enable row level security;
alter table public.medical_logs enable row level security;

drop policy if exists "children_parent_all" on public.children;
create policy "children_parent_all" on public.children
  for all to authenticated using (public.is_parent()) with check (public.is_parent());

drop policy if exists "care_logs_parent_all" on public.care_logs;
create policy "care_logs_parent_all" on public.care_logs
  for all to authenticated using (public.is_parent()) with check (public.is_parent());

drop policy if exists "medical_logs_parent_all" on public.medical_logs;
create policy "medical_logs_parent_all" on public.medical_logs
  for all to authenticated using (public.is_parent()) with check (public.is_parent());

-- ---------- 4) 일기 사진 Storage ----------
insert into storage.buckets (id, name, public)
values ('diary-photos', 'diary-photos', false)
on conflict (id) do nothing;

-- 본인 폴더({uid}/...)만 업로드/조회/삭제
drop policy if exists "diary_photos_owner_all" on storage.objects;
create policy "diary_photos_owner_all" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'diary-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'diary-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 자녀는 모든 일기 사진 읽기 가능
drop policy if exists "diary_photos_child_select" on storage.objects;
create policy "diary_photos_child_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'diary-photos' and public.is_child());

-- ---------- 5) 역할/이름 지정 (계정 생성 후 "반드시" 실행) ----------
-- 기본 역할이 'pending'(권한 없음)이므로, 역할을 지정해야 앱을 쓸 수 있습니다.
-- Authentication > Users에서 각 계정의 UUID를 확인해 실행하세요.
--
-- update public.profiles set display_name = '엄마',   role = 'parent' where id = '<엄마 계정 UUID>';
-- update public.profiles set display_name = '아빠',   role = 'parent' where id = '<아빠 계정 UUID>';
-- update public.profiles set display_name = '노이솔', role = 'child'  where id = '<자녀 계정 UUID>';
