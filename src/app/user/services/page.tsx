'use client';

import React, { useState, useMemo } from 'react';
import { UserLayout } from '@/components/user/UserLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Monitor,
  GraduationCap,
  Briefcase,
  Printer,
  Laptop,
  Globe,
  Phone,
  MapPin,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  FileText,
  BadgeCheck,
  Building,
  Train,
  Smartphone,
  Receipt,
  Camera,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

export default function UserServicesPage() {
  const { user } = useAuth();
  const familyId = (user as any)?.family_id || 'HTF-000002';
  const headOfFamily = (user as any)?.head_of_family || 'Rajesh Patel';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Service Catalog seeded directly from the provided HY-TECH flyer image
  const serviceCatalog = [
    {
      id: 'online',
      categoryTitle: 'ONLINE SERVICES',
      categoryTitleGu: 'ઓનલાઇન સેવાઓ',
      icon: Monitor,
      headerColor: 'bg-orange-600 text-white',
      borderColor: 'border-orange-200 dark:border-orange-900/40',
      badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
      services: [
        { name: 'PAN Card', nameGu: 'પાન કાર્ડ (નવું / સુધારો)', icon: CreditCard },
        { name: 'Aadhaar Update', nameGu: 'આધાર અપડેટ સેવા', icon: ShieldCheck },
        { name: 'Voter ID', nameGu: 'ચૂંટણી કાર્ડ (વોટર આઈડી)', icon: BadgeCheck },
        { name: 'Passport', nameGu: 'પાસપોર્ટ ઓનલાઇન સેવા', icon: BookOpen },
        { name: 'Driving Licence', nameGu: 'ડ્રાઇવિંગ લાયસન્સ ફોર્મ', icon: FileText },
        { name: 'Ayushman Card', nameGu: 'આયુષ્માન કાર્ડ (PMJAY)', icon: ShieldCheck },
        { name: 'E-Shram Card', nameGu: 'ઈ-શ્રમ કાર્ડ', icon: Award },
        { name: 'PM Kisan', nameGu: 'પીએમ કિસાન સન્માન નિધિ', icon: Sparkles },
        { name: 'Income / Caste / NCL Certificate', nameGu: 'આવક / જાતિ / નોન-ક્રીમિલેયર દાખલા', icon: FileText },
      ],
      specialBox: {
        title: 'Aadhaar Update Related Guidance',
        titleGu: 'આધાર અપડેટ માર્ગદર્શન',
        items: [
          'મોબાઈલ નંબર લિંક (Mobile Number Link)',
          'બાયોમેટ્રિક અપડેટ (Biometric Update)',
          'સરનામું અપડેટ (Address Update)',
          'નામ સુધારો (Name Correction)',
          'જન્મ તારીખ સુધારો (DOB Correction)',
          'આધાર ડાઉનલોડ (Aadhaar Download)',
          'e-Aadhaar / PVC Card Printing',
        ],
      },
    },
    {
      id: 'education',
      categoryTitle: 'EDUCATION SERVICES',
      categoryTitleGu: 'શિક્ષણ સેવાઓ',
      icon: GraduationCap,
      headerColor: 'bg-blue-700 text-white',
      borderColor: 'border-blue-200 dark:border-blue-900/40',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
      notice: '“Shree Vanraj Arts & Commerce College Dharampur” ના બધા જ ફોર્મ ભરી આપવામાં આવશે.',
      services: [
        { name: 'GCAS Registration & Admission', nameGu: 'જીસીએએસ રજીસ્ટ્રેશન અને એડમિશન', icon: BookOpen },
        { name: 'College Admission Forms', nameGu: 'કોલેજ પ્રવેશ ફોર્મ', icon: Building },
        { name: 'Hostel Admission Forms', nameGu: 'હોસ્ટેલ પ્રવેશ ફોર્મ', icon: Building },
        { name: 'Scholarship Forms', nameGu: 'શિષ્યવૃત્તિ ફોર્મ (Digital Gujarat)', icon: Award },
        { name: 'University Exam Forms', nameGu: 'યુનિવર્સિટી પરીક્ષા ફોર્મ', icon: FileText },
        { name: 'Resume / CV Making', nameGu: 'પ્રોફેશનલ રેઝ્યુમે / બાયોડેટા મેકિંગ', icon: FileText },
      ],
    },
    {
      id: 'job',
      categoryTitle: 'JOB SERVICES',
      categoryTitleGu: 'નોકરી / ભરતી સેવાઓ',
      icon: Briefcase,
      headerColor: 'bg-red-600 text-white',
      borderColor: 'border-red-200 dark:border-red-900/40',
      badgeColor: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
      services: [
        { name: 'Government Job Forms', nameGu: 'તમામ સરકારી ભરતીના ફોર્મ', icon: Building },
        { name: 'Railway Recruitment', nameGu: 'રેલવે ભરતી ઓનલાઇન ફોર્મ', icon: Train },
        { name: 'SSC / UPSC / GPSC', nameGu: 'એસએસસી / યુપીએસસી / જીપીએસસી ફોર્મ', icon: Award },
        { name: 'Police / Army / Talati / Clerk', nameGu: 'પોલીસ / આર્મી / તલાટી / ક્લાર્ક ભરતી', icon: ShieldCheck },
      ],
    },
    {
      id: 'printing',
      categoryTitle: 'PRINTING SERVICES',
      categoryTitleGu: 'પ્રિન્ટીંગ સેવાઓ',
      icon: Printer,
      headerColor: 'bg-indigo-700 text-white',
      borderColor: 'border-indigo-200 dark:border-indigo-900/40',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
      services: [
        { name: 'Xerox & Printout', nameGu: 'ઝેરોક્ષ તથા પ્રિન્ટઆઉટ (Black & Color)', icon: Printer },
        { name: 'Lamination', nameGu: 'દસ્તાવેજ લેમિનેશન', icon: ShieldCheck },
        { name: 'Scanning', nameGu: 'હાઇ-ક્વોલિટી સ્કેનીંગ', icon: FileText },
        { name: 'Spiral Binding', nameGu: 'સ્પાઇરલ બાઇન્ડિંગ', icon: Layers },
        { name: 'PVC Card Printing', nameGu: 'પીવીસી સ્માર્ટ કાર્ડ પ્રિન્ટીંગ', icon: CreditCard },
        { name: 'Passport Photo Print', nameGu: 'તાત્કાલિક પાસપોર્ટ સાઇઝ ફોટો', icon: Camera },
      ],
    },
    {
      id: 'courses',
      categoryTitle: 'COMPUTER COURSES',
      categoryTitleGu: 'કમ્પ્યુટર કોર્સ',
      icon: Laptop,
      headerColor: 'bg-amber-600 text-white',
      borderColor: 'border-amber-200 dark:border-amber-900/40',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      services: [
        { name: 'CCC Course', nameGu: 'સીસીસી કોર્સ (સરકારી માન્ય)', icon: Award },
        { name: 'MS Office', nameGu: 'એમએસ ઓફિસ (Word, Excel, PPT)', icon: Laptop },
        { name: 'Tally Prime with GST', nameGu: 'ટેલી પ્રાઇમ વિથ જીએસટી એકાઉન્ટીંગ', icon: Receipt },
        { name: 'Typing Course', nameGu: 'ગુજરાતી & અંગ્રેજી ટાઇપિંગ કોર્સ', icon: Monitor },
        { name: 'Internet Training', nameGu: 'બેઝિક કમ્પ્યુટર & ઇન્ટરનેટ ટ્રેનિંગ', icon: Globe },
      ],
    },
    {
      id: 'other',
      categoryTitle: 'OTHER SERVICES',
      categoryTitleGu: 'અન્ય સેવાઓ',
      icon: Globe,
      headerColor: 'bg-teal-700 text-white',
      borderColor: 'border-teal-200 dark:border-teal-900/40',
      badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
      services: [
        { name: 'Money Transfer', nameGu: 'મની ટ્રાન્સફર / રોકડ જમા-ઉપાડ (AePS)', icon: CreditCard },
        { name: 'Mobile Recharge', nameGu: 'તમામ કંપનીના મોબાઈલ રિચાર્જ', icon: Smartphone },
        { name: 'Online Bill Payment', nameGu: 'લાઇટ બિલ / ગેસ બિલ / ડીટીએચ પેમેન્ટ', icon: Receipt },
        { name: 'Train / Bus / Flight Ticket Booking', nameGu: 'ટ્રેન, બસ તથા ફ્લાઇટ ટિકિટ બુકિંગ', icon: Train },
      ],
    },
  ];

  // Filtering based on search query and category
  const filteredCatalog = useMemo(() => {
    return serviceCatalog
      .filter((cat) => activeCategory === 'ALL' || cat.id === activeCategory)
      .map((cat) => {
        if (!searchQuery.trim()) return cat;
        const q = searchQuery.toLowerCase();
        const matchingServices = cat.services.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.nameGu.toLowerCase().includes(q) ||
            cat.categoryTitle.toLowerCase().includes(q) ||
            cat.categoryTitleGu.toLowerCase().includes(q)
        );
        return {
          ...cat,
          services: matchingServices,
        };
      })
      .filter((cat) => cat.services.length > 0);
  }, [searchQuery, activeCategory]);

  return (
    <UserLayout familyId={familyId} headOfFamily={headOfFamily}>
      <div className="space-y-6 animate-fade-in">
        {/* Banner Header replicating the official pamphlet */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-700/40 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>તમામ ઓનલાઇન અને કમ્પ્યુટર સેવાઓ એક જ સ્થળે</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                HY-TECH <span className="text-amber-400">Computer Education & Online Hub</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                અમારા સેવા કેન્દ્ર પર ઉપલબ્ધ તમામ સરકારી, શિક્ષણ, નોકરી, પ્રિન્ટીંગ અને ઓનલાઇન સેવાઓની સંપૂર્ણ યાદી (Read-Only Service Directory).
              </p>
            </div>

            {/* Quick Contact Badge */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-1.5 flex-shrink-0">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Contact & Location</span>
              <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>72260 30701</span>
              </div>
              <div className="flex items-start gap-1.5 text-[11px] text-slate-300 max-w-[200px] leading-tight">
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>Shop No. 05, Rajmilan Complex, Dharampur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Services / બધી સેવાઓ' },
              { id: 'online', label: 'Online Services' },
              { id: 'education', label: 'Education' },
              { id: 'job', label: 'Job Forms' },
              { id: 'printing', label: 'Printing' },
              { id: 'courses', label: 'Courses' },
              { id: 'other', label: 'Other Services' },
            ].map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services / સેવા શોધો..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white shadow-2xs"
            />
          </div>
        </div>

        {/* 6 Sections Layout Matching Flyer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredCatalog.map((cat) => {
            const CatIcon = cat.icon;

            return (
              <div
                key={cat.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${cat.borderColor} shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all`}
              >
                <div>
                  {/* Category Header Strip */}
                  <div className={`px-5 py-3.5 flex items-center justify-between ${cat.headerColor}`}>
                    <div className="flex items-center gap-2.5">
                      <CatIcon className="w-5 h-5" />
                      <div>
                        <h2 className="font-black text-sm tracking-wide">{cat.categoryTitle}</h2>
                        <p className="text-[11px] opacity-90">{cat.categoryTitleGu}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {cat.services.length} Items
                    </span>
                  </div>

                  {/* Optional Notice (e.g. College admission notice) */}
                  {cat.notice && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-800/40 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                      {cat.notice}
                    </div>
                  )}

                  {/* Services List (Read-Only) */}
                  <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
                    {cat.services.map((service, idx) => {
                      const ServiceIcon = service.icon;
                      return (
                        <div
                          key={idx}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ServiceIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {service.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {service.nameGu}
                            </p>
                          </div>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-1" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Special Box (e.g. Aadhaar Guidance Box from flyer) */}
                  {cat.specialBox && (
                    <div className="m-4 mt-1 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-black text-xs">
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>{cat.specialBox.title}</span>
                      </div>
                      <div className="space-y-1">
                        {cat.specialBox.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Badge */}
                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>સેવા કેન્દ્ર પર ઉપલબ્ધ</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">HY-TECH Center</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Feature Badges & Location Footer (Exact Flyer Replica) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-base sm:text-lg block">✪</span>
              <span className="font-bold text-xs text-slate-900 dark:text-white block mt-1">ઝડપી સેવા</span>
              <span className="text-[10px] text-slate-400">Fast Service</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-base sm:text-lg block">✔</span>
              <span className="font-bold text-xs text-slate-900 dark:text-white block mt-1">વિશ્વસનીય સેવા</span>
              <span className="text-[10px] text-slate-400">Trusted Service</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-base sm:text-lg block">🏷️</span>
              <span className="font-bold text-xs text-slate-900 dark:text-white block mt-1">સુક્ત દરે સેવા</span>
              <span className="text-[10px] text-slate-400">Affordable Rates</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-base sm:text-lg block">☻</span>
              <span className="font-bold text-xs text-slate-900 dark:text-white block mt-1">ગ્રાહક સંતોષ</span>
              <span className="text-[10px] text-slate-400">Customer Satisfaction</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>
                <strong>સંપર્ક સરનામું:</strong> Shop No. 05, First Floor, Rajmilan Complex, Old Jakatnaka, Dharampur
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:7226030701"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: 72260 30701</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
