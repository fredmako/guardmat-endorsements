# Guardmat Endorsements - Deployment Instructions

## Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)
- A Vercel account (for deployment)
- (Optional) Twilio or Africa's Talking account for SMS

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd guardmat-endorsements
npm install
```

## 2. Set Up Supabase

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API
4. Create a service role key (keep this secret!)

## 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `ADMIN_PASSWORD` - A secure password for admin access

## 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## 5. Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

## 6. Post-Deployment

1. Run the Supabase schema SQL
2. Add admin users to the `admin_users` table
3. Update the schools list with real participating schools
4. Configure SMS provider for OTP (or use dev mode)
5. Test the full flow: endorse -> verify -> admin -> export

## 7. SMS Integration

The OTP system currently returns the OTP in the API response for development. To send real SMS:

### Twilio
1. Sign up at https://twilio.com
2. Get a phone number
3. Add Twilio credentials to `.env.local`
4. Update `src/app/api/otp/send/route.ts` to call Twilio API

### Africa's Talking
1. Sign up at https://africastalking.com
2. Get API key and username
3. Update the OTP send route to use Africa's Talking API

## 8. Admin Access

1. Go to `/admin`
2. Log in with the email from `admin_users` table and `ADMIN_PASSWORD`
3. Manage endorsements, view stats, export reports

## 9. Security Checklist

- [ ] Change default admin password
- [ ] Enable Supabase Row Level Security (included in schema)
- [ ] Set up proper SMS provider
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Review and update rate limits
- [ ] Set up audit log monitoring
- [ ] Add CAPTCHA for endorsement form (recommended: hCaptcha or reCAPTCHA)

## 10. Maintenance

- Monitor Supabase dashboard for usage
- Review flagged endorsements regularly
- Update campaign dates and targets as needed
- Back up database regularly (Supabase does this automatically)
