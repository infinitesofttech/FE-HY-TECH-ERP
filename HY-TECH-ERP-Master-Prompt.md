# MASTER BUILD PROMPT — "HY-TECH" ERP Frontend (Paste this whole file into Google Antigravity)

You are an expert senior full-stack product engineer and UI/UX designer. Build a **complete, production-grade, premium ERP web application** frontend for a government-document service center called **HY-TECH**. This business helps families/customers apply for and manage Aadhar Card, Voter ID, PAN Card, Ration Card, Ayushman Card, and ABHA Card services, tracks visits, documents, payments (with a loyalty points + wallet system), reminders/follow-ups, and pending government work.

I will give you a fully working Django REST backend (currently running locally, will later be deployed live). You must build **100% of the frontend** — I should not have to write a single line of code myself. Do everything: architecture, API integration, state management, routing, UI, animations, responsive design, and polish.

---

## 1. NON-NEGOTIABLE RULE #1 — CENTRALIZED, SWAP-SAFE API CONFIGURATION

This is the most important requirement. The backend currently lives at `http://127.0.0.1:8000` but **will move to a live production domain later**. When that happens, I must be able to switch environments **by changing exactly ONE value, in ONE place** — no endpoint should ever be hardcoded anywhere else in the codebase.

Implement it like this:

```
/src
  /api
    client.ts        <-- the ONLY file that knows the base URL
    endpoints.ts      <-- ALL relative paths as named constants, grouped by module
    auth.ts           <-- token storage, attach/refresh logic
    services/         <-- one file per resource, each imports from client.ts + endpoints.ts
      customerService.ts
      familyMemberService.ts
      documentService.ts
      serviceVisitService.ts
      baseServiceService.ts
      subServiceService.ts
      requiredDocumentService.ts
      transactionService.ts
      reminderService.ts
      pendingWorkService.ts
      employeeService.ts
      dashboardService.ts
      authService.ts
.env / .env.local
  VITE_API_BASE_URL=http://127.0.0.1:8000   (or REACT_APP_/NEXT_PUBLIC_ equivalent for your chosen framework)
```

Rules:
- `client.ts` reads `BASE_URL` **only** from the environment variable. Every other file imports the shared axios/fetch instance from `client.ts` — nothing else ever constructs a URL manually.
- `endpoints.ts` stores every path as a constant/function (e.g. `CUSTOMERS = '/customers/'`, `CUSTOMER_DETAIL = (familyId) => \`/customers/${familyId}/\``). No raw path strings anywhere else in the app.
- Attach the JWT `access` token as `Authorization: Bearer <token>` automatically via an axios interceptor in `client.ts`.
- On `401`, attempt a silent token refresh using the stored `refresh` token (see Auth section) before failing.
- Add a visible "Environment" indicator in Settings (Admin only) showing the active `BASE_URL`, read-only, purely for confirmation — never editable from the UI (only via `.env`).

---

## 2. TECH STACK (use this unless you have strong reason otherwise, then explain briefly)

- **React 18 + TypeScript + Vite**
- **TailwindCSS** + **shadcn/ui** for components
- **Framer Motion** for animation/transitions
- **TanStack Query (React Query)** for all server-state (caching, refetch, optimistic updates, loading/error states) — do NOT hand-roll fetch logic in components
- **React Router v6** for routing + role-based route guards
- **Axios** for HTTP with the interceptor described above
- **Recharts** for dashboard charts
- **React Hook Form + Zod** for all forms and validation
- **date-fns** for date handling
- **Sonner** or shadcn `toast` for notifications
- Support **Gujarati + English** UI strings via a simple i18n dictionary (the backend already stores some `message_template` fields in Gujarati — display them as-is, don't translate backend content)

---

## 3. USER ROLES & AUTHENTICATION

There are **three distinct login flows** hitting different endpoints but a shared logout. Build a role-aware app shell:

| Role | Login Endpoint | Body | Notes |
|---|---|---|---|
| Admin | `POST /auth/staff/login/` | `{username, password}` | Response `user_type: "admin"`, full access to everything incl. Employee Management, Service/SubService/RequiredDocument config |
| Staff | `POST /auth/staff/login/` | `{username, password}` | Response `user_type: "employee"`, operational access (customers, visits, documents, transactions, reminders, pending work) — NOT employee management or service-catalog editing |
| Customer | `POST /auth/customer/login/` | `{family_id, mobile_number, password}` | Response `user_type: "customer"`, self-service portal only (own profile, own family members, own documents, own visits/history, own points/wallet, own reminders) |
| Logout (shared) | `POST /auth/logout/` | — | Clears both tokens client + server side |

- All logins return `{ message, user_type, tokens: {refresh, access}, user|employee|customer }`. Store both tokens (httpOnly-style via memory + secure storage strategy — explain your choice, e.g. `access` in memory/context, `refresh` in `localStorage`), store `user_type` and the profile object in a global Auth context/store (Zustand or React Context — your call).
- Build **3 distinct login screens** (or one screen with a role tab-switcher) with premium branded design — logo placeholder "HY-TECH", tagline, subtle gradient/animated background.
- Route guards: `/admin/*`, `/staff/*`, `/customer/*` — redirect unauthenticated users to login; redirect wrong-role users to their own dashboard.
- Auto-logout + redirect on refresh-token failure.

---

## 4. FULL API REFERENCE (all relative to `BASE_URL` — wire every one of these into a real feature, nothing left unused)

### 4.1 Customers / Family Management
| Action | Method & Path | Body keys |
|---|---|---|
| List | `GET /customers/` | — |
| Create | `POST /customers/` | head_of_family, village_city, birth_date, mobile_number, whatsapp_number, family_member_count, referral_family_id, document_consent, password, notes |
| Detail | `GET /customers/{family_id}/` | — |
| Update | `PATCH /customers/{family_id}/` | same as create (partial) |
| Delete | `DELETE /customers/{family_id}/` | — |

Key fields to surface in UI: `family_id`, `head_of_family`, mobile/whatsapp, `family_member_count`, `village_city`, `current_points`, `wallet_balance`, `total_visits`, `last_visit`, `is_active`, `digital_card_sent`, `referral_family_id`.

### 4.2 Family Members
| Action | Method & Path | Body |
|---|---|---|
| List | `GET /customers/{family_id}/family-members/` | — |
| Add | `POST /customers/{family_id}/family-members/` | name, relationship, mobile_number, birth_date, is_active |
| Detail | `GET /customers/{family_id}/family-members/{id}/` | — |
| Update | `PATCH /customers/{family_id}/family-members/{id}/` | same |
| Delete | `DELETE /customers/{family_id}/family-members/{id}/` | — |

`relationship` is an enum (e.g. DAUGHTER, SON, WIFE, HUSBAND, FATHER, MOTHER — infer full set from a dropdown you design; make it configurable in one constants file).

### 4.3 Customer Documents
| Action | Method & Path |
|---|---|
| List | `GET /documents/{family_id}/{member_id}/` |
| Upload | `POST /documents/{family_id}/{member_id}/` (multipart: document_type, document_name, document_file, description, is_verified) |
| Detail | `GET /documents/{family_id}/{member_id}/{doc_id}/` |
| Update | `PATCH /documents/{family_id}/{member_id}/{doc_id}/` |
| Delete | `DELETE /documents/{family_id}/{member_id}/{doc_id}/` |

`document_type` enum includes at least: AADHAR, VOTER_ID, PAN, RATION_CARD, BIRTH_CERTIFICATE, CASTE_CERTIFICATE, INCOME_CERTIFICATE, DRIVING_LICENSE, PHOTO, OTHER. Build a document viewer/preview (image/pdf) + verified badge toggle.

### 4.4 Service Visits (with dynamic document checklist)
| Action | Method & Path | Notes |
|---|---|---|
| Create | `POST /customers/service-visits/` | body: customer, family_member, service, sub_service, checked_by, remarks → response auto-generates a `documents[]` checklist (from the sub-service's required documents) with per-doc `status: AVAILABLE / NOT_AVAILABLE` |
| List | `GET /customers/service-visits/?search=&service=` | supports search + filter by service; list view shows `total_documents` vs `available_documents` progress |
| Detail | `GET /customers/service-visits/{visit_no}/` | — |
| Update | `PATCH /customers/service-visits/{visit_no}/` | — |
| Update one checklist doc + upload file | `PATCH /customers/service-visits/{visit_no}/documents/{doc_id}/` | multipart upload → also creates/updates a matching `customer_document` |
| Delete | `DELETE /customers/service-visits/{visit_no}/` | — |

Build this as a **wizard**: (1) pick customer/family member → (2) pick service → sub-service (cascading dropdowns fed by 4.5/4.6) → (3) auto-generated checklist appears live with upload buttons + AVAILABLE/NOT_AVAILABLE toggle per document → (4) remarks + submit. Visit list should show a progress ring/bar (available/total documents) and a status badge (PENDING/etc — infer enum).

### 4.5 Base Services
`GET/POST /services/`, `GET/PATCH/DELETE /services/{id}/` — `ServiceName`, `Description`, `IsActive`, nested `SubServices[]`. Admin-only CRUD; everyone else read-only (used as dropdown source).

### 4.6 Sub-Services
`GET/POST /services/sub-services/`, `GET/PATCH/DELETE /services/sub-services/{id}/` — `Service` (FK), `SubServiceName`, `Description`, `IsActive`, nested `RequiredDocuments[]`. Admin-only CRUD.

### 4.7 Required Documents
`GET/POST /services/required-documents/`, `GET/PATCH/DELETE /services/required-documents/{id}/` — `SubService` (FK), `DocumentName`, `document_type`, `IsRequired`. Admin-only CRUD; this drives the auto-checklist in 4.4.

Build a nested "Service Catalog Manager" (Admin only): tree/accordion view — Service → Sub-Services → Required Documents, all inline-editable, drag-free simple CRUD with modals.

### 4.8 Transactions (billing, points, wallet)
| Action | Method & Path |
|---|---|
| List | `GET /services/transactions/` |
| Create | `POST /services/transactions/` (customer, service, sub_service, bill_amount, points_earned, points_redeemed, wallet_credit, wallet_used, payment_mode, staff, remarks) |
| Detail | `GET /services/transactions/{id}/` |
| Update | `PATCH /services/transactions/{id}/` |
| Delete | `DELETE /services/transactions/{id}/` |

`payment_mode` enum: CASH, ONLINE/UPI, CARD (infer reasonable set). Show `net_wallet_change` computed value. Build a billing form with live computed totals (bill − wallet_used + wallet_credit, points math) before submit.

### 4.9 Reminders & Follow-ups
| Action | Method & Path |
|---|---|
| Create | `POST /reminders/` |
| List | `GET /reminders/` |
| Detail | `GET /reminders/{reminder_no}/` |
| Update | `PATCH /reminders/{reminder_no}/` |
| Delete | `DELETE /reminders/{reminder_no}/` |
| List follow-ups | `GET /reminders/{reminder_no}/follow-ups/` |
| Add follow-up | `POST /reminders/{reminder_no}/follow-ups/` |

Fields: `reminder_type` (SERVICE_READY, FOLLOW_UP, …), `subject`, `due_date`, `reminder_date`, `priority` (HIGH/MEDIUM/LOW), `message_template` (often Gujarati — render with a Gujarati-capable font), `follow_up_status` (PENDING/IN_PROGRESS/DONE), `customer_response`, `next_follow_up`. Build a calendar/timeline view of reminders due today/this week, priority color-coding, and a follow-up log (like a mini CRM activity feed) on the detail page.

### 4.10 Pending Work
| Action | Method & Path |
|---|---|
| List | `GET /pending-work/` |
| Create | `POST /pending-work/` |
| Summary | `GET /pending-work/summary/` → `{total, pending, in_progress, blocked, completed, high_priority, overdue}` |
| Detail | `GET /pending-work/{pending_no}/` |
| Update | `PATCH /pending-work/{pending_no}/` |
| Delete | `DELETE /pending-work/{pending_no}/` |

Build this as a **Kanban board** (columns = `work_status`: PENDING / IN_PROGRESS / BLOCKED / COMPLETED) with drag-and-drop that fires a `PATCH`. Summary numbers power a stat-cards row above the board.

### 4.11 Dashboard
`GET /dashboard/` → `{today_summary, business_summary, customer_summary}`. Build the Admin/Staff home page around this: animated stat cards + at least 2 charts (e.g., billing trend, service-type breakdown) using data you derive from transactions/services lists (the endpoint gives current snapshot numbers; supplement with client-side aggregation from list endpoints for trend charts).

### 4.12 Employee Management (Admin only)
`GET/POST /auth/employees/`, `GET/PATCH/DELETE /auth/employees/{id}/` — username, password, full_name, email, mobile_number, role (STAFF/ADMIN), is_active.

---

## 5. SCREENS TO BUILD (minimum set — feel free to enrich)

**Shared**
- Branded multi-role Login screen
- Global app shell: collapsible sidebar (role-aware nav), topbar (search, notifications bell for due reminders, profile menu, logout)
- Toast notifications for every create/update/delete success or failure
- 404 / empty-state / error-state / loading-skeleton components used everywhere consistently

**Admin**
- Dashboard (charts + stat cards)
- Customers (list w/ search+filter+pagination → detail tabs: Profile / Family Members / Documents / Visit History / Transactions / Reminders)
- Service Visits (list + wizard create + detail w/ live checklist)
- Service Catalog Manager (Services → Sub-Services → Required Documents)
- Transactions (list + billing form + detail)
- Reminders & Follow-ups (calendar/list + detail w/ activity feed)
- Pending Work (Kanban + summary cards)
- Employee Management
- Settings (shows active API base URL, read-only)

**Staff** — same as Admin minus Service Catalog Manager and Employee Management.

**Customer Portal**
- My Dashboard (points, wallet, family summary)
- My Family Members (view; edit if allowed)
- My Documents
- My Visit History & status
- My Reminders

---

## 6. PREMIUM UI/UX REQUIREMENTS

This must NOT look like a generic admin template. Design intent:

- Clean, modern, slightly editorial visual identity — pick a cohesive palette (e.g. deep indigo/teal primary + warm accent), generous whitespace, real typographic hierarchy (a distinctive heading font paired with a clean body font — avoid default system fonts).
- **Micro-interactions everywhere**: button press states, input focus glow, hover elevation on cards, animated number counters on stat cards, skeleton shimmer while loading, smooth route transitions (Framer Motion `AnimatePresence`).
- **Meaningful motion, not decoration**: e.g. the document checklist items animate from NOT_AVAILABLE → AVAILABLE with a check-pop animation; Kanban cards animate on drag/drop; toasts slide in/out; modals scale+fade.
- Data tables: sticky header, sortable columns, column-level filters, pagination, row hover highlight, empty state illustration when no data.
- Forms: inline validation (Zod), disabled submit until valid, loading spinner in submit button, optimistic UI where safe.
- Fully responsive (desktop-first ERP, but usable on tablet/mobile for staff on the move).
- Support the Gujarati text present in real data (e.g. reminder templates) with proper font rendering — don't break layout with longer Gujarati strings.
- Dark mode toggle (persist preference).
- Accessible: proper labels, focus rings, sufficient contrast.

---

## 7. STATE, ERRORS & EDGE CASES

- Every API call goes through TanStack Query — define query keys per resource, invalidate related queries after mutations (e.g. creating a service-visit invalidates the visits list AND the pending-work summary AND dashboard).
- Central error boundary + per-request error toast with the backend's `message`/`detail` field surfaced to the user.
- Handle empty backend responses, 401 (redirect to login), 404 (friendly not-found state), 500 (retry button).
- File uploads: show upload progress bar, file-type/size validation client-side before sending multipart requests.

---

## 8. DELIVERABLE CHECKLIST (confirm all before finishing)

- [ ] Single `.env` variable controls 100% of API calls — verified by grepping for `127.0.0.1` or any hardcoded URL (there should be ZERO outside `client.ts`/`.env`)
- [ ] All 3 login flows + logout implemented and working against the real endpoints
- [ ] Every endpoint listed in Section 4 is wired to a real, reachable UI feature
- [ ] Role-based routing/guards enforced
- [ ] Dashboard, Kanban, calendar/reminder views, service-visit wizard with live checklist, and service catalog manager all functional
- [ ] Consistent loading/empty/error states across the app
- [ ] Animations implemented per Section 6, not just static screens
- [ ] Fully responsive layout tested at desktop/tablet/mobile widths
- [ ] No placeholder/dummy data left in production code paths — everything reads/writes through the real API

Build the entire application now. Ask me only if something in the API behavior is genuinely ambiguous (e.g. an enum's full value list) — otherwise make sensible, well-documented assumptions and proceed.
