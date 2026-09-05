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
    // Navigation Groups
    group_command: 'COMMAND & ANALYTICS',
    group_citizen_ops: 'CITIZEN OPERATIONS',
    group_finance_catalog: 'FINANCE & CATALOG',
    group_platform_admin: 'PLATFORM ADMIN',
    group_front_desk: 'FRONT DESK',
    group_citizen_portal: 'CITIZEN PORTAL',

    // Navigation Items
    nav_dashboard: 'Dashboard',
    nav_customers: 'Customers / Families',
    nav_visits: 'Service Visits',
    nav_pending_work: 'Pending Work',
    nav_reminders: 'Reminders & Follow-ups',
    nav_transactions: 'Transactions & Invoices',
    nav_services: 'Service Catalog',
    nav_employees: 'Employee Management',
    nav_settings: 'System Settings',
    nav_my_dashboard: 'My Dashboard',
    nav_family_members: 'Family Members',
    nav_digital_vault: 'Digital Vault',
    nav_my_visits: 'My Applications & Visits',
    nav_alerts_reminders: 'Alerts & Reminders',

    // Common UI Words
    app_title: 'HY-TECH ERP',
    app_tagline: 'Citizen Document Services & Government Portals Center',
    search: 'Search...',
    quick_search_placeholder: 'Quick search citizen records, visit tokens (Ctrl+K)...',
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
    logout: 'Sign Out',
    active: 'Active',
    inactive: 'Inactive',
    all: 'All',
    close: 'Close',
    submit: 'Submit',
    confirm: 'Confirm',
    remarks: 'Remarks',
    phone: 'Phone',
    mobile: 'Mobile Number',
    whatsapp: 'WhatsApp',
    address: 'Address',
    village_city: 'Village / City',
    birth_date: 'Birth Date',
    relation: 'Relationship',
    verified: 'Verified',
    unverified: 'Unverified',
    priority: 'Priority',
    notes: 'Notes',
    visit_wizard: 'Visit Wizard',
    sync_active: 'Sync Active',

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
    today_revenue: "Today's Invoicing",
    month_revenue: 'Monthly Revenue',
    all_time_billed: 'All-Time Gross Billed',
    points_issued: 'Loyalty Points Circulating',
    auth_logout: 'Sign Out',
    exec_overview: 'Executive Dashboard & Central Management',
    exec_sub: 'Real-time overview of document services, citizen visits, pending government tasks, and transactions.',
    recent_visits: 'Recent Citizen Visits',
    pending_tasks_overview: 'Pending Work Overview',
    revenue_analytics: 'Billing & Service Trends',

    // Customers Module
    customers_title: 'Household Directory & Citizen Vaults',
    customers_sub: 'Registered families, digital identity cards, loyalty wallets, and family tree profiles.',
    register_new_family: 'Register New Family',
    head_of_family: 'Head of Family',
    family_id: 'Family ID',
    member_count: 'Members',
    points: 'Points',
    wallet: 'Wallet',
    visits: 'Visits',
    last_visit: 'Last Visit',
    inspect_profile: 'Inspect Citizen 6-Tab Profile',
    delete_family_confirm: 'Are you sure you want to delete this family record? All associated documents and visit logs will be affected.',
    household_profile: 'Household Profile',
    document_vault: 'Document Vault',
    invoices: 'Invoices',
    alerts: 'Alerts',
    add_family_member: 'Add Family Member',
    upload_document: 'Upload Document',
    verify_document: 'Verify Document',
    download_file: 'Download File',
    view_file: 'View File',

    // Service Visits & Wizard
    service_visits_title: 'Citizen Service Visits & Desk Intake',
    service_visits_sub: 'Record front-desk applications, automatically generate required document checklists, and monitor delivery readiness.',
    new_service_visit: 'New Service Visit',
    step_customer: '1. Select Citizen / Family',
    step_service: '2. Select Service & Category',
    step_checklist: '3. Required Documents Checklist',
    step_confirm: '4. Operator Remarks & Intake',
    document_checklist: 'Document Checklist',
    document_readiness: 'Required Documents Readiness',
    available: 'Available',
    not_available: 'Not Available',
    toggle_availability: 'Toggle Available / Missing',

    // Pending Work (Kanban)
    pending_work_title: 'Pending Government Work & Task Pipeline',
    pending_work_sub: '4-stage Kanban tracking government portal submissions, token generation, biometric verifications, and delivery readiness.',
    new_pending_ticket: 'New Work Ticket',
    kanban_pending: 'Pending Desk Intake',
    kanban_in_progress: 'In Government Progress',
    kanban_blocked: 'Blocked / Action Needed',
    kanban_completed: 'Completed & Ready',
    priority_high: 'High Priority',
    priority_medium: 'Medium Priority',
    priority_low: 'Low Priority',
    move_next: 'Advance Stage',
    move_back: 'Previous Stage',

    // Transactions & Billing
    transactions_title: 'Transactions, Invoices & Loyalty Ledger',
    transactions_sub: 'Record service fees, redeem loyalty reward points, utilize customer wallet credits, and generate printable receipts.',
    record_transaction: 'Create Service Invoice',
    bill_amount: 'Bill Amount',
    points_earned: 'Points Earned',
    points_redeemed: 'Points Redeemed',
    wallet_credit: 'Wallet Credit',
    wallet_used: 'Wallet Used',
    net_payable: 'Net Cash/UPI Payable',
    net_wallet_change: 'Net Wallet Change',
    payment_mode: 'Payment Mode',
    payment_cash: 'Cash',
    payment_upi: 'Online / UPI',
    payment_card: 'Debit / Credit Card',
    receipt: 'Official Receipt',
    print_receipt: 'Print Receipt',
    download_receipt: 'Download Receipt',

    // Reminders & Follow-ups
    reminders_title: 'Reminders, Citizen Alerts & Follow-ups',
    reminders_sub: 'Schedule collection alerts, send Gujarati notifications, and record CRM follow-up conversations.',
    create_reminder: 'New Reminder Alert',
    add_followup: 'Add Follow-up Entry',
    followup_history: 'Follow-up CRM Timeline',
    message_preview: 'Citizen Message Template (Gujarati)',
    due_date: 'Scheduled Due Date',
    reminder_date: 'Alert Date',

    // Service Catalog Manager
    catalog_title: 'Government Service Catalog & Rules',
    catalog_sub: 'Configure base government schemes, sub-services, and dynamically required documents for citizen checklists.',
    add_base_service: 'Add Base Service',
    add_sub_service: 'Add Sub-Service',
    add_req_doc: 'Add Required Document',
    service_name: 'Service Name',
    sub_service_name: 'Sub-Service Name',
    required_document: 'Required Document',

    // Employee Management
    employees_title: 'Employee & Operator Management',
    employees_sub: 'Provision staff credentials, set operator desk roles, and oversee staff activities.',
    add_employee: 'Add Staff Member',
    full_name: 'Full Name',
    username: 'Username',
    password: 'Password',
    role_admin: 'Administrator',
    role_staff: 'Staff Desk Operator',

    // Settings
    settings_title: 'System Settings & Environment Diagnostics',
    settings_sub: 'Review central API target configuration, interface localization, and visual appearance preferences.',
    api_environment: 'API Environment (Rule #1)',
    active_api_base: 'Active API Base URL',
    test_api_connection: 'Test API Reachability',
    language_preference: 'Language & Localization',
    theme_appearance: 'Visual Theme',

    // Portals
    customer_portal: 'Citizen Self-Service Portal',
    admin_portal: 'Administrator Console',
    staff_portal: 'Staff Desk Portal',

    // Login Page
    login_title: 'HY-TECH Citizen Services ERP',
    login_sub: 'Central Identity, Document Vault & Government Welfare Desk',
    tab_admin: 'Admin Desk',
    tab_staff: 'Staff Operator',
    tab_citizen: 'Citizen Portal',
    auto_fill_admin: 'Auto-Fill Admin',
    auto_fill_staff: 'Auto-Fill Staff',
    auto_fill_citizen: 'Auto-Fill Citizen',
    sign_in_btn: 'Sign in to Secure Console',

    // 404 Page
    page_not_found: 'HTTP 404 • Route Not Found',
    page_not_found_title: 'Lost in Citizen Portals?',
    page_not_found_desc: 'The requested citizen dossier, application record, or administrative route cannot be located.',
    return_to_console: 'Return to ERP Console',
    switch_account: 'Switch Login Account',

    // Extended Update & Management
    edit_profile: 'Edit Profile',
    edit_member: 'Edit Member',
    edit_document: 'Edit Document Details',
    edit_visit: 'Edit Service Visit',
    edit_ticket: 'Edit Work Ticket',
    edit_reminder: 'Edit Reminder',
    edit_followup: 'Edit Follow-up',
    auto_checked_vault: 'Auto-verified from Vault',
    missing_upload_now: 'Missing from Vault (Upload Now)',
    tab_reminders: 'Active Reminders',
    tab_followups: 'Follow-ups Management',
    assigned_staff: 'Assigned Operator',
    pending_since: 'Pending Since',
    documents_pending: 'Pending Documents',
    log_followup: 'Log New Follow-up',
  },
  gu: {
    // Navigation Groups
    group_command: 'કમાન્ડ અને એનાલિટિક્સ',
    group_citizen_ops: 'નાગરિક સેવા સંચાલન',
    group_finance_catalog: 'નાણાં અને સેવા સૂચિ',
    group_platform_admin: 'પ્લેટફોર્મ એડમિન',
    group_front_desk: 'ફ્રન્ટ ડેસ્ક',
    group_citizen_portal: 'નાગરિક પોર્ટલ',

    // Navigation Items
    nav_dashboard: 'ડેશબોર્ડ',
    nav_customers: 'ગ્રાહક / પરિવારો',
    nav_visits: 'સેવા મુલાકાતો',
    nav_pending_work: 'બાકી સરકારી કામ',
    nav_reminders: 'રીમાઇન્ડર અને ફોલો-અપ',
    nav_transactions: 'બિલિંગ અને વ્યવહારો',
    nav_services: 'સેવા સૂચિ મેનેજર',
    nav_employees: 'કર્મચારી સંચાલન',
    nav_settings: 'સિસ્ટમ સેટિંગ્સ',
    nav_my_dashboard: 'મારું ડેશબોર્ડ',
    nav_family_members: 'પરિવારના સભ્યો',
    nav_digital_vault: 'ડિજિટલ દસ્તાવેજ તિજોરી',
    nav_my_visits: 'મારી અરજીઓ અને મુલાકાત',
    nav_alerts_reminders: 'સૂચનાઓ અને રીમાઇન્ડર્સ',

    // Common UI Words
    app_title: 'હાઈ-ટેક ERP',
    app_tagline: 'સરકારી દસ્તાવેજ સેવા અને યોજના વ્યવસ્થાપન કેન્દ્ર',
    search: 'શોધો...',
    quick_search_placeholder: 'નાગરિક રેકોર્ડ્સ, મુલાકાત ટોકન શોધો (Ctrl+K)...',
    notifications: 'સૂચનાઓ',
    profile: 'પ્રોફાઇલ',
    actions: 'ક્રિયાઓ',
    status: 'સ્થિતિ',
    date: 'તારીખ',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    create: 'ઉમેરો',
    delete: 'કાઢી નાખો',
    edit: 'ફેરફાર કરો',
    back: 'પાછા જાઓ',
    view: 'જુઓ',
    total: 'કુલ',
    loading: 'લોડ થઈ રહ્યું છે...',
    logout: 'લૉગ આઉટ',
    active: 'સક્રિય',
    inactive: 'નિષ્ક્રિય',
    all: 'બધા',
    close: 'બંધ કરો',
    submit: 'સબમિટ કરો',
    confirm: 'ખાતરી કરો',
    remarks: 'નોંધ / રિમાર્ક્સ',
    phone: 'ફોન',
    mobile: 'મોબાઇલ નંબર',
    whatsapp: 'વોટ્સએપ',
    address: 'સરનામું',
    village_city: 'ગામ / શહેર',
    birth_date: 'જન્મ તારીખ',
    relation: 'સંબંધ',
    verified: 'ચકાસાયેલ',
    unverified: 'ચકાસણી બાકી',
    priority: 'પ્રાથમિકતા',
    notes: 'ખાસ નોંધ',
    visit_wizard: 'નવી મુલાકાત',
    sync_active: 'લાઈવ સિન્ક ચાલુ',

    // Dashboard
    kpi_today: 'આજની દૈનિક કામગીરી',
    kpi_business: 'વ્યવસાય અને સેવા સારાંશ',
    kpi_customers: 'નાગરિક સ્થિતિ',
    total_customers: 'કુલ પરિવારો',
    total_visits: 'સેવા મુલાકાતો',
    open_pending: 'ચાલુ કામગીરી',
    ready_delivery: 'ડિલિવરી માટે તૈયાર',
    total_billing: 'કુલ આવક / બિલિંગ',
    active_members: 'સક્રિય સભ્યો',
    loyalty_points: 'લોયલ્ટી પોઇન્ટ્સ',
    wallet_balance: 'વૉલેટ બેલેન્સ',
    today_revenue: 'આજનું બિલિંગ',
    month_revenue: 'માસિક આવક',
    all_time_billed: 'કુલ કુલ બિલિંગ',
    points_issued: 'ચલણમાં રહેલા પોઇન્ટ્સ',
    auth_logout: 'લૉગ આઉટ',
    exec_overview: 'એક્ઝિક્યુટિવ ડેશબોર્ડ અને કેન્દ્રીય સંચાલન',
    exec_sub: 'દસ્તાવેજ સેવાઓ, નાગરિક મુલાકાતો, બાકી સરકારી કામ અને વ્યવહારોનું રીઅલ-ટાઇમ વિહંગાવલોકન.',
    recent_visits: 'તાજેતરની નાગરિક મુલાકાતો',
    pending_tasks_overview: 'બાકી કામની સ્થિતિ',
    revenue_analytics: 'બિલિંગ અને સેવા વલણો',

    // Customers Module
    customers_title: 'પરિવાર ડાયરેક્ટરી અને નાગરિક તિજોરી',
    customers_sub: 'નોંધાયેલા પરિવારો, ડિજિટલ ઓળખ કાર્ડ, લોયલ્ટી વોલેટ અને પરિવારના સભ્યોની વિગતો.',
    register_new_family: 'નવા પરિવારની નોંધણી',
    head_of_family: 'પરિવારના વડાનું નામ',
    family_id: 'ફેમિલી આઈડી',
    member_count: 'સભ્યોની સંખ્યા',
    points: 'પોઇન્ટ્સ',
    wallet: 'વોલેટ',
    visits: 'મુલાકાતો',
    last_visit: 'છેલ્લી મુલાકાત',
    inspect_profile: 'નાગરિક 6-ટેબ પ્રોફાઇલ જુઓ',
    delete_family_confirm: 'શું તમે ખરેખર આ પરિવારનો રેકોર્ડ કાઢી નાખવા માંગો છો? સંબંધિત તમામ દસ્તાવેજો અને વિગતો દૂર થશે.',
    household_profile: 'પરિવાર પ્રોફાઇલ',
    document_vault: 'દસ્તાવેજ તિજોરી',
    invoices: 'ઇન્વૉઇસેસ',
    alerts: 'સૂચનાઓ',
    add_family_member: 'નવા સભ્ય ઉમેરો',
    upload_document: 'દસ્તાવેજ અપલોડ કરો',
    verify_document: 'દસ્તાવેજ ચકાસો',
    download_file: 'ફાઇલ ડાઉનલોડ',
    view_file: 'ફાઇલ જુઓ',

    // Service Visits & Wizard
    service_visits_title: 'નાગરિક સેવા મુલાકાતો અને ડેસ્ક ઇન્ટેક',
    service_visits_sub: 'ફ્રન્ટ-ડેસ્ક અરજીઓ નોંધો, આપમેળે જરૂરી દસ્તાવેજ ચેકલિસ્ટ બનાવો અને ડિલિવરી સ્થિતિ ટ્રૅક કરો.',
    new_service_visit: 'નવી સેવા મુલાકાત',
    step_customer: '૧. નાગરિક / પરિવાર પસંદ કરો',
    step_service: '૨. સેવા અને પેટા-સેવા પસંદ કરો',
    step_checklist: '૩. જરૂરી દસ્તાવેજ ચેકલિસ્ટ',
    step_confirm: '૪. ઓપરેટર રિમાર્ક્સ અને કન્ફર્મ',
    document_checklist: 'દસ્તાવેજ ચેકલિસ્ટ',
    document_readiness: 'જરૂરી દસ્તાવેજોની ઉપલબ્ધતા',
    available: 'ઉપલબ્ધ છે',
    not_available: 'બાકી છે',
    toggle_availability: 'હાજર / ગેરહાજર બદલો',

    // Pending Work (Kanban)
    pending_work_title: 'બાકી સરકારી કામ અને પ્રક્રિયા પાઇપલાઇન',
    pending_work_sub: 'સરકારી પોર્ટલ સબમિશન, ટોકન જનરેશન, બાયોમેટ્રિક વેરિફિકેશન અને ડિલિવરી ટ્રેકિંગ માટેનું ૪-સ્ટેજ કાનબાન બોર્ડ.',
    new_pending_ticket: 'નવું કામ ઉમેરો',
    kanban_pending: 'ડેસ્ક સ્વીકૃતિ બાકી',
    kanban_in_progress: 'સરકારી પોર્ટલમાં પ્રગતિમાં',
    kanban_blocked: 'અટકાયેલ / પગલાં જરૂરી',
    kanban_completed: 'પૂર્ણ અને ડિલિવરી માટે તૈયાર',
    priority_high: 'ઉચ્ચ પ્રાથમિકતા',
    priority_medium: 'મધ્યમ પ્રાથમિકતા',
    priority_low: 'સામાન્ય પ્રાથમિકતા',
    move_next: 'આગલા તબક્કે ખસેડો',
    move_back: 'પાછલા તબક્કે ખસેડો',

    // Transactions & Billing
    transactions_title: 'વ્યવહારો, બિલિંગ અને લોયલ્ટી ખાતાવહી',
    transactions_sub: 'સેવા ફી નોંધો, લોયલ્ટી રિવોર્ડ પોઈન્ટ્સ રીડીમ કરો, વોલેટ ક્રેડિટ વાપરો અને પ્રિન્ટ કરી શકાય તેવી રસીદ મેળવો.',
    record_transaction: 'સેવા ઇન્વૉઇસ બનાવો',
    bill_amount: 'બિલ રકમ',
    points_earned: 'મેળવેલ પોઇન્ટ્સ',
    points_redeemed: 'વપરાયેલ પોઇન્ટ્સ',
    wallet_credit: 'વોલેટ ક્રેડિટ ઉમેરો',
    wallet_used: 'વોલેટમાંથી વપરાયેલ',
    net_payable: 'ચુકવવાપાત્ર રોકડ/UPI રકમ',
    net_wallet_change: 'વોલેટમાં ચોખ્ખો ફેરફાર',
    payment_mode: 'ચુકવણી પદ્ધતિ',
    payment_cash: 'રોકડ (Cash)',
    payment_upi: 'ઓનલાઇન / UPI',
    payment_card: 'ડેબિટ / ક્રેડિટ કાર્ડ',
    receipt: 'સત્તાવાર રસીદ',
    print_receipt: 'રસીદ પ્રિન્ટ કરો',
    download_receipt: 'રસીદ ડાઉનલોડ',

    // Reminders & Follow-ups
    reminders_title: 'રીમાઇન્ડર્સ, નાગરિક સૂચનાઓ અને ફોલો-અપ',
    reminders_sub: 'દસ્તાવેજ કલેક્શન એલર્ટ શેડ્યૂલ કરો, ગુજરાતી મેસેજ મોકલો અને ફોલો-અપ ઇતિહાસ નોંધો.',
    create_reminder: 'નવો રીમાઇન્ડર બનાવો',
    add_followup: 'ફોલો-અપ એન્ટ્રી ઉમેરો',
    followup_history: 'ફોલો-અપ CRM સમયરેખા',
    message_preview: 'નાગરિક સંદેશ નમૂનો (ગુજરાતી)',
    due_date: 'નિયત તારીખ',
    reminder_date: 'રીમાઇન્ડર તારીખ',

    // Service Catalog Manager
    catalog_title: 'સરકારી સેવા સૂચિ અને નિયમો',
    catalog_sub: 'સરકારી યોજનાઓ, પેટા-સેવાઓ અને નાગરિક ચેકલિસ્ટ માટે જરૂરી દસ્તાવેજો ગોઠવો.',
    add_base_service: 'મુખ્ય સેવા ઉમેરો',
    add_sub_service: 'પેટા-સેવા ઉમેરો',
    add_req_doc: 'જરૂરી દસ્તાવેજ ઉમેરો',
    service_name: 'સેવાનું નામ',
    sub_service_name: 'પેટા-સેવાનું નામ',
    required_document: 'જરૂરી દસ્તાવેજ',

    // Employee Management
    employees_title: 'કર્મચારી અને ઓપરેટર સંચાલન',
    employees_sub: 'સ્ટાફ એકાઉન્ટ બનાવો, ઓપરેટર રોલ સેટ કરો અને કામગીરીનું નિરીક્ષણ કરો.',
    add_employee: 'નવા કર્મચારી ઉમેરો',
    full_name: 'પૂરું નામ',
    username: 'વપરાશકર્તા નામ',
    password: 'પાસવર્ડ',
    role_admin: 'મુખ્ય સંચાલક (Admin)',
    role_staff: 'ડેસ્ક ઓપરેટર (Staff)',

    // Settings
    settings_title: 'સિસ્ટમ સેટિંગ્સ અને એન્વાયરન્મેન્ટ કંટ્રોલ',
    settings_sub: 'કેન્દ્રીય API કન્ફિગરેશન, ભાષા સેટિંગ્સ અને દેખાવ પસંદગીઓની સમીક્ષા કરો.',
    api_environment: 'API પર્યાવરણ (નિયમ #1)',
    active_api_base: 'સક્રિય API બેઝ URL',
    test_api_connection: 'API કનેક્શન ચકાસો',
    language_preference: 'ભાષા અને લોકલાઇઝેશન',
    theme_appearance: 'ડિઝાઇન થીમ (Dark/Light)',

    // Portals
    customer_portal: 'નાગરિક સેલ્ફ-સર્વિસ પોર્ટલ',
    admin_portal: 'એડમિનિસ્ટ્રેટર પોર્ટલ',
    staff_portal: 'સ્ટાફ ઓપરેશન્સ પોર્ટલ',

    // Login Page
    login_title: 'હાઈ-ટેક નાગરિક સેવાઓ ERP',
    login_sub: 'કેન્દ્રીય ઓળખ, ડિજિટલ દસ્તાવેજ તિજોરી અને સરકારી યોજના ડેસ્ક',
    tab_admin: 'એડમિન ડેસ્ક',
    tab_staff: 'સ્ટાફ ઓપરેટર',
    tab_citizen: 'નાગરિક પોર્ટલ',
    auto_fill_admin: 'એડમિન ઓટો-ફિલ',
    auto_fill_staff: 'સ્ટાફ ઓટો-ફિલ',
    auto_fill_citizen: 'નાગરિક ઓટો-ફિલ',
    sign_in_btn: 'સુરક્ષિત કન્સોલમાં પ્રવેશ કરો',

    // 404 Page
    page_not_found: 'HTTP ૪૦૪ • પેજ મળ્યું નથી',
    page_not_found_title: 'પેજ અથવા રેકોર્ડ મળ્યો નથી',
    page_not_found_desc: 'વિનંતી કરેલ નાગરિક ફાઇલ, અરજી રેકોર્ડ અથવા વહીવટી પૃષ્ઠ સિસ્ટમમાં ઉપલબ્ધ નથી.',
    return_to_console: 'મુખ્ય કન્સોલ પર પાછા જાઓ',
    switch_account: 'બીજા એકાઉન્ટમાં લૉગિન કરો',

    // Extended Update & Management
    edit_profile: 'પ્રોફાઇલ સંપાદિત કરો',
    edit_member: 'સભ્ય માહિતી સંપાદિત કરો',
    edit_document: 'દસ્તાવેજ સંપાદિત કરો',
    edit_visit: 'સેવા મુલાકાત સંપાદિત કરો',
    edit_ticket: 'કામગીરી ટિકિટ સંપાદિત કરો',
    edit_reminder: 'સૂચના સંપાદિત કરો',
    edit_followup: 'ફોલો-અપ સંપાદિત કરો',
    auto_checked_vault: 'તિજોરીમાંથી સ્વચાલિત ચકાસાયેલ',
    missing_upload_now: 'તિજોરીમાં બાકી (હમણાં અપલોડ કરો)',
    tab_reminders: 'સક્રિય રીમાઇન્ડર્સ',
    tab_followups: 'ફોલો-અપ વ્યવસ્થાપન',
    assigned_staff: 'સોંપાયેલ ઓપરેટર',
    pending_since: 'આ તારીખથી પેન્ડિંગ',
    documents_pending: 'બાકી દસ્તાવેજો',
    log_followup: 'નવો ફોલો-અપ નોંધો',
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
      <div className={language === 'gu' ? 'font-gujarati' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
