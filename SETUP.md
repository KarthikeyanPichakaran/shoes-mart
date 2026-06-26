# Kickd — Setup Guide

Complete step-by-step instructions to get your Kickd shoe store running locally and on Vercel.

---

## Prerequisites

- Node.js 18+ installed ([nodejs.org](https://nodejs.org))
- A GitHub account with access to `https://github.com/KarthikeyanPichakaran/shoes-mart`
- A Supabase account ([supabase.com](https://supabase.com))
- A Razorpay account ([razorpay.com](https://razorpay.com))

---

## Step 1 — Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose your organization, give it a name (e.g. `kickd`), set a database password, and choose the **South Asia (Mumbai)** region
3. Wait ~2 minutes for the project to be ready
4. Go to **Settings → API** and note down:
   - **Project URL** → `https://YOURPROJECTREF.supabase.co`
   - **anon public** key
   - **service_role** key (keep this secret — never expose in browser)

---

## Step 2 — Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. **Before running**, scroll to the bottom and find this line in the `do $$` block:
   ```
   base_url text := 'https://YOUR_SUPABASE_URL.supabase.co/...';
   ```
   Replace `YOUR_SUPABASE_URL` with your actual project reference (the part before `.supabase.co`)
4. Click **Run** — all tables, indexes, triggers, RLS policies, and seed data will be created

---

## Step 3 — Upload Product Images to Supabase Storage

1. In Supabase dashboard → **Storage** → **New Bucket**
   - Name: `product-images`
   - Toggle **Public bucket** ON
   - Click **Create bucket**

2. Inside the bucket, create sub-folders and upload your images:

   | Local folder               | Upload to (in Supabase Storage) |
   |----------------------------|---------------------------------|
   | `images/sneaker-shoes/`    | `product-images/sneaker-shoes/` |
   | `images/running-shoes/`    | `product-images/running-shoes/` |
   | `images/boot-shoes/`       | `product-images/boot-shoes/`    |

   Upload all 14 images keeping the same filenames (`image-1.jfif` through `image-6.jfif`).

3. The seed SQL already references these paths — once uploaded the images will appear automatically.

> **Tip:** You can drag-and-drop images in the Storage UI. Make sure the folder names match exactly (lowercase, hyphens).

---

## Step 4 — Set Up Razorpay

1. Sign up at [razorpay.com](https://razorpay.com) and complete KYC (you can start in test mode without full KYC)
2. Go to **Settings → API Keys** → **Generate Test Key**
3. Copy your:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**
4. Keep these safe — you'll add them to `.env.local` next

---

## Step 5 — Create Your `.env.local` File

In the project root, create a file named `.env.local` (copy from `.env.local.example`):

```env
# Supabase — from Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECTREF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Razorpay — from Dashboard → Settings → API Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **Security:** `.env.local` is in `.gitignore` and will never be pushed to GitHub. Only `NEXT_PUBLIC_*` variables are exposed to the browser.

---

## Step 6 — Install Dependencies and Run Locally

```bash
# In the project root (shoes-mart folder):
npm install

# Start the development server:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 7 — Test the Full Flow

1. Browse the homepage — you should see featured products and category cards
2. Click a product → select a size → add to cart
3. Go to `/auth/signup` → create an account (check your email to confirm)
4. Log in → go to `/cart` → click Checkout
5. Fill in a shipping address → click **Pay**
6. In the Razorpay test modal, use these test card details:
   - **Card number:** `4111 1111 1111 1111`
   - **Expiry:** Any future date (e.g. `12/26`)
   - **CVV:** Any 3 digits
   - **Name:** Anything
7. Complete payment → you should be redirected to the success page
8. Check `/orders` to confirm the order was recorded

---

## Step 8 — Adding New Products (via Supabase Dashboard)

To add a new shoe later:

1. Upload the product image to `product-images/` in Supabase Storage
2. Note the public URL: `https://YOURPROJECTREF.supabase.co/storage/v1/object/public/product-images/FILENAME.jfif`
3. Go to **Supabase → Table Editor → products** → click **Insert row**
4. Fill in:
   - `category_id` — pick from the `categories` table
   - `name` — product name
   - `slug` — URL-safe unique identifier (e.g. `kickd-new-shoe`)
   - `description` — product description
   - `price` — in INR (e.g. `2999`)
   - `stock_quantity` — number in stock
   - `available_sizes` — `{6,7,8,9,10,11}` (or any subset)
   - `image_url` — the public Storage URL from step 2
   - `images` — `{"url1","url2"}` (array; can be same as image_url)
   - `is_active` — `true`

Alternatively, run an INSERT in the SQL Editor:
```sql
insert into products (category_id, name, slug, description, price, stock_quantity, image_url, images)
values (
  (select id from categories where slug = 'sneakers'),
  'My New Shoe',
  'my-new-shoe',
  'A great new shoe.',
  2999.00,
  50,
  'https://YOURPROJECTREF.supabase.co/storage/v1/object/public/product-images/my-shoe.jpg',
  array['https://YOURPROJECTREF.supabase.co/storage/v1/object/public/product-images/my-shoe.jpg']
);
```

---

## Step 9 — Deploy to Vercel

1. Push your code to GitHub (already done if you followed the setup)
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub → select `shoes-mart`
3. Vercel will auto-detect Next.js — click **Deploy**
4. Once deployed, go to **Settings → Environment Variables** and add all 6 variables from your `.env.local`
5. Change `NEXT_PUBLIC_BASE_URL` to your Vercel URL (e.g. `https://shoes-mart.vercel.app`)
6. Trigger a redeploy: **Deployments → Redeploy**

Your store is now live! 🎉

---

## Step 10 — Enable Razorpay Live Mode (when ready to accept real payments)

1. Complete Razorpay KYC in the dashboard
2. Go to **Settings → API Keys** → Generate **Live** Key
3. Update your Vercel environment variables:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` → live key ID (starts with `rzp_live_`)
   - `RAZORPAY_KEY_SECRET` → live key secret
4. Redeploy on Vercel
5. Test with a real small transaction to confirm

> The only code change needed is in your env vars — no code modifications required to switch between test and live mode.

---

## Environment Variable Reference

| Variable | Where to find it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | **No** (server only) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys → Key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys → Key Secret | **No** (server only) |
| `NEXT_PUBLIC_BASE_URL` | Your domain / localhost | Yes |

---

## Database Schema Overview

| Table | Purpose |
|---|---|
| `categories` | 3 shoe categories (sneakers, running-shoes, boots) |
| `products` | 14 products with price, stock, images |
| `profiles` | Extended user data (auto-created on signup) |
| `addresses` | Saved shipping addresses |
| `cart_items` | Server-side cart (used for cleanup after order) |
| `orders` | Order records linked to Razorpay payments |
| `order_items` | Line items per order with price snapshot |

---

## Troubleshooting

**Products not showing on homepage?**
- Check Supabase Storage: images must be in a PUBLIC bucket named `product-images`
- Verify the `base_url` in `schema.sql` was correctly replaced before running the seed

**Razorpay modal not opening?**
- Check browser console for script load errors
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`

**Auth redirect not working after login?**
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase → Authentication → URL Configuration has `http://localhost:3000` in allowed redirect URLs

**`SUPABASE_SERVICE_ROLE_KEY` missing error?**
- This is used by the payment API routes. Add it to `.env.local` (never commit it to git)
