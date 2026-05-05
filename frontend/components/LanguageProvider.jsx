'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'language';
const SUPPORTED = ['en', 'lt'];

const translations = {
  en: {
    // Sidebar
    'nav.overview':       'OVERVIEW',
    'nav.lessons':        'LESSONS',
    'nav.discover':       'DISCOVER',
    'nav.dashboard':      'Dashboard',
    'nav.messages':       'Messages',
    'nav.requestLesson':  'Request Lesson',
    'nav.myLessons':      'My Lessons',
    'nav.findTutor':      'Find a Tutor',
    'nav.profileSettings':'Profile settings',
    'nav.signOut':        'Sign out',

    // Common
    'common.save':        'Save Changes',
    'common.saving':      'Saving…',
    'common.saved':       'Saved!',
    'common.error':       'Error — retry',
    'common.cancel':      'Cancel',
    'common.loading':     'Loading…',
    'common.viewAll':     'View all →',

    // Topbar / language toggle
    'lang.toggleTitle':   'Switch language',

    // Dashboard
    'dashboard.crumb':           'Dashboard',
    'dashboard.kicker':          'Dashboard',
    'dashboard.welcome':         'Welcome back.',
    'dashboard.subtitleTeacher': "Here's your week at a glance and pending lesson requests.",
    'dashboard.subtitleStudent': 'Track your lesson requests and find new tutors.',
    'dashboard.upcoming':        'Upcoming lessons',
    'dashboard.pending':         'Pending requests',
    'dashboard.awaiting':        'Awaiting reply',
    'dashboard.calendar':        'Lesson Calendar',
    'dashboard.calendarSub':     'All requests, accepted and rejected lessons.',
    'dashboard.pendingTitle':    'Pending Requests',
    'dashboard.noPending':       'No pending requests',
    'dashboard.myRequests':      'My Lesson Requests',
    'dashboard.myRequestsSub':   "Requests you've sent to teachers.",
    'dashboard.noRequests':      'No requests yet',
    'dashboard.quickActions':    'Quick Actions',
    'dashboard.findTutor':       'Find a tutor',
    'dashboard.requestLesson':   'Request a lesson',
    'dashboard.notes':           'Notes',
    'dashboard.struggles':       'Struggles with',
    'dashboard.expects':         'Expects',
    'dashboard.accept':          'Accept',
    'dashboard.reject':          'Reject',
    'dashboard.student':         'Student',
    'dashboard.teacher':         'Teacher',

    // Lesson detail modal
    'lessonDetail.title':       'Lesson details',
    'lessonDetail.when':        'When',
    'lessonDetail.grade':       'Grade / level',
    'lessonDetail.contact':     'Contact',
    'lessonDetail.phone':       'Phone',
    'lessonDetail.subject':     'Subject',
    'lessonDetail.subjects':    'Subjects',
    'lessonDetail.tags':        'Topics',
    'lessonDetail.price':       'Price',
    'lessonDetail.aboutTutor':  'About the tutor',
    'lessonDetail.noStudentInfo': 'This student hasn\'t added profile details yet.',
    'lessonDetail.noTutorInfo':   'This tutor hasn\'t added profile details yet.',
    'lessonDetail.close':       'Close',
    'lessonDetail.join':        'Join lesson',
    'lessonDetail.startsIn':    'Starts in',
    'lessonDetail.live':        'Live now',
    'lessonDetail.ended':       'Lesson ended',
    'lessonDetail.lessonRoom':  'Lesson room',

    // Status
    'status.pending':  'Pending',
    'status.accepted': 'Accepted',
    'status.rejected': 'Rejected',

    // Profile
    'profile.crumb':           'Profile Settings',
    'profile.kicker':          'Profile Settings',
    'profile.title':           'Profile Settings',
    'profile.subtitleTeacher': 'Complete your profile so students can find and book you.',
    'profile.subtitleStudent': 'Manage your basic account details.',
    'profile.preview':         'Preview Profile',
    'profile.basic':           '01 — Basic Information',
    'profile.aboutStudent':    '02 — About You',
    'profile.aboutStudentSub': 'Share a bit about yourself so teachers can prepare for your lesson.',
    'profile.photo':           'Photo',
    'profile.upload':          'Upload photo',
    'profile.uploading':       'Uploading…',
    'profile.fullName':        'Full name',
    'profile.fullNamePh':      'Your full name',
    'profile.phone':           'Phone number',
    'profile.phonePh':         '+370 6XX XXXXX',
    'profile.phoneRequired':   'Please enter your phone number.',
    'profile.headline':        'Headline',
    'profile.grade':           'Grade / level',
    'profile.gradePh':         'e.g. 10th grade · IB Year 1 · University freshman',
    'profile.struggles':       "What's hardest to understand?",
    'profile.strugglesPh':     'Topics or concepts you struggle with — e.g. quadratic equations, essay structure…',
    'profile.expectations':    'What do you expect from lessons?',
    'profile.expectationsPh':  'What outcome are you aiming for — pass an exam, build confidence, prep for a test?',

    // Create lesson
    'create.crumb':         'Request Lesson',
    'create.kicker':        'Request Lesson',
    'create.title':         'Request a Lesson',
    'create.subtitle':      "Pick a tutor and propose a time. They'll accept or reject.",
    'create.send':          'Send Request',
    'create.sending':       'Sending…',
    'create.tutor':         '01 — Tutor',
    'create.chooseTutor':   'Choose a tutor',
    'create.selectTutor':   'Select a tutor',
    'create.subject':       'Subject',
    'create.subjectPh':     'Choose a subject',
    'create.noSubjects':    'This tutor has not set their subjects yet.',
    'create.dateTime':      '02 — Date & Time',
    'create.date':          'Date',
    'create.time':          'Time (24h)',
    'create.notes':         '03 — Notes (optional)',
    'create.notesPh':       'Topic you want to cover, things you struggle with, etc.',
    'create.preview':       'Request Preview',
    'create.notSet':        'Date and time not set',
    'create.noTutor':       'No tutor selected',
    'create.priceOnReq':    'Price on request',
    'create.pickFirst':     'Pick a tutor and date first',
    'create.noAvailability':'This tutor has not set their availability yet.',
    'create.noSlotsThisDay':'No available slots on this day.',
    'create.pickSlot':      'Pick an available slot',
    'create.pickTutorFirst':'Select a tutor to see available slots.',
    'create.weekPrev':      'Previous week',
    'create.weekNext':      'Next week',
  },

  lt: {
    // Sidebar
    'nav.overview':       'APŽVALGA',
    'nav.lessons':        'PAMOKOS',
    'nav.discover':       'ATRASKITE',
    'nav.dashboard':      'Skydelis',
    'nav.messages':       'Žinutės',
    'nav.requestLesson':  'Užsakyti pamoką',
    'nav.myLessons':      'Mano pamokos',
    'nav.findTutor':      'Rasti korepetitorių',
    'nav.profileSettings':'Profilio nustatymai',
    'nav.signOut':        'Atsijungti',

    // Common
    'common.save':        'Išsaugoti pakeitimus',
    'common.saving':      'Išsaugoma…',
    'common.saved':       'Išsaugota!',
    'common.error':       'Klaida — bandykite dar kartą',
    'common.cancel':      'Atšaukti',
    'common.loading':     'Kraunama…',
    'common.viewAll':     'Žiūrėti visus →',

    // Topbar / language toggle
    'lang.toggleTitle':   'Keisti kalbą',

    // Dashboard
    'dashboard.crumb':           'Skydelis',
    'dashboard.kicker':          'Skydelis',
    'dashboard.welcome':         'Sveiki sugrįžę.',
    'dashboard.subtitleTeacher': 'Čia jūsų savaitės apžvalga ir laukiančios pamokų užklausos.',
    'dashboard.subtitleStudent': 'Sekite savo pamokų užklausas ir raskite naujų korepetitorių.',
    'dashboard.upcoming':        'Artimiausios pamokos',
    'dashboard.pending':         'Laukiančios užklausos',
    'dashboard.awaiting':        'Laukiama atsakymo',
    'dashboard.calendar':        'Pamokų kalendorius',
    'dashboard.calendarSub':     'Visos užklausos, priimtos ir atmestos pamokos.',
    'dashboard.pendingTitle':    'Laukiančios užklausos',
    'dashboard.noPending':       'Nėra laukiančių užklausų',
    'dashboard.myRequests':      'Mano pamokų užklausos',
    'dashboard.myRequestsSub':   'Užklausos, kurias išsiuntėte korepetitoriams.',
    'dashboard.noRequests':      'Dar nėra užklausų',
    'dashboard.quickActions':    'Greiti veiksmai',
    'dashboard.findTutor':       'Rasti korepetitorių',
    'dashboard.requestLesson':   'Užsakyti pamoką',
    'dashboard.notes':           'Pastabos',
    'dashboard.struggles':       'Sunkiai sekasi',
    'dashboard.expects':         'Tikisi',
    'dashboard.accept':          'Priimti',
    'dashboard.reject':          'Atmesti',
    'dashboard.student':         'Mokinys',
    'dashboard.teacher':         'Korepetitorius',

    // Lesson detail modal
    'lessonDetail.title':       'Pamokos informacija',
    'lessonDetail.when':        'Kada',
    'lessonDetail.grade':       'Klasė / lygis',
    'lessonDetail.contact':     'El. paštas',
    'lessonDetail.phone':       'Telefonas',
    'lessonDetail.subject':     'Dalykas',
    'lessonDetail.subjects':    'Dalykai',
    'lessonDetail.tags':        'Temos',
    'lessonDetail.price':       'Kaina',
    'lessonDetail.aboutTutor':  'Apie korepetitorių',
    'lessonDetail.noStudentInfo': 'Šis mokinys dar neužpildė profilio.',
    'lessonDetail.noTutorInfo':   'Šis korepetitorius dar neužpildė profilio.',
    'lessonDetail.close':       'Uždaryti',
    'lessonDetail.join':        'Prisijungti prie pamokos',
    'lessonDetail.startsIn':    'Prasidės po',
    'lessonDetail.live':        'Vyksta dabar',
    'lessonDetail.ended':       'Pamoka pasibaigė',
    'lessonDetail.lessonRoom':  'Pamokos kambarys',

    // Status
    'status.pending':  'Laukia',
    'status.accepted': 'Priimta',
    'status.rejected': 'Atmesta',

    // Profile
    'profile.crumb':           'Profilio nustatymai',
    'profile.kicker':          'Profilio nustatymai',
    'profile.title':           'Profilio nustatymai',
    'profile.subtitleTeacher': 'Užpildykite profilį, kad mokiniai galėtų jus rasti ir užsakyti pamoką.',
    'profile.subtitleStudent': 'Tvarkykite pagrindinius paskyros duomenis.',
    'profile.preview':         'Peržiūrėti profilį',
    'profile.basic':           '01 — Pagrindinė informacija',
    'profile.aboutStudent':    '02 — Apie jus',
    'profile.aboutStudentSub': 'Papasakokite apie save, kad korepetitorius galėtų pasiruošti pamokai.',
    'profile.photo':           'Nuotrauka',
    'profile.upload':          'Įkelti nuotrauką',
    'profile.uploading':       'Įkeliama…',
    'profile.fullName':        'Vardas ir pavardė',
    'profile.fullNamePh':      'Jūsų vardas ir pavardė',
    'profile.phone':           'Telefono numeris',
    'profile.phonePh':         '+370 6XX XXXXX',
    'profile.phoneRequired':   'Įveskite savo telefono numerį.',
    'profile.headline':        'Antraštė',
    'profile.grade':           'Klasė / lygis',
    'profile.gradePh':         'pvz. 10 klasė · IB 1 metai · I kurso studentas',
    'profile.struggles':       'Kas sunkiausiai suprantama?',
    'profile.strugglesPh':     'Temos ar sąvokos, su kuriomis sunku — pvz. kvadratinės lygtys, rašinio struktūra…',
    'profile.expectations':    'Ko tikitės iš pamokų?',
    'profile.expectationsPh':  'Kokio rezultato siekiate — išlaikyti egzaminą, įgyti pasitikėjimo, pasiruošti testui?',

    // Create lesson
    'create.crumb':         'Užsakyti pamoką',
    'create.kicker':        'Užsakyti pamoką',
    'create.title':         'Užsakyti pamoką',
    'create.subtitle':      'Pasirinkite korepetitorių ir pasiūlykite laiką. Jis priims arba atmes.',
    'create.send':          'Siųsti užklausą',
    'create.sending':       'Siunčiama…',
    'create.tutor':         '01 — Korepetitorius',
    'create.chooseTutor':   'Pasirinkite korepetitorių',
    'create.selectTutor':   'Pasirinkite korepetitorių',
    'create.subject':       'Dalykas',
    'create.subjectPh':     'Pasirinkite dalyką',
    'create.noSubjects':    'Šis korepetitorius dar nenurodė dėstomų dalykų.',
    'create.dateTime':      '02 — Data ir laikas',
    'create.date':          'Data',
    'create.time':          'Laikas (24 val.)',
    'create.notes':         '03 — Pastabos (neprivaloma)',
    'create.notesPh':       'Tema, kurią norite aptarti, su kuo susiduriate ir t. t.',
    'create.preview':       'Užklausos peržiūra',
    'create.notSet':        'Data ir laikas nenustatyti',
    'create.noTutor':       'Korepetitorius nepasirinktas',
    'create.priceOnReq':    'Kaina pagal užklausą',
    'create.pickFirst':     'Pirmiausia pasirinkite korepetitorių ir datą',
    'create.noAvailability':'Šis korepetitorius dar nenurodė savo laisvų laikų.',
    'create.noSlotsThisDay':'Šią dieną laisvų laikų nėra.',
    'create.pickSlot':      'Pasirinkite laisvą laiką',
    'create.pickTutorFirst':'Pasirinkite korepetitorių, kad pamatytumėte laisvus laikus.',
    'create.weekPrev':      'Ankstesnė savaitė',
    'create.weekNext':      'Kita savaitė',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) setLangState(stored);
  }, []);

  const setLang = (next) => {
    if (!SUPPORTED.includes(next)) return;
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  };

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext) ?? { lang: 'en', setLang: () => {}, t: (k) => k };
}
