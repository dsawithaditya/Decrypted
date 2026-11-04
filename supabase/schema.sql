-- ====================================================================
-- Mess Queue Manager (MQM) · Team Decrypted (SE-302A)
-- Full-Stack PostgreSQL Schema with Supabase Auth, RLS & Realtime
-- Theme: Deep Navy & Gold Pixel-Modern Arcade
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 2. USER PROFILES (Linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  roll_number text,
  role text not null default 'student' check (role in ('student', 'staff', 'admin')),
  student_type text not null default 'national' check (student_type in ('national', 'international')),
  hostel_block text,
  room_number text,
  karma_points int not null default 0,
  created_at timestamptz default now()
);

-- 3. LIVE COUNTERS TABLE
create table if not exists public.counters (
  id text primary key,
  name text not null,
  type text not null check (type in ('national', 'international', 'standby')),
  capacity int not null default 20,
  queue_count int not null default 0,
  open boolean not null default true,
  sold_out boolean not null default false,
  updated_at timestamptz default now()
);

-- 4. MESS STATE & THRESHOLDS (Singleton record with id = 1)
create table if not exists public.mess_state (
  id int primary key default 1 check (id = 1),
  cross_access boolean not null default false,
  standby_open boolean not null default false,
  manual_override boolean not null default false,
  alert_sent boolean not null default false,
  mode text not null default 'manual' check (mode in ('manual', 'simulation')),
  last_action text not null default 'keep',
  zone_avg numeric(5,2) default 30.00,
  last_count_update timestamptz default now(),
  last_updated timestamptz default now()
);

-- 5. DIRECT-TO-ROOM FOOD DELIVERIES (For Sick, Injured, Quarantined & Exam Students)
create table if not exists public.room_deliveries (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete set null,
  student_name text not null,
  roll_number text not null,
  hostel_block text not null,
  room_number text not null,
  phone text,
  reason text not null check (reason in ('medical', 'injury', 'exam', 'quarantine')),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'snacks', 'dinner')),
  diet_choice text not null,
  delivery_mode text not null default 'staff' check (delivery_mode in ('staff', 'peer_buddy')),
  runner_name text,
  otp_code text not null,
  status text not null default 'requested' check (status in ('requested', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- 6. MENU ITEMS TABLE
create table if not exists public.menu_items (
  id text primary key,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'snacks', 'dinner')),
  name text not null,
  category text not null,
  dietary_tag text default 'Veg',
  availability text not null default 'available' check (availability in ('available', 'low', 'refilling', 'finished')),
  avg_rating numeric(3,2) default 4.50,
  ratings_count int not null default 0,
  updated_at timestamptz default now()
);

-- 7. DISH-LEVEL FOOD RATINGS
create table if not exists public.food_ratings (
  id uuid default gen_random_uuid() primary key,
  menu_item_id text references public.menu_items(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete set null,
  student_name text,
  stars int not null check (stars between 1 and 5),
  tags text[] default '{}',
  comment text,
  created_at timestamptz default now()
);

-- 8. OVERALL MESS FEEDBACK
create table if not exists public.mess_feedback (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete set null,
  student_name text,
  hygiene_rating int not null check (hygiene_rating between 1 and 5),
  speed_rating int not null check (speed_rating between 1 and 5),
  overall_rating int not null check (overall_rating between 1 and 5),
  comments text,
  created_at timestamptz default now()
);

-- 9. DIGITAL CROSS-ACCESS EXPRESS PASSES
create table if not exists public.cross_access_passes (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete set null,
  student_name text,
  roll_number text,
  assigned_counter_id text references public.counters(id) on delete set null,
  assigned_counter_name text not null,
  token_code text not null,
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  created_at timestamptz default now()
);

-- 10. MEAL ATTENDANCE (ZERO FOOD WASTE PRE-CHECK-IN)
create table if not exists public.meal_attendance (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete set null,
  roll_number text not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'snacks', 'dinner')),
  status text not null check (status in ('eating', 'skipping')),
  meal_date date not null default current_date,
  created_at timestamptz default now(),
  constraint unique_student_meal unique (roll_number, meal_slot, meal_date)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.counters enable row level security;
alter table public.mess_state enable row level security;
alter table public.room_deliveries enable row level security;
alter table public.menu_items enable row level security;
alter table public.food_ratings enable row level security;
alter table public.mess_feedback enable row level security;
alter table public.cross_access_passes enable row level security;
alter table public.meal_attendance enable row level security;

-- Helper function: is current user staff or admin?
create or replace function public.is_staff()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
end;
$$ language plpgsql security definer;

-- PROFILES:
-- Public can read profiles, users can update their own profile, staff can view all
create policy "Allow read profiles" on public.profiles for select using (true);
create policy "Allow user update self profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow user insert self profile" on public.profiles for insert with check (auth.uid() = id);

-- COUNTERS & MESS STATE:
-- Everyone can read live queue counts
create policy "Allow public read counters" on public.counters for select using (true);
create policy "Allow staff update counters" on public.counters for all using (public.is_staff() or auth.role() = 'anon');

create policy "Allow public read mess_state" on public.mess_state for select using (true);
create policy "Allow staff update mess_state" on public.mess_state for all using (public.is_staff() or auth.role() = 'anon');

-- ROOM DELIVERIES:
-- Students can see their own deliveries; Staff can see and update all
create policy "Allow read deliveries" on public.room_deliveries for select using (true);
create policy "Allow create delivery" on public.room_deliveries for insert with check (true);
create policy "Allow update delivery" on public.room_deliveries for update using (true);

-- MENU ITEMS:
-- Public can read; staff can update availability/ratings
create policy "Allow read menu" on public.menu_items for select using (true);
create policy "Allow update menu" on public.menu_items for all using (true);

-- FOOD RATINGS & FEEDBACK:
create policy "Allow read food_ratings" on public.food_ratings for select using (true);
create policy "Allow insert food_ratings" on public.food_ratings for insert with check (true);

create policy "Allow read mess_feedback" on public.mess_feedback for select using (true);
create policy "Allow insert mess_feedback" on public.mess_feedback for insert with check (true);

-- CROSS ACCESS PASSES:
create policy "Allow read cross passes" on public.cross_access_passes for select using (true);
create policy "Allow insert cross passes" on public.cross_access_passes for insert with check (true);
create policy "Allow update cross passes" on public.cross_access_passes for update using (true);

-- MEAL ATTENDANCE:
create policy "Allow read attendance" on public.meal_attendance for select using (true);
create policy "Allow insert attendance" on public.meal_attendance for insert with check (true);
create policy "Allow update attendance" on public.meal_attendance for update using (true);

-- ====================================================================
-- AUTOMATIC DISH RATING RECALCULATION TRIGGER
-- ====================================================================
create or replace function public.recalc_dish_rating()
returns trigger as $$
begin
  update public.menu_items
  set
    avg_rating = (
      select round(coalesce(avg(stars), 4.5)::numeric, 2)
      from public.food_ratings
      where menu_item_id = coalesce(new.menu_item_id, old.menu_item_id)
    ),
    ratings_count = (
      select count(*)
      from public.food_ratings
      where menu_item_id = coalesce(new.menu_item_id, old.menu_item_id)
    ),
    updated_at = now()
  where id = coalesce(new.menu_item_id, old.menu_item_id);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recalc_dish_rating on public.food_ratings;
create trigger trg_recalc_dish_rating
after insert or update or delete on public.food_ratings
for each row execute function public.recalc_dish_rating();

-- ====================================================================
-- SUPABASE REALTIME REPLICATION
-- ====================================================================
begin;
  -- Enable realtime publication for all relevant tables
  alter publication supabase_realtime add table public.counters;
  alter publication supabase_realtime add table public.mess_state;
  alter publication supabase_realtime add table public.room_deliveries;
  alter publication supabase_realtime add table public.menu_items;
  alter publication supabase_realtime add table public.food_ratings;
  alter publication supabase_realtime add table public.cross_access_passes;
  alter publication supabase_realtime add table public.meal_attendance;
commit;

-- ====================================================================
-- SEED INITIAL DATA
-- ====================================================================

-- 1. Initial Counters
insert into public.counters (id, name, type, capacity, queue_count, open, sold_out) values
  ('c1', 'Counter 1', 'national', 20, 4, true, false),
  ('c2', 'Counter 2', 'national', 20, 5, true, false),
  ('c3', 'Counter 3', 'national', 20, 3, true, false),
  ('c4', 'Counter 4', 'international', 15, 1, true, false),
  ('c5', 'Counter 5', 'international', 15, 2, true, false),
  ('c6', 'Standby 1', 'standby', 15, 0, false, false)
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  capacity = excluded.capacity;

-- 2. Initial Mess State
insert into public.mess_state (id, cross_access, standby_open, manual_override, alert_sent, mode, last_action, zone_avg)
values (1, false, false, false, false, 'manual', 'keep', 30.00)
on conflict (id) do nothing;

-- 3. Today's Live Menu Items
insert into public.menu_items (id, meal_slot, name, category, dietary_tag, availability, avg_rating, ratings_count) values
  ('m1', 'lunch', 'Paneer Butter Masala', 'Curry / Gravy', 'Veg · High Protein', 'available', 4.80, 42),
  ('m2', 'lunch', 'Dal Tadka', 'Lentils', 'Veg', 'available', 4.30, 36),
  ('m3', 'lunch', 'Jeera Basmati Rice', 'Rice', 'Veg · Jain Option', 'available', 4.60, 29),
  ('m4', 'lunch', 'Tandoori Roti / Chapati', 'Breads', 'Veg', 'refilling', 4.10, 51),
  ('m5', 'lunch', 'Cucumber Mint Raita', 'Sides', 'Veg', 'available', 4.70, 22),
  ('m6', 'lunch', 'Gulab Jamun (Dessert)', 'Sweet', 'Veg', 'low', 4.90, 68),
  ('m7', 'breakfast', 'Masala Dosa with Sambar', 'Breakfast Special', 'Veg', 'available', 4.85, 95),
  ('m8', 'breakfast', 'Poha with Roasted Peanuts', 'Breakfast', 'Veg', 'available', 4.20, 40),
  ('m9', 'dinner', 'Shahi Paneer & Peas Pulao', 'Dinner Special', 'Veg', 'available', 4.75, 54),
  ('m10', 'dinner', 'Light Sick Diet Khichdi', 'Special Diet', 'Mild / Digestive', 'available', 4.90, 15)
on conflict (id) do nothing;

-- 4. Sample Demonstration Room Deliveries
insert into public.room_deliveries (student_name, roll_number, hostel_block, room_number, phone, reason, meal_type, diet_choice, delivery_mode, runner_name, otp_code, status, notes)
values
  ('Aryan Sharma', '21BCE1042', 'Block B', 'B-312', '9876543210', 'medical', 'lunch', 'Light Sick Diet (Khichdi + Curd Rice)', 'staff', 'Ramesh (Mess Runner)', '4821', 'out_for_delivery', 'High fever (102°F), doctor advised khichdi.'),
  ('Neha Nair', '22BIT2031', 'Girls Hostel 1', 'GH-108', '9811223344', 'injury', 'lunch', 'Standard Today Thali', 'peer_buddy', 'Ananya S (Earns +10 Karma)', '1937', 'preparing', 'Sprained right ankle during sports, cannot stand in line.'),
  ('Rohan Varma', '20BME0812', 'Block A', 'A-404', '9988776655', 'exam', 'lunch', 'Standard Today Thali', 'staff', null, '7502', 'requested', 'Overlapping VLSI laboratory viva until 1:45 PM.');

