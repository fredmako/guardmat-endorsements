# Guardmat Endorsements — Comprehensive Test Plan

**Application**: Guardmat Community School Feeding Initiative — Endorsement Platform  
**URL**: https://guardmat-endorsements.onrender.com  
**Stack**: Next.js 16 + Supabase + Render (free tier)  
**Date**: 2026-10-08  

---

## 1. Test Environment

| Item | Value |
|------|-------|
| Base URL | https://guardmat-endorsements.onrender.com |
| Supabase Project | (to be configured) |
| Admin Email | admin@makori.com |
| Admin Password | (from ADMIN_PASSWORD env var) |
| Test Phone | +254700000001 |
| Test School | Kisii Primary School |

---

## 2. Pre-Deployment Checklist

- [ ] Render service deployed and running
- [ ] Environment variables set in Render dashboard:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] ADMIN_PASSWORD
  - [ ] NEXT_PUBLIC_APP_URL=https://guardmat-endorsements.onrender.com
- [ ] Supabase schema applied (schools, endorsements, campaigns, analytics_events, otp_verifications, admin_users, audit_logs)
- [ ] Supabase RLS policies configured
- [ ] Admin user inserted into admin_users table
- [ ] Test school(s) inserted into schools table
- [ ] Active campaign created in campaigns table

---

## 3. Public Page Tests

### 3.1 Home Page (`/`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | Page loads | Navigate to `/` | 200 OK, no console errors | [ ] |
| 1.2 | Hero section | View hero | Title "Community School Feeding Initiative" visible, CTA buttons present | [ ] |
| 1.3 | About section | Scroll to #about | 3 cards visible (Better Learning, Healthier Children, Stronger Community) | [ ] |
| 1.4 | Stats section | Scroll to #stats | Stats load from API (or show "No stats available" if empty) | [ ] |
| 1.5 | Schools section | Scroll to #schools | Schools list loads from API | [ ] |
| 1.6 | CTA section | Scroll to bottom | "Ready to Make a Difference?" section with Endorse Now button | [ ] |
| 1.7 | Navigation | Click Header links | About, Schools, Stats scroll to sections; Support Now goes to /endorse | [ ] |
| 1.8 | Footer | View footer | Quick links, Contact info, copyright visible | [ ] |
| 1.9 | Responsive | Test mobile viewport (375px) | Hamburger menu or mobile Support button visible | [ ] |

### 3.2 Endorse Page (`/endorse`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 2.1 | Page loads | Navigate to `/endorse` | 200 OK, form visible | [ ] |
| 2.2 | School dropdown | View dropdown | Schools load from /api/schools | [ ] |
| 2.3 | Form validation | Submit empty form | Error "Please fill in all required fields" | [ ] |
| 2.4 | Fill form | Enter name, phone, select school, check consent | All fields accept input | [ ] |
| 2.5 | Send OTP | Click "Send OTP" | POST /api/otp/send called, OTP step shown, devOtp displayed | [ ] |
| 2.6 | OTP step | View OTP input | OTP input field visible, "Verify & Submit" button | [ ] |
| 2.7 | Invalid OTP | Enter wrong OTP | Error "Invalid OTP" | [ ] |
| 2.8 | Correct OTP | Enter correct OTP | POST /api/otp/verify, then POST /api/endorse | [ ] |
| 2.9 | Success | After verification | Success step with endorsement ID displayed | [ ] |
| 2.10 | Duplicate prevention | Submit same phone+school again | Error "You have already endorsed this school" (409) | [ ] |

### 3.3 School Endorsement Page (`/endorse/[slug]`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 3.1 | Page loads | Navigate to `/endorse/kisii-primary` | 200 OK, school name pre-selected | [ ] |
| 3.2 | Invalid slug | Navigate to `/endorse/nonexistent` | "School not found" or empty state | [ ] |
| 3.3 | Form submission | Fill and submit | Same flow as /endorse but school pre-selected | [ ] |

### 3.4 Verify Page (`/verify`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 4.1 | Page loads | Navigate to `/verify` | 200 OK, input field visible | [ ] |
| 4.2 | Verify with ID | Enter endorsement ID, submit | GET /api/endorse?id=xxx, result displayed | [ ] |
| 4.3 | Invalid ID | Enter fake ID | Error "Endorsement not found" (404) | [ ] |
| 4.4 | Verified endorsement | Verify a real endorsed ID | Shows school name, parent name, verified status | [ ] |
| 4.5 | Flagged endorsement | Verify a flagged ID | Shows "revoked" status | [ ] |
| 4.6 | URL param | Navigate to `/verify?id=GUARDMAT-END-2026-XXXXXX` | Auto-verifies on load | [ ] |

### 3.5 Share Page (`/share`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 5.1 | Page loads | Navigate to `/share` | 200 OK, share buttons visible | [ ] |
| 5.2 | Social buttons | View buttons | WhatsApp, Facebook, X, LinkedIn, Telegram, Copy Link | [ ] |
| 5.3 | Copy link | Click Copy Link | Link copied to clipboard, "Copied!" feedback | [ ] |

### 3.6 QR Generator Page (`/qr-generator`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 6.1 | Page loads | Navigate to `/qr-generator` | 200 OK, QR code canvas visible | [ ] |
| 6.2 | Default QR | View initial QR | QR code for main campaign URL | [ ] |
| 6.3 | School QR | Enter school slug, click Generate | QR code updates to school-specific URL | [ ] |

### 3.7 Campaign Planner Page (`/campaign-planner`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 7.1 | Page loads | Navigate to `/campaign-planner` | 200 OK, week tabs visible | [ ] |
| 7.2 | Week navigation | Click Week 1-4 tabs | Content changes per week | [ ] |

### 3.8 Privacy Page (`/privacy`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 8.1 | Page loads | Navigate to `/privacy` | 200 OK, privacy policy content visible | [ ] |

---

## 4. Admin Page Tests

### 4.1 Admin Login (`/admin`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | Page loads | Navigate to `/admin` | 200 OK, login form visible | [ ] |
| 1.2 | Empty login | Submit empty form | Error "Email and password are required" | [ ] |
| 1.3 | Invalid credentials | Enter wrong email/password | Error "Invalid credentials" (401) | [ ] |
| 1.4 | Valid login | Enter correct email/password | Authenticated, dashboard loads | [ ] |
| 1.5 | Endorsements list | View after login | Table of endorsements with pagination | [ ] |
| 1.6 | Search | Enter search text | Filters by parent name, endorsement ID, or phone | [ ] |
| 1.7 | Filter by school | Select school dropdown | Filters endorsements by school | [ ] |
| 1.8 | Filter by verified | Select verified filter | Shows only verified/unverified | [ ] |
| 1.9 | Filter by flagged | Select flagged filter | Shows only flagged/unflagged | [ ] |
| 1.10 | Pagination | Click next/previous page | Page changes, data updates | [ ] |
| 1.11 | Flag endorsement | Click flag on an endorsement | PATCH /api/admin/endorsements/flag, endorsement flagged | [ ] |
| 1.12 | Unflag endorsement | Click unflag | Endorsement unflagged | [ ] |

### 4.2 Admin Analytics (`/admin/analytics`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 2.1 | Page loads | Navigate to `/admin/analytics` | 200 OK | [ ] |
| 2.2 | Fetch stats | Click Refresh | GET /api/admin/analytics, stats displayed | [ ] |
| 2.3 | Stats display | View stats | Total, verified, flagged, today, week, month counts | [ ] |

### 4.3 Admin Campaigns (`/admin/campaigns`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 3.1 | Page loads | Navigate to `/admin/campaigns` | 200 OK, campaigns list | [ ] |
| 3.2 | Add campaign | Fill form, submit | POST /api/campaigns, new campaign in list | [ ] |
| 3.3 | Validation | Submit empty form | Error "Missing required fields" | [ ] |

### 4.4 Admin Reports (`/admin/reports`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 4.1 | Page loads | Navigate to `/admin/reports` | 200 OK, date pickers visible | [ ] |
| 4.2 | Generate report | Select dates, click Generate | GET /api/admin/reports, report data displayed | [ ] |
| 4.3 | Export CSV | Click Export CSV | GET /api/admin/export?format=csv, CSV file downloaded | [ ] |
| 4.4 | Export JSON | Click Export JSON | GET /api/admin/export?format=json, JSON downloaded | [ ] |

### 4.5 Admin Schools (`/admin/schools`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 5.1 | Page loads | Navigate to `/admin/schools` | 200 OK, schools list | [ ] |
| 5.2 | Add school | Fill form, submit | POST /api/schools, new school in list | [ ] |
| 5.3 | Validation | Submit empty form | Error "Missing required fields" | [ ] |

### 4.6 Admin Settings (`/admin/settings`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 6.1 | Page loads | Navigate to `/admin/settings` | 200 OK, settings form | [ ] |
| 6.2 | Save settings | Modify and save | POST /api/admin/settings, success message | [ ] |

### 4.7 Admin Users (`/admin/users`)

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 7.1 | Page loads | Navigate to `/admin/users` | 200 OK, users list | [ ] |
| 7.2 | Add user | Fill form, submit | POST /api/admin/users, new user in list | [ ] |
| 7.3 | Validation | Submit empty form | Error "Missing required fields" | [ ] |

---

## 5. API Endpoint Tests

### 5.1 Public APIs

| # | Endpoint | Method | Test | Expected | Status |
|---|----------|--------|------|----------|--------|
| 1.1 | /api/schools | GET | Fetch schools | 200, { schools: [...] } | [ ] |
| 1.2 | /api/campaign | GET | Fetch campaign stats | 200, { schools, stats, recentEndorsements } | [ ] |
| 1.3 | /api/campaigns | GET | Fetch active campaign | 200, { campaign: {...} } | [ ] |
| 1.4 | /api/endorse | POST | Submit endorsement | 201, { success, endorsementId } | [ ] |
| 1.5 | /api/endorse | POST | Missing fields | 400, { error: "Missing required fields" } | [ ] |
| 1.6 | /api/endorse | POST | Invalid phone | 400, { error: "Invalid phone number" } | [ ] |
| 1.7 | /api/endorse | POST | Duplicate | 409, { error: "You have already endorsed this school" } | [ ] |
| 1.8 | /api/endorse | GET | Verify by ID | 200, { endorsementId, schoolName, ... } | [ ] |
| 1.9 | /api/endorse | GET | Invalid ID | 404, { error: "Endorsement not found" } | [ ] |
| 1.10 | /api/otp/send | POST | Send OTP | 200, { success, devOtp } | [ ] |
| 1.11 | /api/otp/send | POST | Invalid phone | 400, { error: "Invalid phone number format" } | [ ] |
| 1.12 | /api/otp/verify | POST | Verify OTP | 200, { success: true } | [ ] |
| 1.13 | /api/otp/verify | POST | Wrong OTP | 400, { error: "Invalid OTP" } | [ ] |
| 1.14 | /api/otp/verify | POST | Expired OTP | 400, { error: "OTP has expired" } | [ ] |
| 1.15 | /api/otp/verify | POST | Too many attempts | 400, { error: "Too many attempts" } | [ ] |
| 1.16 | /api/analytics/track | POST | Track event | 200, { success: true } | [ ] |
| 1.17 | /api/analytics/track | POST | Invalid event type | 400, { error: "Invalid event type" } | [ ] |
| 1.18 | /api/rate-limit | GET | Check rate limit | 200, { allowed: true, remaining: N } | [ ] |
| 1.19 | /api/rate-limit | GET | Exceed limit | 429, { allowed: false } | [ ] |
| 1.20 | /api/schools/[slug] | GET | Get school by slug | 200, { school: { id, name, slug, endorsementCount } } | [ ] |
| 1.21 | /api/schools/[slug] | GET | Invalid slug | 404, { error: "School not found" } | [ ] |
| 1.22 | /api/schools/qr | GET | Get QR URL | 200, { school, qrUrl } | [ ] |
| 1.23 | /api/endorse/verify | GET | Verify endorsement | 200, { endorsementId, status, ... } | [ ] |
| 1.24 | /api/endorse/school | POST | Submit with referral | 201, { success, endorsementId } | [ ] |

### 5.2 Admin APIs (require Bearer token auth)

| # | Endpoint | Method | Test | Expected | Status |
|---|----------|--------|------|----------|--------|
| 2.1 | /api/admin/login | POST | Valid login | 200, { success, email, role } | [ ] |
| 2.2 | /api/admin/login | POST | Invalid login | 401, { error: "Invalid credentials" } | [ ] |
| 2.3 | /api/admin/endorsements | GET | List endorsements | 200, { endorsements, total, page, totalPages } | [ ] |
| 2.4 | /api/admin/endorsements | GET | With search param | Filtered results | [ ] |
| 2.5 | /api/admin/endorsements | GET | With schoolId param | Filtered by school | [ ] |
| 2.6 | /api/admin/endorsements | GET | With verified param | Filtered by verified status | [ ] |
| 2.7 | /api/admin/endorsements | GET | With flagged param | Filtered by flagged status | [ ] |
| 2.8 | /api/admin/endorsements | GET | No auth | 401, { error: "Unauthorized" } | [ ] |
| 2.9 | /api/admin/endorsements/flag | PATCH | Flag endorsement | 200, { success: true } | [ ] |
| 2.10 | /api/admin/endorsements/flag | PATCH | Revoke endorsement | 200, { success: true } | [ ] |
| 2.11 | /api/admin/endorsements/flag | PATCH | Unflag endorsement | 200, { success: true } | [ ] |
| 2.12 | /api/admin/endorsements/flag | PATCH | Invalid action | 400, { error: "Invalid action" } | [ ] |
| 2.13 | /api/admin/campaigns | GET | List campaigns | 200, { campaigns: [...] } | [ ] |
| 2.14 | /api/admin/campaigns/create | POST | Create campaign | 201, { success, campaign } | [ ] |
| 2.15 | /api/admin/export | GET | Export CSV | 200, CSV file download | [ ] |
| 2.16 | /api/admin/export | GET | Export JSON | 200, JSON response | [ ] |
| 2.17 | /api/admin/reports | GET | Generate report | 200, { summary, bySchool, byMonth, endorsements } | [ ] |
| 2.18 | /api/admin/settings | GET | Get settings | 200, { settings: {...} } | [ ] |
| 2.19 | /api/admin/settings | POST | Update settings | 200, { success: true } | [ ] |
| 2.20 | /api/admin/users | GET | List users | 200, { users: [...] } | [ ] |
| 2.21 | /api/admin/users | POST | Add user | 201, { success, user } | [ ] |
| 2.22 | /api/admin/analytics | GET | Get analytics | 200, { summary, bySchool, byMonth } | [ ] |
| 2.23 | /api/admin/pdf | GET | Single PDF | 200, PDF download | [ ] |
| 2.24 | /api/admin/pdf | GET | Bulk PDF | 200, PDF download | [ ] |
| 2.25 | /api/admin/pdf | GET | Invalid ID | 404, { error: "Endorsement not found" } | [ ] |
| 2.26 | /api/schools/create | POST | Create school | 201, { success, school } | [ ] |

---

## 6. Security Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | SQL injection | Enter `' OR 1=1 --` in search | No SQL error, normal response | [ ] |
| 1.2 | XSS in endorsement message | Submit `<script>alert(1)</script>` as message | Script not executed, stored as text | [ ] |
| 1.3 | XSS in school name | Create school with `<img onerror>` | Script not executed | [ ] |
| 1.4 | Auth bypass | Call admin API without token | 401 Unauthorized | [ ] |
| 1.5 | Auth bypass | Call admin API with fake token | 401 Unauthorized | [ ] |
| 1.6 | Rate limiting | Send 6+ requests to /api/rate-limit | 6th request returns 429 | [ ] |
| 1.7 | OTP brute force | Enter wrong OTP 5 times | "Too many attempts" error | [ ] |
| 1.8 | OTP expiry | Wait 10+ minutes, try OTP | "OTP has expired" error | [ ] |

---

## 7. Performance Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | Home page load | Measure TTFB | < 2s (after cold start) | [ ] |
| 1.2 | API response time | Measure /api/schools | < 500ms | [ ] |
| 1.3 | Endorsement submission | Measure full flow | < 3s | [ ] |
| 1.4 | Admin list load | Measure /api/admin/endorsements | < 1s | [ ] |

---

## 8. Cold Start Test

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | Cold start | Wait 15+ min, then request | Service spins up, responds within 30s | [ ] |
| 1.2 | Health check | Request / after cold start | 200 OK | [ ] |

---

## 9. PDF Generation Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | Single PDF | GET /api/admin/pdf?id=XXX | Valid PDF downloaded | [ ] |
| 1.2 | PDF content | Open PDF | Certificate with correct name, school, ID | [ ] |
| 1.3 | Bulk PDF | GET /api/admin/pdf | Multi-page PDF with all endorsements | [ ] |
| 1.4 | PDF with message | Endorse with message, generate PDF | Message appears in quote box | [ ] |

---

## 10. Integration Tests

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1.1 | Full endorsement flow | Endorse -> Verify -> Admin sees it | Endorsement appears in admin list | [ ] |
| 1.2 | Campaign stats update | Endorse -> Check home page stats | Stats increment | [ ] |
| 1.3 | Flag flow | Admin flags -> Verify shows revoked | Verify page shows "revoked" | [ ] |
| 1.4 | Export flow | Admin exports CSV | CSV contains correct data | [ ] |
| 1.5 | Settings update | Admin updates campaign -> Home reflects | Home page shows new campaign name/dates | [ ] |

---

## 11. Known Issues / Limitations

1. **QR Code is placeholder** — The QR code component draws a static pattern, not a real QR code. Needs a library like `qrcode` or `react-qr-code`.
2. **OTP returned in response** — The dev OTP is returned in the API response. This must be removed in production and replaced with SMS.
3. **Admin auth is simple** — Admin login uses plain password comparison. Needs bcrypt + JWT in production.
4. **No CAPTCHA** — The endorsement form has no CAPTCHA protection.
5. **Rate limit is in-memory** — The rate limiter uses a Map that resets on service restart.
6. **No audit log for admin actions** — Only flag/revoke/unflag actions are logged to audit_logs.
7. **SOCIAL_SHARE_URL hardcoded** — Points to Vercel URL, not Render URL.
8. **PDF footer hardcoded** — Points to Vercel URL in PDF generation.

---

## 12. Test Execution Summary

| Category | Total Tests | Passed | Failed | Skipped |
|----------|-------------|--------|--------|---------|
| Public Pages | 30 | | | |
| Admin Pages | 25 | | | |
| API Endpoints | 50 | | | |
| Security | 8 | | | |
| Performance | 4 | | | |
| Cold Start | 2 | | | |
| PDF Generation | 4 | | | |
| Integration | 5 | | | |
| **TOTAL** | **128** | | | |

---

## 13. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA Lead | | | |
| Product Owner | | | |
