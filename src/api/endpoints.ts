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
    UPDATE_FOLLOW_UP: (reminderNo: string, followUpId: number | string) =>
      `/reminders/${reminderNo}/follow-ups/${followUpId}/`,
    DELETE_FOLLOW_UP: (reminderNo: string, followUpId: number | string) =>
      `/reminders/${reminderNo}/follow-ups/${followUpId}/`,
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

  // Applications (Govt Service Center OS)
  APPLICATIONS: {
    LIST: '/applications/',
    CREATE: '/applications/',
    DETAIL: (appNo: string) => `/applications/${appNo}/`,
    UPDATE: (appNo: string) => `/applications/${appNo}/`,
    DELETE: (appNo: string) => `/applications/${appNo}/`,
    STATUS: (appNo: string) => `/applications/${appNo}/status/`,
    TIMELINE: (appNo: string) => `/applications/${appNo}/timeline/`,
  },

  // Audit Logs
  AUDIT_LOGS: {
    LIST: '/audit-logs/',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    SEND: '/notifications/send/',
    MARK_READ: (id: number | string) => `/notifications/${id}/read/`,
  },

  // HRMS
  HRMS: {
    ATTENDANCE: '/hrms/attendance/',
    LEAVES: '/hrms/leaves/',
    LEAVE_BALANCE: (id: number | string) => `/hrms/leave-balance/${id}/`,
    HOLIDAYS: '/hrms/holidays/',
    SETTINGS: '/hrms/settings/',
    SETTINGS_COMPANY: '/hrms/settings/company/',
    SETTINGS_ATTENDANCE: '/hrms/settings/attendance/',
    SETTINGS_LEAVE: '/hrms/settings/leave/',
    SETTINGS_NOTIFICATIONS: '/hrms/settings/notifications/',
    SETTINGS_ROLES: '/hrms/settings/roles-permissions/',
    SETTINGS_ROLE_DETAIL: (id: number | string) => `/hrms/settings/roles-permissions/${id}/`,
  },

  // Villages & Demographics
  VILLAGES: {
    LIST: '/villages/',
    CREATE: '/villages/',
    DETAIL: (id: number | string) => `/villages/${id}/`,
    FAMILY_TREE: (familyId: string) => `/villages/family-tree/${familyId}/`,
  },
};
