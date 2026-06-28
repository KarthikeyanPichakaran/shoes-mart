-- ============================================================
-- Kickd / Shoes-Mart — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  created_at  timestamptz default now() not null
);

create table public.products (
  id               uuid primary key default uuid_generate_v4(),
  category_id      uuid references public.categories(id) on delete cascade not null,
  name             text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10,2) not null check (price > 0),
  stock_quantity   integer not null default 0 check (stock_quantity >= 0),
  available_sizes  integer[] not null default '{6,7,8,9,10,11}',
  image_url        text not null,
  images           text[] not null default '{}',
  is_active        boolean not null default true,
  created_at       timestamptz default now() not null
);

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz default now() not null
);

create table public.addresses (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  full_name  text not null,
  line1      text not null,
  line2      text,
  city       text not null,
  state      text not null,
  pincode    text not null,
  phone      text not null,
  is_default boolean not null default false,
  created_at timestamptz default now() not null
);

create table public.cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity   integer not null default 1 check (quantity > 0),
  size       integer not null,
  created_at timestamptz default now() not null,
  unique(user_id, product_id, size)
);

create table public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references public.profiles(id) on delete restrict not null,
  status              text not null default 'pending'
                        check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  subtotal            numeric(10,2) not null,
  shipping_amount     numeric(10,2) not null default 0,
  total_amount        numeric(10,2) not null,
  shipping_address    jsonb not null,
  razorpay_order_id   text unique,
  razorpay_payment_id text,
  created_at          timestamptz default now() not null
);

create table public.order_items (
  id                 uuid primary key default uuid_generate_v4(),
  order_id           uuid references public.orders(id) on delete cascade not null,
  product_id         uuid references public.products(id) on delete restrict not null,
  quantity           integer not null check (quantity > 0),
  size               integer not null,
  price_at_purchase  numeric(10,2) not null
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────

create index idx_products_category_id  on public.products(category_id);
create index idx_products_slug         on public.products(slug);
create index idx_products_is_active    on public.products(is_active);
create index idx_cart_items_user_id    on public.cart_items(user_id);
create index idx_orders_user_id        on public.orders(user_id);
create index idx_orders_razorpay       on public.orders(razorpay_order_id);
create index idx_order_items_order_id  on public.order_items(order_id);

-- ────────────────────────────────────────────────────────────
-- TRIGGER: auto-create profile on signup
-- ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.profiles    enable row level security;
alter table public.addresses   enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Categories: public read only
create policy "categories_public_read" on public.categories
  for select using (true);

-- Products: public read for active products
create policy "products_public_read" on public.products
  for select using (is_active = true);

-- Profiles: own row only
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- Addresses: own rows only
create policy "addresses_self_select" on public.addresses
  for select using (auth.uid() = user_id);

create policy "addresses_self_insert" on public.addresses
  for insert with check (auth.uid() = user_id);

create policy "addresses_self_update" on public.addresses
  for update using (auth.uid() = user_id);

create policy "addresses_self_delete" on public.addresses
  for delete using (auth.uid() = user_id);

-- Cart items: own rows only
create policy "cart_self_select" on public.cart_items
  for select using (auth.uid() = user_id);

create policy "cart_self_insert" on public.cart_items
  for insert with check (auth.uid() = user_id);

create policy "cart_self_update" on public.cart_items
  for update using (auth.uid() = user_id);

create policy "cart_self_delete" on public.cart_items
  for delete using (auth.uid() = user_id);

-- Orders: users can read their own; writes go through service role (API routes)
create policy "orders_self_select" on public.orders
  for select using (auth.uid() = user_id);

-- Order items: users can read items from their own orders
create policy "order_items_self_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- STORAGE
-- Run separately in: Supabase Dashboard → Storage
-- ────────────────────────────────────────────────────────────
-- 1. Create a public bucket named: product-images
--    (Storage → New Bucket → Name: product-images → Public: ON)
-- 2. Upload the 14 images from your ./images/ folder into sub-folders:
--    product-images/sneaker-shoes/image-1.jfif   ...image-4.jfif
--    product-images/running-shoes/image-1.jfif   ...image-4.jfif
--    product-images/boot-shoes/image-1.jfif      ...image-6.jfif
-- 3. Note your project URL, then run the seed below.

-- ────────────────────────────────────────────────────────────
-- SEED: Categories
-- ────────────────────────────────────────────────────────────

insert into public.categories (name, slug, description) values
  ('Sneakers',      'sneakers',      'Casual and stylish everyday sneakers'),
  ('Running Shoes', 'running-shoes', 'Performance footwear for every run'),
  ('Boots',         'boots',         'Durable boots for every terrain and occasion');

-- ────────────────────────────────────────────────────────────
-- SEED: Products
-- IMPORTANT: Replace YOUR_SUPABASE_URL with your project URL
-- Example: https://abcdefghijkl.supabase.co
-- After uploading images to Supabase Storage, run this block.
-- ────────────────────────────────────────────────────────────

-- Set this variable to your Supabase project URL (no trailing slash):
-- e.g. https://abcdefghijkl.supabase.co

do $$
declare
  base_url text := 'https://lylxzgcuediwbpwfnkbe.supabase.co/storage/v1/object/public/product-images';
  cat_sneakers uuid;
  cat_running  uuid;
  cat_boots    uuid;
begin
  select id into cat_sneakers from public.categories where slug = 'sneakers';
  select id into cat_running  from public.categories where slug = 'running-shoes';
  select id into cat_boots    from public.categories where slug = 'boots';

  -- Sneakers (4 products)
  insert into public.products (category_id, name, slug, description, price, stock_quantity, image_url, images) values
  (
    cat_sneakers,
    'Kickd Air Classic',
    'kickd-air-classic',
    'Low-top canvas sneaker with premium sole cushioning. A clean silhouette built for everyday wear and effortless style.',
    2499.00, 50,
    base_url || '/sneaker-shoes/image-1.jfif',
    array[base_url || '/sneaker-shoes/image-1.jfif']
  ),
  (
    cat_sneakers,
    'Kickd Canvas Court',
    'kickd-canvas-court',
    'Classic canvas silhouette with reinforced stitching and vulcanised sole. Timeless looks that pair with anything.',
    1999.00, 60,
    base_url || '/sneaker-shoes/image-2.jfif',
    array[base_url || '/sneaker-shoes/image-2.jfif']
  ),
  (
    cat_sneakers,
    'Kickd Foam Glide',
    'kickd-foam-glide',
    'Lightweight foam-injected midsole with breathable mesh upper. Comfort-first design that keeps you going all day.',
    3299.00, 40,
    base_url || '/sneaker-shoes/image-3.jfif',
    array[base_url || '/sneaker-shoes/image-3.jfif']
  ),
  (
    cat_sneakers,
    'Kickd Retro Pulse',
    'kickd-retro-pulse',
    'Retro-inspired thick platform sole with modern comfort technology. Bold looks for those who stand out.',
    2799.00, 45,
    base_url || '/sneaker-shoes/image-4.jfif',
    array[base_url || '/sneaker-shoes/image-4.jfif']
  );

  -- Running Shoes (4 products)
  insert into public.products (category_id, name, slug, description, price, stock_quantity, image_url, images) values
  (
    cat_running,
    'Kickd Stride X',
    'kickd-stride-x',
    'High-performance road runner with energy-return foam and secure lacing system. Built for your best miles.',
    3999.00, 35,
    base_url || '/running-shoes/image-1.jfif',
    array[base_url || '/running-shoes/image-1.jfif']
  ),
  (
    cat_running,
    'Kickd Pace Elite',
    'kickd-pace-elite',
    'Everyday training shoe with responsive cushioning and wide toe box for natural foot movement. Go further, feel better.',
    2999.00, 55,
    base_url || '/running-shoes/image-2.jfif',
    array[base_url || '/running-shoes/image-2.jfif']
  ),
  (
    cat_running,
    'Kickd TrailMax',
    'kickd-trailmax',
    'All-terrain trail runner with aggressive outsole grip and durable upper for off-road adventures.',
    4499.00, 30,
    base_url || '/running-shoes/image-3.jfif',
    array[base_url || '/running-shoes/image-3.jfif']
  ),
  (
    cat_running,
    'Kickd SpeedLite',
    'kickd-speedlite',
    'Race-day speedster with a featherlight upper and responsive midsole for maximum propulsion at every stride.',
    3499.00, 50,
    base_url || '/running-shoes/image-4.jfif',
    array[base_url || '/running-shoes/image-4.jfif']
  );

  -- Boots (6 products)
  insert into public.products (category_id, name, slug, description, price, stock_quantity, image_url, images) values
  (
    cat_boots,
    'Kickd Derby Classic',
    'kickd-derby-classic',
    'Refined leather derby boot with Goodyear welt construction. Sharp enough for the boardroom, built to last for years.',
    4999.00, 25,
    base_url || '/boot-shoes/image-1.jfif',
    array[base_url || '/boot-shoes/image-1.jfif']
  ),
  (
    cat_boots,
    'Kickd Chelsea Slim',
    'kickd-chelsea-slim',
    'Sleek elastic-sided chelsea boot in smooth calfskin leather. Effortless to wear, impossible to ignore.',
    5499.00, 20,
    base_url || '/boot-shoes/image-2.jfif',
    array[base_url || '/boot-shoes/image-2.jfif']
  ),
  (
    cat_boots,
    'Kickd Hiker Pro',
    'kickd-hiker-pro',
    'Waterproof hiking boot with padded ankle support and deep-lug outsole. Tackle any terrain with confidence.',
    5999.00, 30,
    base_url || '/boot-shoes/image-3.jfif',
    array[base_url || '/boot-shoes/image-3.jfif']
  ),
  (
    cat_boots,
    'Kickd Combat Lace',
    'kickd-combat-lace',
    'Military-inspired lace-up combat boot with reinforced toe cap and rugged sole. Urban toughness in every step.',
    4299.00, 35,
    base_url || '/boot-shoes/image-4.jfif',
    array[base_url || '/boot-shoes/image-4.jfif']
  ),
  (
    cat_boots,
    'Kickd Suede Chelsea',
    'kickd-suede-chelsea',
    'Premium suede chelsea boot with a contrasting crepe sole. Casual cool that elevates any outfit.',
    6499.00, 20,
    base_url || '/boot-shoes/image-5.jfif',
    array[base_url || '/boot-shoes/image-5.jfif']
  ),
  (
    cat_boots,
    'Kickd Work Pro',
    'kickd-work-pro',
    'Heavy-duty work boot with puncture-resistant sole and oil-resistant outsole. Protection that keeps up with your workday.',
    4799.00, 30,
    base_url || '/boot-shoes/image-6.jfif',
    array[base_url || '/boot-shoes/image-6.jfif']
  );

end $$;
