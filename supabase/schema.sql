-- ============ الجداول ============

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  created_at timestamptz default now()
);

create table public.consultants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  category text not null,
  price numeric not null,
  initials text,
  created_at timestamptz default now()
);

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid references public.consultants(id) on delete cascade not null,
  label text not null,
  is_booked boolean not null default false
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  slot_id uuid references public.slots(id) on delete cascade not null unique,
  created_at timestamptz default now()
);

-- ============ عند إنشاء أي حجز، يتحول الموعد تلقائيًا لمحجوز ============

create function public.handle_new_booking()
returns trigger as $$
begin
  update public.slots set is_booked = true where id = new.slot_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_booking_created
  after insert on public.bookings
  for each row execute procedure public.handle_new_booking();

-- ============ عند تسجيل مستخدم جديد، ينشأ له صف profile تلقائيًا ============

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ تفعيل الحماية على مستوى الصفوف (RLS) ============

alter table public.profiles enable row level security;
alter table public.consultants enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;

-- الجميع (حتى الزوار) يقدروا يشوفوا الاستشاريين والمواعيد
create policy "consultants are public" on public.consultants
  for select using (true);

create policy "slots are public" on public.slots
  for select using (true);

-- المستخدم يشوف ويعدّل بروفايله فقط
create policy "users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- المستخدم يقدر يحجز لنفسه فقط، ويشوف حجوزاته فقط
create policy "users can insert own bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

-- ============ بيانات تجريبية ============

do $$
declare
  c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; c6 uuid;
begin
  insert into public.consultants (name, specialty, category, price, initials) values
    ('سارة الحربي', 'استشارية تأسيس شركات ناشئة', 'business', 280, 'س.ح') returning id into c1;
  insert into public.consultants (name, specialty, category, price, initials) values
    ('خالد المطيري', 'محامٍ، عقود تجارية', 'legal', 350, 'خ.م') returning id into c2;
  insert into public.consultants (name, specialty, category, price, initials) values
    ('منى العتيبي', 'مدربة تطوير مسار وظيفي', 'career', 200, 'م.ع') returning id into c3;
  insert into public.consultants (name, specialty, category, price, initials) values
    ('فهد الدوسري', 'أخصائي نفسي، جلسات فردية', 'mental', 240, 'ف.د') returning id into c4;
  insert into public.consultants (name, specialty, category, price, initials) values
    ('لمى القحطاني', 'مستشارة استثمار وتخطيط مالي', 'finance', 300, 'ل.ق') returning id into c5;
  insert into public.consultants (name, specialty, category, price, initials) values
    ('عبدالله الشمري', 'استشاري نمو وتسويق للمشاريع', 'business', 260, 'ع.ش') returning id into c6;

  insert into public.slots (consultant_id, label) values
    (c1, 'الأحد ٤:٠٠ م'), (c1, 'الاثنين ١١:٠٠ ص'), (c1, 'الثلاثاء ٧:٣٠ م'),
    (c2, 'الاثنين ٩:٠٠ ص'), (c2, 'الأربعاء ٢:٠٠ م'),
    (c3, 'الأحد ١٠:٠٠ ص'), (c3, 'الثلاثاء ٥:٠٠ م'), (c3, 'الخميس ١٢:٠٠ م'),
    (c4, 'الاثنين ٦:٠٠ م'), (c4, 'الأربعاء ٤:٣٠ م'),
    (c5, 'الثلاثاء ١٠:٠٠ ص'), (c5, 'الخميس ٣:٠٠ م'), (c5, 'الجمعة ١١:٠٠ ص'),
    (c6, 'الأربعاء ١٢:٣٠ م'), (c6, 'الخميس ٥:٣٠ م');
end $$;
