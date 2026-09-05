# HY-TECH ERP — Complete System Architecture & Project Documentation

> **Purpose of this document**: This is the single source of truth for the **HY-TECH ERP Frontend Application**. Any AI system, engineering team, or developer can read this file to fully understand the business logic, architecture, tech stack, data models, routes, features, and recent upgrades implemented in this codebase.

---

## 1. Executive Summary & Business Domain

### What is HY-TECH ERP?
**HY-TECH** is a specialized government document and citizen facilitation center based in Gujarat, India. The center assists citizens and rural/urban households in applying for, managing, updating, and collecting critical government-issued documents and scheme benefits, including:
- **Aadhaar Card** (New Enrolment, Biometric Update, Address Update, Mobile Link)
- **PAN Card** (New PAN, Correction, Reprint)
- **Voter ID / Election Card** (New Registration, Address Change)
- **Ration Card** (Name Addition, Split, New Card)
- **Ayushman Bharat Health Card (PMJAY)** & **ABHA Health ID**
- **Birth & Death Certificates** (QR-enabled digital verifications)
- **Income & Caste Certificates**

### Business Workflow
1. **Citizen Registration**: A household is registered with a unique Family ID (e.g., `HTF-000001`) under the Head of Family. Family members (dependents, spouse, children) are added under the same household.
2. **Digital Document Vault**: Citizen documents (Aadhaar, Ration Card, Birth Certificate, etc.) are scanned and stored in a secure digital vault with verification flags (`is_verified`).
3. **Service Intake (Visits)**: When a citizen arrives at the desk, a **Service Visit** is created. The system automatically inspects the customer's digital vault against mandatory required documents for that service, marking present documents as `AVAILABLE` and missing ones as `NOT_AVAILABLE`. Staff can upload missing documents on the spot.
4. **Government Processing & Holdup Tracking (Pending Work)**: If an application is pending with government servers (UIDAI, Revenue department, etc.), a **Pending Work Ticket** is opened with SLA dates, holdup reasons, missing documents, assigned staff officers, and Kanban stages.
5. **Citizen Notifications & Follow-ups (Reminders & CRM)**: The system schedules reminders and follow-up calls with Gujarati SMS templates (e.g., *"તમારી સેવા તૈયાર છે. HY-TECH સેવા કેન્દ્રની મુલાકાત લો"*). Staff log phone call responses and future follow-up dates in a dedicated CRM.
6. **Billing, Wallet & Loyalty**: Citizen pays for services via Cash, UPI, or Digital Wallet, earning loyalty points that can be redeemed on future visits.

---

## 2. Technology Stack & Design System

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, Server & Client Components)
- **Language**: TypeScript (Strict type checking, `0` compilation errors)
- **Styling**: Tailwind CSS with custom HSL theme tokens, glassmorphism, smooth gradients, and dark mode support
- **State Management & Data Fetching**: [TanStack React Query v5](https://tanstack.com/query/latest) for server state, automated caching, refetching, and optimistic updates
- **HTTP Client**: [Axios](https://axios-http.com/) configured with request/response interceptors, centralized endpoints, and token refresh
- **Icons**: [Lucide React](https://lucide.dev/) (consistent, modern iconography)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) toast system for rich feedback
- **Localization (i18n)**: Custom `LanguageContext` supporting **English (`en`)** and **Gujarati (`gu`)** with reactive language switching across the entire UI

---

## 3. Swap-Safe API Architecture & Offline Fallback

The application follows a **zero-hardcoding, swap-safe API architecture**. Switching between a local Django development server and a remote live production backend requires changing exactly **one environment variable**:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Architecture Breakdown:
1. **`src/api/client.ts`**: The single Axios client instance. Reads `NEXT_PUBLIC_API_BASE_URL`. Automatically injects JWT Bearer tokens from localStorage on every request. Handles silent 401 token refresh.
2. **`src/api/endpoints.ts`**: A single centralized registry of all API route paths (e.g., `CUSTOMERS.LIST`, `SERVICE_VISITS.DETAIL(visitNo)`, `REMINDERS.UPDATE_FOLLOW_UP(reminderNo, followUpId)`).
3. **`src/api/services/`**: Modular service files per domain entity:
   - `customerService.ts`: Citizen household CRUD, search, update profile.
   - `familyMemberService.ts`: Household family member CRUD, update member.
   - `documentService.ts`: Customer digital vault upload, update metadata, delete.
   - `serviceVisitService.ts`: Service intake visits, automated doc checks, inline upload, update visit details.
   - `pendingWorkService.ts`: Government agency holdup tickets, Kanban status progress, update ticket.
   - `reminderService.ts`: Citizen notifications, update reminder, add/update/delete follow-up call logs.
   - `baseServiceService.ts`: Government catalog services, sub-services, required document rules.
   - `employeeService.ts`: Staff officers and operators management.
   - `transactionService.ts`: Billing receipts, payment modes, loyalty points.
   - `dashboardService.ts`: Executive overview stats and analytics.
   - `authService.ts`: User login, token refresh, current user profile.
4. **Resilient Offline Mock Fallback**:
   Every service method is wrapped in a `try-catch` block. If the Django REST API is running, it communicates with the live backend. If the backend is offline or in development without Django, it seamlessly falls back to in-memory reactive mock data (`src/api/mockData.ts`). Mutations update the in-memory array in real-time, allowing 100% of the UI to be demonstrated and tested without backend downtime.

---

## 4. Role-Based Access Control (RBAC)

The system supports three user roles managed via `AppShell` and route guards:
1. **`ADMIN`**:
   - Access to both `/admin/*` and general routes.
   - Full control over employees, staff accounts, financial reports, catalog services, system configuration, and data deletions.
2. **`STAFF` / `EMPLOYEE`**:
   - Access to `/staff/*` routes (mirrored from `/admin/*`).
   - Daily desk operations: Citizen onboarding, intake visits, document uploads, pending work Kanban updates, phone call logging.
   - Restricted from managing employee accounts or system-wide settings.
3. **`CUSTOMER`**:
   - Access to citizen self-service portal (`/customer/*`).
   - View their own family members, uploaded digital vault documents, pending service applications, and loyalty wallet balance.

---

## 5. Complete Application Directory Structure

```text
src/
├── api/
│   ├── client.ts                 # Axios HTTP client with JWT interceptor
│   ├── endpoints.ts              # Centralized dictionary of API endpoints
│   ├── mockData.ts               # In-memory realistic initial mock datasets
│   └── services/                 # 12+ modular API domain services
│       ├── authService.ts
│       ├── baseServiceService.ts
│       ├── customerService.ts
│       ├── dashboardService.ts
│       ├── documentService.ts
│       ├── employeeService.ts
│       ├── familyMemberService.ts
│       ├── pendingWorkService.ts
│       ├── reminderService.ts
│       ├── serviceVisitService.ts
│       └── transactionService.ts
├── app/
│   ├── layout.tsx                # Root layout, ThemeProvider, QueryClientProvider, LanguageProvider
│   ├── page.tsx                  # Landing / login redirection
│   ├── login/page.tsx            # Modern glassmorphism login portal
│   ├── admin/
│   │   ├── dashboard/page.tsx    # Executive KPIs, charts, quick links
│   │   ├── customers/
│   │   │   ├── page.tsx          # Citizen directory, search, filter, add modal
│   │   │   └── [id]/page.tsx     # Comprehensive 6-tab citizen profile view
│   │   ├── family-members/
│   │   │   └── page.tsx          # Dedicated Family Members management section
│   │   ├── documents/
│   │   │   └── page.tsx          # Dedicated Digital Vault document management section
│   │   ├── visits/
│   │   │   └── page.tsx          # Service Visits intake wizard & auto vault doc check
│   │   ├── pending-work/
│   │   │   └── page.tsx          # 4-column luxury glass Kanban board with all fields
│   │   ├── reminders/
│   │   │   └── page.tsx          # Reminders & dedicated Follow-ups CRM dual tabs
│   │   ├── services/
│   │   │   └── page.tsx          # Government service catalog & sub-services
│   │   ├── transactions/
│   │   │   └── page.tsx          # Receipts, payments, loyalty wallet
│   │   ├── employees/
│   │   │   └── page.tsx          # Staff management & role assignment
│   │   ├── reports/
│   │   │   └── page.tsx          # Financial & operational analytics
│   │   └── settings/
│   │       └── page.tsx          # System settings & environment viewer
│   ├── staff/                    # Front-desk operator portal routes (mirrored from admin)
│   │   ├── dashboard/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── family-members/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── visits/page.tsx
│   │   ├── pending-work/page.tsx
│   │   ├── reminders/page.tsx
│   │   ├── services/page.tsx
│   │   └── transactions/page.tsx
│   └── customer/                 # Citizen self-service portal
│       ├── dashboard/page.tsx
│       ├── documents/page.tsx
│       ├── visits/page.tsx
│       └── wallet/page.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Master layout wrapper with auth guard
│   │   ├── Sidebar.tsx           # Collapsible navigation with badge counts
│   │   └── TopNav.tsx            # Header with search, language switch, dark mode, user menu
│   └── ui/                       # Reusable UI component library
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ConfirmDialog.tsx
│       ├── DataTable.tsx
│       ├── EmptyState.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       ├── StatCard.tsx
│       └── Textarea.tsx
├── context/
│   ├── AuthContext.tsx           # User authentication & session state
│   ├── LanguageContext.tsx       # Bilingual dictionary & translation hooks (en/gu)
│   └── ThemeContext.tsx          # Dark / Light theme toggle
└── types/
    └── index.ts                  # Centralized TypeScript models & interfaces
```

---

## 6. Detailed Feature & Module Documentation

### Module 1: Citizen & Customer Management
- **Directory**: `/admin/customers`
  - Search by Family ID (`HTF-000001`), Head of Family name, mobile number, or village/city.
  - KPI StatCards: Total Households, Verified Citizens, BPL/AAY Cardholders, Active Applications.
  - "Add Citizen Household" wizard with auto-generated Family ID.
- **Detailed 6-Tab Citizen Profile**: `/admin/customers/[id]`
  - **Tab 1 — Household Overview**: Family head details, contact info, physical address, ration card category, and **"Edit Customer Profile"** modal (`customerService.updateCustomer`).
  - **Tab 2 — Family Members**: List of enrolled dependents, relations, Aadhaar status, **"Add Member"** modal, and **"Edit Member"** modal (`familyMemberService.updateMember`).
  - **Tab 3 — Digital Vault**: Uploaded government documents with preview, **"Upload Document"** modal, and **"Edit Document Details"** modal (`documentService.updateDocument`).
  - **Tab 4 — Service Visits**: Complete history of desk intake visits with document readiness progress bars.
  - **Tab 5 — Pending Work**: Government agency holdup tickets logged for this citizen.
  - **Tab 6 — Reminders & Follow-ups**: Scheduled collection dates, SMS notification templates, and call history.

### Module 2: Dedicated Family Members Management
- **Route**: `/admin/family-members` & `/staff/family-members`
- **Purpose**: Direct, centralized interface to manage all family members across all households in the ERP.
- **Features**:
  - KPI cards: Total Members, Aadhaar Verified, Heads of Household, Enrolled Dependents.
  - Search & Filters: Real-time search by member name, mobile, family ID; filter by household dropdown; filter by relationship (`HEAD`, `SPOUSE`, `SON`, `DAUGHTER`, `FATHER`, `MOTHER`, `BROTHER`, `SISTER`, `OTHER`).
  - **Add Family Member Modal**: Select citizen household, enter name, relation, mobile, date of birth, and Aadhaar card number.
  - **Edit Family Member Modal**: Update member details via `familyMemberService.updateMember`.
  - **Delete Confirmation Dialog**: Permanent removal confirmation with safety check.

### Module 3: Customer Digital Vault Management
- **Route**: `/admin/documents` & `/staff/documents`
- **Purpose**: Dedicated, high-security repository for citizen government documents.
- **Features**:
  - KPI cards: Total Documents, Verified Originals, Pending Review, Active Document Types.
  - Multi-Filter Bar: Category filter (`AADHAR`, `PAN`, `VOTER_ID`, `RATION_CARD`, `BIRTH_CERTIFICATE`, `INCOME_CERTIFICATE`, `ELECTRICITY_BILL`, etc.), Verification Status filter, Household filter, and text search.
  - **Upload Document Modal**: Select family & member, choose document type, enter custom name, description, and upload PDF/image file.
  - **Edit Document Metadata Modal**: Modify document name, category, and toggle verification status via `documentService.updateDocument`.
  - **Live Document Preview Modal**: Inspect document metadata, verification badges, and preview media file.
  - **Delete Document Dialog**: Remove records via `documentService.deleteDocument`.

### Module 4: Service Visits & Citizen Intake Desk
- **Route**: `/admin/visits` & `/staff/visits`
- **Purpose**: Streamline citizen front-desk visits with automated requirement generation and instant verification.
- **Features**:
  - **4-Step Intake Wizard**:
    1. *Citizen Selection*: Pick household and applicant beneficiary (self or family member).
    2. *Service Cascading Selection*: Choose government service and specific sub-service operation.
    3. *Dynamic Live Checklist with Automated System Check*: **The system automatically checks the citizen's digital vault**. If the document exists in their vault, it marks it `AVAILABLE` with an **"Auto-verified from citizen digital vault"** badge. If missing, it marks it `NOT_AVAILABLE`.
    4. *Confirm & Desk Remarks*: Enter desk remarks and review summary before creating the visit token (`VIS-000001`).
  - **Interactive Document Requirements on Existing Visits**:
    - Interactive toggle button between `AVAILABLE` and `NOT_AVAILABLE`.
    - **Instant Upload Button**: For missing documents (`NOT_AVAILABLE`), staff can click "Upload", select the file, and immediately verify the document to `AVAILABLE` via `serviceVisitService.updateVisitDocument`.
    - **"Auto-Check Vault" Button**: One-click batch button on visit cards to auto-scan and sync missing documents against the citizen's vault.
  - **Edit Visit Details Modal**: Edit visit intake status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), visit date, and remarks via `serviceVisitService.updateVisit`.

### Module 5: Pending Work Tracking (Agency Holdups)
- **Route**: `/admin/pending-work` & `/staff/pending-work`
- **Purpose**: Track applications held up by government portals (UIDAI, Revenue department, etc.).
- **Features**:
  - **Metric Counter Row**: Total Work, Pending, In Progress, Blocked, Completed, High Priority, Overdue SLA.
  - **4-Column Luxury Glass Kanban Board**: `PENDING` -> `IN_PROGRESS` -> `BLOCKED` -> `COMPLETED`.
  - **Interactive Kanban Buttons**: Move cards forward ("Progress") or backward ("Back") with a single click.
  - **All Documented Fields Implemented**:
    - `service_visit`: Linked service visit token.
    - `assigned_staff`: Dynamically fetched employees via `employeeService.getEmployees()`.
    - `pending_since`: Date when the task started being pending.
    - `expected_date`: Target SLA deadline date.
    - `documents_pending`: Missing documents preventing government agency approval.
    - `next_action`: Planned next operational step.
    - `notes`: Internal operational remarks.
    - `priority`: `HIGH`, `MEDIUM`, `LOW`.
  - **Create Work Ticket Modal**: Register new tickets with all fields.
  - **Edit Work Ticket Modal**: Full editing of all parameters via `pendingWorkService.updatePendingWork`.
  - **Inspection Modal**: Detailed card view with complete field breakdown.

### Module 6: Reminders & Follow-up CRM
- **Route**: `/admin/reminders` & `/staff/reminders`
- **Purpose**: Notify citizens when documents are ready or follow up on pending actions.
- **Features**:
  - **Dual-Tab Navigation**:
    - **Tab 1: Active Reminders**:
      - Priority filters (`ALL`, `HIGH`, `MEDIUM`, `LOW`).
      - Reminders cards showing citizen, service, target due date, reminder date, and status.
      - **Official Gujarati Broadcast Template Box**: Displays predefined Gujarati SMS text (e.g., *"તમારી સેવા તૈયાર છે. HY-TECH સેવા કેન્દ્રની મુલાકાત લો"*) with a 1-click **"Copy SMS"** button.
      - **Mini CRM Activity Feed Sidebar**: View call history for selected reminder, log new phone calls directly with customer response and next action date.
      - **Edit Reminder Modal**: Modify subject, due date, reminder date, priority, follow-up status, Gujarati template, and notes via `reminderService.updateReminder`.
    - **Tab 2: Follow-ups Management**:
      - Centralized CRM dashboard showing all customer calls, responses, and callback dates.
      - Real-time search across citizen names, officer names, response quotes, and reminder tokens.
      - **"Log Follow-up Call" Modal**: Record customer phone calls linked to any reminder.
      - **Edit Follow-up Modal**: Update citizen response notes and next scheduled callback date via `reminderService.updateFollowUp`.
      - **Delete Follow-up Dialog**: Remove call logs via `reminderService.deleteFollowUp`.

### Module 7: Government Schemes & Services Catalog
- **Route**: `/admin/services` & `/staff/services`
- **Purpose**: Maintain service catalog, pricing, processing SLAs, and document checklists.
- **Features**:
  - Hierarchical structure: Base Services (e.g., *Aadhar Card*) -> Sub-Services (e.g., *New Enrolment*, *Biometric Update*, *Mobile Link*).
  - Configurable fee structure, government department fees, service center commission, and required document rules.

### Module 8: Billing, Transactions & Loyalty Wallet
- **Route**: `/admin/transactions` & `/staff/transactions`
- **Purpose**: Complete fee collection and customer loyalty system.
- **Features**:
  - Payment modes: Cash, UPI / QR, Net Banking, and Digital Wallet.
  - Loyalty point accrual: 1 point earned per ₹100 spent.
  - Loyalty redemption: Points can be applied as instant discounts on checkout.
  - Printable and downloadable payment receipts.

### Module 9: Employee & User Management
- **Route**: `/admin/employees`
- **Purpose**: Manage front-desk operators, desk staff, and administrative users.
- **Features**:
  - Add employee with full name, username, email, mobile, and role (`ADMIN` or `STAFF`).
  - Active/Inactive toggle for staff access control.

---

## 7. Core TypeScript Data Models

Defined in `src/types/index.ts`:

```typescript
// Customer Household
export interface Customer {
  id: number;
  family_id: string;
  head_of_family: string;
  mobile_number: string;
  village_city: string;
  address: string;
  ration_card_type?: 'APL' | 'BPL' | 'AAY' | 'NONE';
  created_at: string;
  updated_at?: string;
  members_count?: number;
  documents_count?: number;
  wallet_balance?: number;
  loyalty_points?: number;
}

// Family Member
export interface FamilyMember {
  id: number;
  family_id: string;
  name: string;
  relationship: 'HEAD' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'OTHER';
  mobile_number?: string;
  date_of_birth?: string;
  aadhar_number?: string;
  created_at: string;
}

// Customer Document
export interface CustomerDocument {
  id: number;
  family_id: string;
  family_member: number;
  member_name?: string;
  document_type: string;
  document_type_display?: string;
  document_name: string;
  document_file: string | null;
  description?: string;
  is_verified: boolean;
  created_at: string;
}

// Service Visit
export interface ServiceVisit {
  id: number;
  visit_no: string;
  customer: number;
  customer_family_id: string;
  customer_name: string;
  customer_mobile: string;
  family_member: number | null;
  family_member_name: string | null;
  service: number;
  service_name: string;
  sub_service: number;
  sub_service_name: string;
  checked_by: number;
  checked_by_name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  visit_date: string;
  remarks: string;
  documents: VisitDocument[];
  total_documents: number;
  available_documents: number;
  created_at: string;
  updated_at?: string;
}

// Pending Work Ticket
export interface PendingWork {
  id: number;
  pending_no: string;
  service_visit?: number;
  customer: number;
  customer_family_id: string;
  customer_name: string;
  customer_mobile: string;
  service: number;
  service_name: string;
  pending_since: string;
  expected_date: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  pending_reason: string;
  documents_pending?: string;
  assigned_staff: number;
  assigned_staff_name?: string;
  next_action: string;
  work_status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
  follow_up_date: string;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

// Reminder & FollowUp
export interface Reminder {
  id: number;
  reminder_no: string;
  customer: number;
  customer_family_id: string;
  customer_name: string;
  customer_mobile: string;
  service: number;
  service_name: string;
  reminder_type: string;
  subject: string;
  due_date: string;
  reminder_date: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  message_template: string;
  follow_up_status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  notes: string;
  last_contact_date: string | null;
  customer_response: string | null;
  next_follow_up: string | null;
  created_by: number;
  created_by_name: string;
  follow_ups: FollowUp[];
  follow_up_count: number;
  created_at: string;
  updated_at?: string;
}

export interface FollowUp {
  id: number;
  reminder: number;
  contact_date: string;
  customer_response: string;
  next_follow_up: string | null;
  notes: string;
  contacted_by: number;
  contacted_by_name: string;
  created_at: string;
}
```

---

## 8. Summary of Recent Upgrades & Enhancements

The following 7 major enhancements were requested, implemented, and verified:
1. **Universal Update APIs**: Implemented update mutations and modals for Customer Profiles (`updateCustomer`), Family Members (`updateMember`), Customer Documents (`updateDocument`), Service Visits (`updateVisit`), Pending Works (`updatePendingWork`), Reminders (`updateReminder`), and Follow-ups (`updateFollowUp`).
2. **Dedicated Family Members Management**: Added `/admin/family-members` and `/staff/family-members` with KPI stats, household filter, relation filter, and complete CRUD.
3. **Dedicated Customer Digital Vault**: Added `/admin/documents` and `/staff/documents` with category filters, verification status filters, file preview, and metadata editing.
4. **Dedicated Follow-up Section in Reminders**: Added dual tabs in `/admin/reminders` and `/staff/reminders` separating active reminders and centralized follow-up call history with edit and delete capabilities.
5. **Full Pending Work Fields**: Integrated all documented fields (`service_visit`, `assigned_staff`, `pending_since`, `expected_date`, `documents_pending`, `next_action`, `notes`) into create forms, Kanban cards, inspection views, and the edit modal.
6. **Automated Document Checking & Upload in Service Visits**:
   - In the intake wizard, the system queries the customer's vault and automatically checks off available documents with an "Auto-verified" badge.
   - For `NOT_AVAILABLE` documents, an instant "Upload" button allows uploading a file directly to verify the document.
   - Added an "Auto-Check Vault" batch button and "Edit Visit Details" modal.
7. **Multilingual Localization**: Complete English and Gujarati localization in `LanguageContext.tsx` across all new and existing screens.

---

## 9. How to Run, Test, and Verify

### Running the Development Server:
```bash
npm run dev
```
Accessible at `http://localhost:3000`.

### Type Checking:
```bash
npx tsc --noEmit
```
Passes with **0 errors**.

### Production Build:
```bash
npm run build
```

### Verified Working Routes:
- `http://localhost:3000/admin/dashboard`
- `http://localhost:3000/admin/customers`
- `http://localhost:3000/admin/customers/1`
- `http://localhost:3000/admin/family-members`
- `http://localhost:3000/admin/documents`
- `http://localhost:3000/admin/visits`
- `http://localhost:3000/admin/pending-work`
- `http://localhost:3000/admin/reminders`
- `http://localhost:3000/admin/services`
- `http://localhost:3000/admin/transactions`
- `http://localhost:3000/admin/employees`
- `http://localhost:3000/admin/reports`
- `http://localhost:3000/staff/*` (all staff mirrored routes)
- `http://localhost:3000/customer/*` (citizen portal)
