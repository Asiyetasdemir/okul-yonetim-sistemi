-- ============================================================
-- EduMercek — Supabase Postgres Şeması
-- K12Net / Sınıf Başkanım tarzı rol bazlı okul yönetim sistemi
-- ============================================================

-- Gerekli eklenti (hassas alanları şifrelemek için)
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. PROFİLLER (auth.users tablosunun uzantısı, rol bilgisi burada)
-- ------------------------------------------------------------
create type user_role as enum ('admin', 'ogretmen', 'veli', 'ogrenci');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'ogrenci',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2. AKADEMİK KATEGORİLER
-- ------------------------------------------------------------
create table academic_categories (
  value text primary key,
  label text not null
);

-- ------------------------------------------------------------
-- 3. ÖĞRENCİLER
-- ------------------------------------------------------------
create table students (
  id text primary key,               -- ör. STU001
  name text not null,
  phone text,
  address text,
  birth_date date,
  tc_no_encrypted bytea,             -- pgcrypto ile şifrelenmiş TC no
  grade text,
  category text,
  status text default 'Aktif',
  avatar text,
  behavior_score int default 100,
  owner_profile_id uuid references profiles(id), -- öğrencinin kendi girişi (varsa)
  created_at timestamptz default now()
);

-- Veliler (her öğrencinin 1-2 velisi olabilir)
create table parents (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  profile_id uuid references profiles(id),   -- velinin giriş hesabı
  name text not null,
  phone text,
  address text,
  birth_date date,
  tc_no_encrypted bytea,
  relation text default 'parent1'            -- parent1 / parent2
);

-- Davranış puanı kayıtları
create table behavior_logs (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  date date not null,
  type text check (type in ('plus','minus')),
  points int not null,
  reason text,
  teacher text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 4. FİNANS
-- ------------------------------------------------------------
create table student_finance (
  student_id text primary key references students(id) on delete cascade,
  contract_total numeric(12,2) default 0,
  paid numeric(12,2) default 0,
  remaining numeric(12,2) default 0
);

create table installments (
  id text primary key,          -- INS-1 vb.
  student_id text references students(id) on delete cascade,
  due_date date,
  amount numeric(12,2),
  status text default 'Beklemede'
);

create table payments (
  id text primary key,          -- PAY-101 vb.
  student_id text references students(id) on delete cascade,
  date date,
  amount numeric(12,2),
  method text,
  collector text
);

-- ------------------------------------------------------------
-- 5. SINAVLAR
-- ------------------------------------------------------------
create table exams (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  name text,
  date date,
  type text,                    -- TYT / AYT vb.
  turkce numeric, sosyal numeric, mat numeric, fen numeric,
  total_net numeric,
  total_score numeric,
  ranking int
);

-- ------------------------------------------------------------
-- 6. YOKLAMA / ÖDEV / ETÜT / REHBERLİK / DUYURU / PERSONEL
-- ------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  date date not null,
  status text,                  -- Geldi / Gelmedi / İzinli
  note text
);

create table homework (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  title text,
  subject text,
  due_date date,
  status text default 'Bekliyor'
);

create table studies (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  teacher text,
  subject text,
  date date,
  time text
);

create table counseling_notes (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id) on delete cascade,
  date date,
  note text,
  counselor text
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  audience user_role,           -- kime görünecek: admin/ogretmen/veli/ogrenci/null(hepsi)
  created_at timestamptz default now()
);

create table staff (
  id text primary key,
  name text,
  role text,
  phone text,
  profile_id uuid references profiles(id)
);

create table schedule (
  id uuid primary key default gen_random_uuid(),
  day text,
  hour text,
  grade text,
  subject text,
  teacher text
);

create table sms_logs (
  id uuid primary key default gen_random_uuid(),
  student_id text references students(id),
  message text,
  sent_at timestamptz default now()
);

create table question_bank (
  id uuid primary key default gen_random_uuid(),
  subject text,
  topic text,
  difficulty text,
  content text
);

-- ============================================================
-- ROW LEVEL SECURITY — rol bazlı erişim
-- ============================================================
alter table students enable row level security;
alter table parents enable row level security;
alter table behavior_logs enable row level security;
alter table student_finance enable row level security;
alter table installments enable row level security;
alter table payments enable row level security;
alter table exams enable row level security;
alter table attendance enable row level security;
alter table homework enable row level security;
alter table studies enable row level security;
alter table counseling_notes enable row level security;
alter table announcements enable row level security;

-- Yardımcı fonksiyon: giriş yapan kullanıcının rolünü döner
create or replace function auth_role() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable;

-- Admin & öğretmen her öğrenciyi görebilir
create policy "admin_ogretmen_tum_ogrenciler" on students
  for select using (auth_role() in ('admin','ogretmen'));

-- Veli sadece kendi çocuğunu görebilir
create policy "veli_kendi_cocugu" on students
  for select using (
    auth_role() = 'veli' and
    id in (select student_id from parents where profile_id = auth.uid())
  );

-- Öğrenci sadece kendi profilini görebilir
create policy "ogrenci_kendi_profili" on students
  for select using (auth_role() = 'ogrenci' and owner_profile_id = auth.uid());

-- Aynı mantık diğer tablolara da uygulanmalı (behavior_logs, exams, homework, vb.)
-- Örnek — exams tablosu için:
create policy "exams_erisim" on exams
  for select using (
    auth_role() in ('admin','ogretmen')
    or student_id in (select student_id from parents where profile_id = auth.uid())
    or student_id in (select id from students where owner_profile_id = auth.uid())
  );
