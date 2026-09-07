export type UserRole = 'admin' | 'employee' | 'customer';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface EmployeeUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  mobile_number?: string;
  is_active?: boolean;
  created_at?: string;
  designation?: string;
  department?: string;
  shift_timing?: string;
  joining_date?: string;
  basic_salary?: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'HOLIDAY' | 'LEAVE';

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string; // YYYY-MM-DD
  day_name: string;
  in_time?: string;
  out_time?: string;
  status: AttendanceStatus;
  work_hours?: number;
  notes?: string;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'PAID' | 'UNPAID';
export type LeaveStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface LeaveRecord {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  applied_at: string;
  approved_by?: string;
}

export interface LeaveBalance {
  casual_total: number;
  casual_used: number;
  sick_total: number;
  sick_used: number;
  paid_total: number;
  paid_used: number;
}

export interface HolidayItem {
  id: number;
  title: string;
  title_gu: string;
  date: string;
  day: string;
  type: 'GOVERNMENT' | 'REGIONAL' | 'NATIONAL';
  description?: string;
}

export interface CustomerUser {
  id: number;
  family_id: string;
  head_of_family: string;
  mobile_number: string;
  current_points: number;
  wallet_balance: string;
  village_city?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  message: string;
  user_type: UserRole;
  tokens: AuthTokens;
  user?: AdminUser;
  employee?: EmployeeUser;
  customer?: CustomerUser;
}

export type RelationshipType = 
  | 'HEAD'
  | 'SELF'
  | 'WIFE'
  | 'HUSBAND'
  | 'SON'
  | 'DAUGHTER'
  | 'FATHER'
  | 'MOTHER'
  | 'BROTHER'
  | 'SISTER'
  | 'OTHER';

export interface Customer {
  id: number;
  family_id: string;
  registration_date: string;
  head_of_family: string;
  mobile_number: string;
  whatsapp_number: string;
  family_member_count: number;
  village_city: string;
  birth_date: string;
  referral_family_id?: string | null;
  document_consent: boolean;
  current_points: number;
  wallet_balance: string;
  total_visits: number;
  last_visit?: string | null;
  is_active: boolean;
  notes?: string;
  digital_card_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: number;
  family_id: string;
  name: string;
  relationship: RelationshipType;
  mobile_number: string;
  birth_date: string;
  is_active: boolean;
  created_at: string;
  customer: number;
}

export type DocumentType = 
  | 'AADHAR'
  | 'VOTER_ID'
  | 'PAN'
  | 'RATION_CARD'
  | 'BIRTH_CERTIFICATE'
  | 'CASTE_CERTIFICATE'
  | 'INCOME_CERTIFICATE'
  | 'DRIVING_LICENSE'
  | 'PHOTO'
  | 'OTHER';

export interface CustomerDocument {
  id: number;
  family_id: string;
  member_name?: string;
  document_type: DocumentType;
  document_type_display?: string;
  document_name: string;
  document_file: string;
  description?: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  family_member?: number;
}

export interface RequiredDocument {
  id: number;
  SubService: number;
  DocumentName: string;
  document_type: DocumentType;
  IsRequired: boolean;
  CreatedAt: string;
}

export interface SubService {
  id: number;
  Service: number;
  SubServiceName: string;
  Description?: string | null;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  RequiredDocuments: RequiredDocument[];
}

export interface BaseService {
  id: number;
  ServiceName: string;
  ServiceNameGu?: string;
  Category?: ServiceCategory;
  SubCategory?: string;
  Department?: string;
  ServiceType?: ServiceType;
  Description?: string | null;
  GovernmentFee?: number;
  ServiceCharge?: number;
  TotalFee?: number;
  SlaDays?: number;
  Priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  SmsTemplateGu?: string;
  SmsTemplateEn?: string;
  StaffInstructions?: string;
  FormFields?: ServiceFormField[];
  PortalUrl?: string;
  IsOfficial?: boolean;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  SubServices?: SubService[];
  sub_services?: SubService[];
  required_documents?: RequiredDocument[];
}

export type VisitDocumentStatus = 'AVAILABLE' | 'NOT_AVAILABLE';

export interface VisitDocument {
  id: number;
  document_type: DocumentType;
  document_name: string;
  status: VisitDocumentStatus;
  document_file?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceVisit {
  id: number;
  visit_no: string;
  customer: number;
  customer_family_id: string;
  customer_name: string;
  customer_mobile: string;
  family_member?: number;
  family_member_name?: string;
  service: number;
  service_name: string;
  sub_service: number;
  sub_service_name: string;
  checked_by: number;
  checked_by_name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  visit_date: string;
  remarks?: string;
  documents: VisitDocument[];
  total_documents?: number;
  available_documents?: number;
  created_at: string;
  updated_at: string;
}

export type PaymentMode =
  | 'CASH'
  | 'ONLINE/UPI'
  | 'CARD'
  | 'UPI'
  | 'WALLET'
  | 'BANK_TRANSFER'
  | 'ONLINE';

export interface Transaction {
  id: number;
  transaction_no: string;
  transaction_date: string;
  customer: number;
  service: number;
  sub_service: number;
  staff: number;
  family_id: string;
  customer_name: string;
  service_name: string;
  sub_service_name: string;
  staff_name: string;
  bill_amount: string;
  points_earned: number;
  points_redeemed: number;
  wallet_credit: string;
  wallet_used: string;
  net_wallet_change: number;
  payment_mode: PaymentMode;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export type ReminderPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type FollowUpStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface FollowUp {
  id: number;
  reminder: number;
  contact_date: string;
  customer_response: string;
  next_follow_up?: string | null;
  notes?: string;
  contacted_by: number;
  contacted_by_name?: string;
  created_at: string;
}

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
  priority: ReminderPriority;
  message_template: string;
  follow_up_status: FollowUpStatus;
  notes?: string;
  last_contact_date?: string | null;
  customer_response?: string | null;
  next_follow_up?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  follow_ups?: FollowUp[];
  follow_up_count?: number;
  created_at: string;
  updated_at?: string;
}

export type WorkStatus = 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';

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
  work_status: WorkStatus;
  follow_up_date: string;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface PendingWorkSummary {
  total: number;
  pending: number;
  in_progress: number;
  blocked: number;
  completed: number;
  high_priority: number;
  overdue: number;
}

export interface DashboardData {
  today_summary: {
    total_customers: number;
    total_service_entries: number;
    open_pending_work: number;
    ready_for_delivery: number;
    pending_reminders: number;
  };
  business_summary: {
    total_billing: number;
    advance_received: number;
    outstanding_balance: number;
    completed_services: number;
    delivered_services: number;
  };
  customer_summary: {
    active_members: number;
    vip_members: number;
    repeat_customers: number;
    urgent_tasks: number;
    documents_pending: number;
  };
}

// ----------------------------------------------------
// HY-TECH GOVERNMENT SERVICE CENTER OS EXPANSIONS
// ----------------------------------------------------

export type ServiceCategory =
  | 'GOVT_FORMS'
  | 'CARD_SERVICES'
  | 'NEW_SERVICES'
  | 'OTHER_SERVICES'
  | 'COMPUTER_COURSES'
  | 'ADDITIONAL_SERVICES';

export type ServiceType = 'NEW' | 'UPDATE' | 'RENEWAL' | 'KYC' | 'OTHER';

export type ServiceFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'mobile'
  | 'email'
  | 'address'
  | 'aadhar'
  | 'pan'
  | 'bank_account'
  | 'ifsc';

export interface ServiceFormField {
  id: string;
  label_en: string;
  label_gu: string;
  type: ServiceFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  condition?: {
    field: string;
    value: any;
  };
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'DOCUMENT_CHECK'
  | 'READY_TO_SUBMIT'
  | 'SUBMITTED'
  | 'GOVERNMENT_PROCESSING'
  | 'PENDING'
  | 'ACTION_REQUIRED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'SCRUTINY'
  | 'DOCS_PENDING';

export interface ApplicationDocument {
  id: number;
  document_name: string;
  document_type: DocumentType;
  status: 'AVAILABLE' | 'NOT_AVAILABLE' | 'VERIFIED' | 'PENDING_VERIFICATION' | 'OPTIONAL';
  file_url?: string | null;
  verified_at?: string;
  notes?: string;
}

export interface ApplicationTimelineEvent {
  id: string | number;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action: string;
  old_status?: ApplicationStatus;
  new_status?: ApplicationStatus;
  notes?: string;
}

export interface Application {
  id: number;
  application_no: string;
  customer?: number;
  customer_name: string;
  customer_mobile: string;
  customer_family_id: string;
  applicant_name?: string;
  applicant_mobile?: string;
  applicant_member_id?: number | null;
  family_member?: number | null;
  family_member_name?: string | null;
  service: number;
  service_name: string;
  service_name_gu?: string;
  sub_service?: number | null;
  sub_service_name?: string | null;
  category?: ServiceCategory;
  status: ApplicationStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL' | 'URGENT';
  government_app_no?: string;
  government_portal_url?: string;
  govt_fee: number;
  service_charge: number;
  total_fee: number;
  payment_status: 'PAID' | 'UNPAID' | 'PARTIAL';
  payment_mode?: PaymentMode;
  receipt_no?: string;
  assigned_staff?: number;
  assigned_staff_name?: string;
  created_by?: number;
  created_by_name?: string;
  expected_date: string;
  sla_days?: number;
  documents: ApplicationDocument[];
  form_data: Record<string, any>;
  timeline: ApplicationTimelineEvent[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address?: string;
}

export interface Village {
  id: number;
  code: string;
  name: string;
  name_gu: string;
  taluka: string;
  district: string;
  total_families: number;
  total_citizens: number;
  total_documents: number;
  male_count: number;
  female_count: number;
  is_active: boolean;
}

export type GovDocStatus = 'VERIFIED' | 'UPLOADED' | 'MISSING' | 'REJECTED';

export interface GovDocumentItem {
  id: string;
  title: string;
  title_gu: string;
  type: DocumentType;
  status: GovDocStatus;
  document_no?: string;
  uploaded_date?: string;
  file_url?: string;
  notes?: string;
  is_required: boolean;
}

export interface FamilyTreeNodeData {
  id: number;
  family_id: string;
  name: string;
  relationship: RelationshipType;
  relationship_display?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  birth_date: string;
  mobile_number: string;
  is_head?: boolean;
  is_active: boolean;
  generation: 1 | 2 | 3 | 4; // 1: Grandparents, 2: Parents, 3: Children, 4: Grandchildren
  parent_id?: number | null;
  spouse_id?: number | null;
  documents_verified: number;
  documents_total: number;
  documents: GovDocumentItem[];
  children?: FamilyTreeNodeData[];
}

