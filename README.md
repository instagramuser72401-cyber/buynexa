# BuyNexa — "Har Zaroorat, Ek Jagah."

A guest-checkout e-commerce app built with **Next.js 14 (App Router)**, **Prisma + PostgreSQL**,
and **Razorpay**. No customer login/signup anywhere — customers browse and order as guests;
their personal details are visible only inside the authenticated Admin Dashboard.

This was generated in a sandboxed environment with no internet access, so it has **not been
run or tested end-to-end**. Follow the steps below on your own machine to install dependencies,
push the schema, and run it for real. Review the code before deploying to production.

---

## 1. What's included

- **Customer site**: home (search/categories/featured/latest/bestsellers), product detail,
  cart, guest checkout, Razorpay payment, order success, order tracking (order ID + phone).
- **Admin dashboard** (`/admin`): password login, stats overview, order management with
  filters + status updates, product CRUD, category management, coupon management.
- **API layer** (`app/api/**`): every route that touches customer PII (`/api/admin/orders`)
  is gated by `requireAdmin()`; every route that touches money (`/api/payment/*`) recomputes
  amounts server-side and verifies Razorpay's signature before trusting a payment.
- **Database schema** (`prisma/schema.prisma`) covering products, categories, orders, order
  items, payments, coupons, admin users, delivery settings.

## 2. What's intentionally left for you to build out

Given the scope of the original spec, these are stubbed or simplified rather than fully built:

- **Analytics charts** (daily/weekly/monthly sales graphs) — the raw data is all in the
  `Order`/`Payment` tables; you'll want a charting library (e.g. `recharts`) on a new
  `/admin/analytics` page querying it.
- **Multiple product image upload from the browser** — the admin product form currently
  takes comma-separated image URLs. For real image *uploads*, wire in a storage provider
  (Vercel Blob, S3, Cloudinary) and swap that field for a file input.
- **CSRF protection** — Next.js Route Handlers + `sameSite: "lax"` cookies cover the common
  case, but if you add any state-changing GET routes or third-party form posts, add explicit
  CSRF tokens.
- **Rate limiting** beyond the login endpoint — for production, put the whole API behind
  Vercel's/Cloudflare's rate limiting or Upstash Ratelimit.
- **Low-stock email/SMS alerts to admin** — the dashboard surfaces the count; wiring an
  actual notification (email via Resend/SendGrid, SMS via MSG91/Twilio) is not included.

## 3. Setup

```bash
npm install
cp .env.example .env
# now edit .env — see section 4 below
npx prisma db push        # creates tables in your database
node prisma/seed.js       # creates first admin user + demo categories/products
npm run dev                # http://localhost:3000
```

Admin dashboard: `http://localhost:3000/admin/login`
(use the `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` you set in `.env` — **change the password
after first login**, e.g. by adding a "change password" admin route, or by re-running the seed
with a new password after deleting the AdminUser row).

## 4. Environment variables — where to get each one

Open `.env.example`, copy it to `.env`, and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Create a free Postgres DB on [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app). Copy the connection string they give you. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/keys). Start with the **Test Mode** key. |
| `RAZORPAY_KEY_SECRET` | Same page as above. **Server-side only — never expose this in any client component or NEXT_PUBLIC_ variable.** |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks → create a webhook pointing to `https://yourdomain.com/api/payment/webhook`, subscribe to `payment.captured` and `payment.failed`, set a secret there and paste it here. |
| `ADMIN_JWT_SECRET` | Generate with `openssl rand -base64 48` — a long random string, keep it secret. |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Pick your own — used once by `prisma/seed.js` to create the first admin login. |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL, e.g. `https://buynexa.vercel.app` (use `http://localhost:3000` while developing). |
| `DEFAULT_DELIVERY_CHARGE` / `FREE_DELIVERY_ABOVE` | Your own delivery pricing rules; also editable later via the `DeliverySettings` table. |

**Never commit your real `.env` file.** It's already excluded via `.gitignore` (add one if it's
not present: `.env`, `.env.local`, `node_modules`, `.next`).

## 5. Going live with Razorpay

1. Complete Razorpay's KYC/activation to move from **Test Mode** to **Live Mode**.
2. Swap `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for the live keys.
3. Re-create the webhook under Live Mode with the same URL and a new webhook secret.
4. Test the full flow with a small real payment before announcing the store publicly.

## 6. Deployment (Vercel, recommended)

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add every variable from `.env` into Vercel's Project → Settings → Environment Variables.
4. Deploy. Then run `npx prisma db push` once (locally, pointed at the production
   `DATABASE_URL`) and `node prisma/seed.js` once to create tables and your admin user.

## 7. Security checklist before launch

- [ ] Changed the seeded admin password
- [ ] `ADMIN_JWT_SECRET` is a long random value, not the placeholder
- [ ] `RAZORPAY_KEY_SECRET` and `ADMIN_JWT_SECRET` are set only in server environment
      variables, never in any file prefixed `NEXT_PUBLIC_`
- [ ] Confirmed `/api/admin/*` routes return 401 when called without the admin cookie
      (test with `curl`)
- [ ] Confirmed a customer cannot fetch another customer's order without knowing both the
      order number and phone number
- [ ] Postgres database has SSL enabled and is not publicly exposed beyond your app
- [ ] Webhook secret configured and verified in Razorpay Live Mode
