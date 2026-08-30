'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'gu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Common
    app_title: 'HY-TECH ERP',
    app_tagline: 'Citizen Document Services & Management Center',
    dashboard: 'Dashboard',
    customers: 'Customers / Families',
    service_visits: 'Service Visits',
    service_catalog: 'Service Catalog',
    transactions: 'Transactions & Billing',
    reminders: 'Reminders & Follow-ups',
    pending_work: 'Pending Work',
    employee_mgmt: 'Employee Management',
    settings: 'System Settings',
    logout: 'Logout',
    search: 'Search...',
    notifications: 'Notifications',
    profile: 'Profile',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    view: 'View',
    total: 'Total',
    loading: 'Loading...',

    // Dashboard
    kpi_today: "Today's Operations",
    kpi_business: 'Business Summary',
    kpi_customers: 'Customer Health',
    total_customers: 'Total Families',
    total_visits: 'Service Visits',
    open_pending: 'Open Work Items',
    ready_delivery: 'Ready for Delivery',
    total_billing: 'Total Billing',
    active_members: 'Active Members',
    loyalty_points: 'Loyalty Points',
    wallet_balance: 'Wallet Balance',

    // Customer Detail
    customer_profile: 'Profile',
    family_members: 'Family Members',
    document_vault: 'Document Vault',
    visit_history: 'Visit History',
    customer_transactions: 'Transactions',
    customer_reminders: 'Reminders',
    add_family_member: 'Add Family Member',
    upload_document: 'Upload Document',
    verify_document: 'Verify Document',

    // Visits & Wizard
    new_service_visit: 'New Service Visit',
    step_customer: 'Select Customer',
    step_service: 'Select Service',
    step_checklist: 'Document Checklist',
    step_confirm: 'Remarks & Confirm',
    document_status: 'Document Status',
    available: 'Available',
    not_available: 'Not Available',

    // Reminders
    priority_high: 'High Priority',
    priority_medium: 'Medium Priority',
    priority_low: 'Low Priority',
    add_followup: 'Add Follow-up',
    followup_history: 'Follow-up History',

    // Pending Work
    kanban_pending: 'Pending',
    kanban_in_progress: 'In Progress',
    kanban_blocked: 'Blocked',
    kanban_completed: 'Completed',

    // Portal
    customer_portal: 'Customer Self-Service Portal',
    admin_portal: 'Administrator Portal',
    staff_portal: 'Staff Operations Portal',
  },
  gu: {
    // Navigation & Common
    app_title: 'હાઈ-ટેક ERP',
    app_tagline: 'સરકારી દસ્તાવેજ સેવા અને વ્યવસ્થાપન કેન્દ્ર',
    dashboard: 'ડેશબોર્ડ',
    customers: 'ગ્રાહક / પરિવાર',
    service_visits: 'સેવા મુલાકાતો',
    service_catalog: 'સેવા સૂચિ',
    transactions: 'બિલિંગ અને વ્યવહારો',
    reminders: 'રીમાઇન્ડર અને ફોલો-અપ',
    pending_work: 'બાકી કામ',
    employee_mgmt: 'કર્મચારી સંચાલન',
    settings: 'સેટિંગ્સ',
    logout: 'લૉગ આઉટ',
    search: 'શોધો...',
    notifications: 'સૂચનાઓ',
    profile: 'પ્રોફાઇલ',
    actions: 'ક્રિયાઓ',
    status: 'સ્થિતિ',
    date: 'તારીખ',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    create: 'બનાવો',
    delete: 'કાઢી નાખો',
    edit: 'ફેરફાર કરો',
    back: 'પાછા જાઓ',
    view: 'જુઓ',
    total: 'કુલ',
    loading: 'લોડ થઈ રહ્યું છે...',

    // Dashboard
    kpi_today: 'આજની કામગીરી',
    kpi_business: 'વ્યવસાય સારાંશ',
    kpi_customers: 'ગ્રાહક સ્થિતિ',
    total_customers: 'કુલ પરિવારો',
    total_visits: 'સેવા મુલાકાત',
    open_pending: 'ચાલુ કામગીરી',
    ready_delivery: 'ડિલિવરી માટે તૈયાર',
    total_billing: 'કુલ બિલિંગ',
    active_members: 'સક્રિય સભ્યો',
    loyalty_points: 'લોયલ્ટી પોઇન્ટ્સ',
    wallet_balance: 'વૉલેટ બેલેન્સ',

    // Customer Detail
    customer_profile: 'પ્રોફાઇલ',
    family_members: 'પરિવારના સભ્યો',
    document_vault: 'દસ્તાવેજ તિજોરી',
    visit_history: 'મુલાકાત ઇતિહાસ',
    customer_transactions: 'વ્યવહારો',
    customer_reminders: 'રીમાઇન્ડર્સ',
    add_family_member: 'સભ્ય ઉમેરો',
    upload_document: 'દસ્તાવેજ અપલોડ કરો',
    verify_document: 'દસ્તાવેજ ચકાસો',

    // Visits & Wizard
    new_service_visit: 'નવી સેવા મુલાકાત',
    step_customer: 'ગ્રાહક પસંદ કરો',
    step_service: 'સેવા પસંદ કરો',
    step_checklist: 'દસ્તાવેજ ચેકલિસ્ટ',
    step_confirm: 'રિમાર્ક્સ અને કન્ફર્મ',
    document_status: 'દસ્તાવેજ સ્થિતિ',
    available: 'ઉપલબ્ધ છે',
    not_available: 'ઉપલબ્ધ નથી',

    // Reminders
    priority_high: 'ઉચ્ચ પ્રાથમિકતા',
    priority_medium: 'મધ્યમ પ્રાથમિકતા',
    priority_low: 'ઓછી પ્રાથમિકતા',
    add_followup: 'ફોલો-અપ ઉમેરો',
    followup_history: 'ફોલો-અપ ઇતિહાસ',

    // Pending Work
    kanban_pending: 'બાકી',
    kanban_in_progress: 'પ્રગતિમાં',
    kanban_blocked: 'અટકાયેલ',
    kanban_completed: 'પૂર્ણ',

    // Portal
    customer_portal: 'ગ્રાહક સેલ્ફ-સર્વિસ પોર્ટલ',
    admin_portal: 'એડમિન પોર્ટલ',
    staff_portal: 'સ્ટાફ ઓપરેશન્સ પોર્ટલ',
  },
};

const defaultT = (key: string): string => translations['en']?.[key] || key;

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: defaultT,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('hytech_language') as Language;
    if (saved && (saved === 'en' || saved === 'gu')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hytech_language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
