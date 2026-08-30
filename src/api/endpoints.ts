/**
 * ALL API endpoints are defined here as constants or builder functions.
 * No raw path strings should exist anywhere else in the application.
 */

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    STAFF_LOGIN: '/auth/staff/login/',
    CUSTOMER_LOGIN: '/auth/customer/login/',
    LOGOUT: '/auth/logout/',
    EMPLOYEES: '/auth/employees/',
    EMPLOYEE_DETAIL: (id: number | string) => `/auth/employees/${id}/`,
  },

  // Customers / Family Management
  CUSTOMERS: {
    LIST: '/customers/',
    CREATE: '/customers/',
    DETAIL: (familyId: string) => `/customers/${familyId}/`,
    UPDATE: (familyId: string) => `/customers/${familyId}/`,
    DELETE: (familyId: string) => `/customers/${familyId}/`,
    FAMILY_MEMBERS: (familyId: string) => `/customers/${familyId}/family-members/`,
    FAMILY_MEMBER_DETAIL: (familyId: string, memberId: number | string) =>
      `/customers/${familyId}/family-members/${memberId}/`,
  },

  // Customer Documents
  DOCUMENTS: {
    LIST: (familyId: string, memberId: number | string) => `/documents/${familyId}/${memberId}/`,
    UPLOAD: (familyId: string, memberId: number | string) => `/documents/${familyId}/${memberId}/`,
    DETAIL: (familyId: string, memberId: number | string, docId: number | string) =>
      `/documents/${familyId}/${memberId}/${docId}/`,
    UPDATE: (familyId: string, memberId: number | string, docId: number | string) =>
      `/documents/${familyId}/${memberId}/${docId}/`,
    DELETE: (familyId: string, memberId: number | string, docId: number | string) =>
      `/documents/${familyId}/${memberId}/${docId}/`,
  },

  // Service Visits
  SERVICE_VISITS: {
    LIST: '/customers/service-visits/',
    CREATE: '/customers/service-visits/',
    DETAIL: (visitNo: string) => `/customers/service-visits/${visitNo}/`,
    UPDATE: (visitNo: string) => `/customers/service-visits/${visitNo}/`,
    DELETE: (visitNo: string) => `/customers/service-visits/${visitNo}/`,
    UPDATE_DOCUMENT: (visitNo: string, docId: number | string) =>
      `/customers/service-visits/${visitNo}/documents/${docId}/`,
  },

  // Base Services
  SERVICES: {
    LIST: '/services/',
    CREATE: '/services/',
    DETAIL: (id: number | string) => `/services/${id}/`,
    UPDATE: (id: number | string) => `/services/${id}/`,
    DELETE: (id: number | string) => `/services/${id}/`,
  },

  // Sub-Services
  SUB_SERVICES: {
    LIST: '/services/sub-services/',
    CREATE: '/services/sub-services/',
    DETAIL: (id: number | string) => `/services/sub-services/${id}/`,
    UPDATE: (id: number | string) => `/services/sub-services/${id}/`,
    DELETE: (id: number | string) => `/services/sub-services/${id}/`,
  },

  // Required Documents
  REQUIRED_DOCUMENTS: {
    LIST: '/services/required-documents/',
    CREATE: '/services/required-documents/',
    DETAIL: (id: number | string) => `/services/required-documents/${id}/`,
    UPDATE: (id: number | string) => `/services/required-documents/${id}/`,
    DELETE: (id: number | string) => `/services/required-documents/${id}/`,
  },

  // Transactions
  TRANSACTIONS: {
    LIST: '/services/transactions/',
    CREATE: '/services/transactions/',
    DETAIL: (id: number | string) => `/services/transactions/${id}/`,
    UPDATE: (id: number | string) => `/services/transactions/${id}/`,
    DELETE: (id: number | string) => `/services/transactions/${id}/`,
  },

  // Reminders & Follow-ups
  REMINDERS: {
    LIST: '/reminders/',
    CREATE: '/reminders/',
    DETAIL: (reminderNo: string) => `/reminders/${reminderNo}/`,
    UPDATE: (reminderNo: string) => `/reminders/${reminderNo}/`,
    DELETE: (reminderNo: string) => `/reminders/${reminderNo}/`,
    FOLLOW_UPS: (reminderNo: string) => `/reminders/${reminderNo}/follow-ups/`,
    ADD_FOLLOW_UP: (reminderNo: string) => `/reminders/${reminderNo}/follow-ups/`,
  },

  // Pending Work
  PENDING_WORK: {
    LIST: '/pending-work/',
    CREATE: '/pending-work/',
    SUMMARY: '/pending-work/summary/',
    DETAIL: (pendingNo: string) => `/pending-work/${pendingNo}/`,
    UPDATE: (pendingNo: string) => `/pending-work/${pendingNo}/`,
    DELETE: (pendingNo: string) => `/pending-work/${pendingNo}/`,
  },

  // Dashboard
  DASHBOARD: {
    GET: '/dashboard/',
  },
};
