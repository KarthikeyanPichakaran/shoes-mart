-- ============================================================
-- Shoe-Mart — Update product images to high-res Unsplash photos
-- Run this in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times (idempotent UPDATE by slug)
-- ============================================================

update public.products set
  image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-air-classic';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-canvas-court';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-foam-glide';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-retro-pulse';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-stride-x';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-pace-elite';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1508629297843-1e1ea7e7f5e0?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1508629297843-1e1ea7e7f5e0?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-trailmax';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-speedlite';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1608256246200-89c6e2b8d35b?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1608256246200-89c6e2b8d35b?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-derby-classic';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-chelsea-slim';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-hiker-pro';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-combat-lace';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-suede-chelsea';

update public.products set
  image_url = 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&auto=format&fit=crop&q=80',
  images    = array['https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&auto=format&fit=crop&q=80']
where slug = 'kickd-work-pro';
