import type {
  Designer,
  Faq,
  Package,
  Project,
  Review,
  Service,
  Testimonial,
} from './types';

export const AGENCY = {
  name: 'Duo Pixel Agency',
  tagline: 'Two designers. One pixel-perfect website.',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'duopixelagency@gmail.com',
  city: 'Hyderabad, India',
  hours: 'Mon – Sat · 9:30am – 7:00pm IST',
};

export const DESIGNERS: Designer[] = [
  {
    slug: 'markanti',
    name: 'Markanti Hanmanth',
    short_name: 'Markanti',
    title: 'Web Designer and Developer',
    tagline: 'Designs it, then actually builds it.',
    bio: 'I design and ship full websites myself — no hand-off gaps between the mockup and the code. Over the last few years I have built farm-tracking dashboards, multi-vendor marketplaces and portal-style platforms for colleges and businesses. I care about clean structure, fast load times and interfaces that still feel obvious to a first-time user on a phone.',
    skills: [
      'React',
      'TypeScript',
      'Supabase',
      'Tailwind CSS',
      'PWAs',
      'UI design',
      'AI-integrated sites',
      'REST APIs',
      'Responsive layouts',
    ],
    tools: ['Figma', 'VS Code', 'Vercel', 'Supabase', 'Git', 'Lighthouse', 'Framer Motion'],
    experience: '4+ years · 40+ projects shipped',
    photo_color: ['#B9FF39', '#3E7BFF'],
    starting_price: 15000,
    avg_delivery_days: 12,
    availability: 'Available',
    availability_note: 'Taking 2 new projects this month',
    whatsapp: '919876543210',
    email: 'hanmanthmarkanti@gmail.com',
    stats: { projects: 42, clients: 36, rating: 4.9 },
  },
  {
    slug: 'sundar',
    name: 'Sundar',
    short_name: 'Sundar',
    title: 'Web Designer',
    tagline: 'Landing pages that make people click.',
    bio: 'I am a designer focused on landing pages, brand systems and responsive marketing sites. My work starts with the message — what the visitor should understand in five seconds — and then builds the layout, type and colour around it. If you need a site that looks premium on a phone and converts cold WhatsApp traffic, that is exactly what I do.',
    skills: [
      'UI/UX design',
      'Landing pages',
      'Branding',
      'Responsive design',
      'Design systems',
      'Copy layout',
      'Prototyping',
      'Accessibility basics',
    ],
    tools: ['Figma', 'FigJam', 'Illustrator', 'Framer', 'Webflow', 'Notion'],
    experience: '3+ years · 55+ pages designed',
    photo_color: ['#FF7A45', '#B9FF39'],
    starting_price: 8000,
    avg_delivery_days: 7,
    availability: 'Busy',
    availability_note: 'Fully booked this week · next slot in 4 days',
    whatsapp: '919876543211',
    email: 'karunasrikaram@gmail.com',
    stats: { projects: 58, clients: 47, rating: 4.8 },
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'hanmanth-portfolio',
    designer: 'markanti',
    title: 'Hanmanth Portfolio',
    description:
      'Personal portfolio of Markanti Hanmanth - full-stack developer building AI-powered web apps with React, Vite, Tailwind and AI.',
    category: 'Portfolio',
    live_url: 'https://hanmanth-portfolio-k8guugrme-cherry-ff88.vercel.app/',
    year: '2026',
    palette: ['#0E1B12', '#B9FF39', '#1F6F4A'],
  },
  {
    id: 'sundar-ecommerce',
    designer: 'sundar',
    title: 'Artisan Market - E-commerce',
    description:
      'Small e-commerce site for an artisan food brand: catalogue, cart, checkout and WhatsApp handoff.',
    category: 'E-commerce',
    live_url: 'https://artisanmarket.example.com',
    year: '2026',
    palette: ['#101014', '#FFB020', '#2E2E38'],
  },
  {
    id: 'sundar-restaurant',
    designer: 'sundar',
    title: 'Casa Verde Restaurant',
    description:
      'Restaurant website: menu, story, location, hours and reservation path, mobile-first for walk-in traffic.',
    category: 'Business Website',
    live_url: 'https://casaverde.example.com',
    year: '2026',
    palette: ['#17110C', '#FF7A45', '#4A2E1C'],
  },
  {
    id: 'sundar-saas',
    designer: 'sundar',
    title: 'Northwind SaaS',
    description:
      'SaaS product website for a client ops tool: landing page, pricing, product sections and app screenshots.',
    category: 'SaaS',
    live_url: 'https://northwind.example.com',
    year: '2026',
    palette: ['#0B0B0D', '#E9FF3D', '#2C2C10'],
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    designer: 'markanti',
    client: 'Ravi Teja',
    role: 'Founder, KrishiSetu',
    rating: 5,
    text: 'Markanti handled design and code end to end. We launched in three weeks and the dashboard still loads fast on village networks.',
    project: 'Farm tracking PWA',
    date: '2025-11-02',
  },
  {
    id: 'r2',
    designer: 'markanti',
    client: 'Anitha Rao',
    role: 'Ops Lead, KhetBazaar',
    rating: 5,
    text: 'He understood the marketplace flow better than we did. Payments, admin panel, seller roles — all shipped without a single re-explanation.',
    project: 'Marketplace build',
    date: '2025-09-18',
  },
  {
    id: 'r3',
    designer: 'markanti',
    client: 'Prof. K. Suresh',
    role: 'Registrar, CampusPort',
    rating: 4.5,
    text: '4,000 students onboarded in the first month with almost no support tickets. Communication was clear at every stage.',
    project: 'Student portal',
    date: '2025-06-30',
  },
  {
    id: 'r4',
    designer: 'sundar',
    client: 'Meera Nair',
    role: 'Owner, Brew & Bloom',
    rating: 5,
    text: 'Sundar asked the right questions first. The page looks beautiful and our WhatsApp orders went up the week it went live.',
    project: 'Café landing page',
    date: '2025-10-11',
  },
  {
    id: 'r5',
    designer: 'sundar',
    client: 'Vikram Shetty',
    role: 'Director, Nivaas Realty',
    rating: 5,
    text: 'The rebrand and site refresh paid for itself in six weeks. Enquiries doubled and the site finally matches how premium we are.',
    project: 'Brand + business site',
    date: '2025-07-22',
  },
  {
    id: 'r6',
    designer: 'sundar',
    client: 'Kavya Iyer',
    role: 'Marketing, Pulse Fitness',
    rating: 4.5,
    text: 'Fast, tidy and genuinely creative. Every revision came back the same day with a short explanation of why it works better.',
    project: 'Launch page',
    date: '2025-12-04',
  },
];

export const PACKAGES: Package[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    price: 7999,
    price_note: 'one-time',
    delivery: '5 – 7 days',
    summary: 'One high-converting page, designed and built, ready to share on WhatsApp or run ads against.',
    features: [
      'Custom mobile-first design',
      'Hero, features, proof, FAQ, CTA sections',
      'WhatsApp / call / form lead capture',
      'Basic SEO + fast load score',
      '1 revision round',
      'Free domain & hosting setup help',
    ],
    popular: false,
    website_types: ['Landing page', 'Portfolio'],
  },
  {
    id: 'business',
    name: 'Business Website',
    price: 19999,
    price_note: 'one-time',
    delivery: '10 – 14 days',
    summary: 'A complete 5-page website for shops, clinics, studios and service businesses.',
    features: [
      'Up to 6 pages with custom design',
      'Contact form + Google Maps + WhatsApp',
      'Services, gallery and testimonials blocks',
      'On-page SEO & analytics setup',
      '2 revision rounds',
      '30 days of post-launch support',
    ],
    popular: true,
    website_types: ['Business', 'Portfolio'],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    price: 44999,
    price_note: 'one-time',
    delivery: '3 – 4 weeks',
    summary: 'A real store with products, cart, checkout, payments and an admin panel you can run yourself.',
    features: [
      'Product catalogue + categories',
      'Cart, checkout & online payments',
      'Order management admin panel',
      'Discount codes & shipping rules',
      'Transactional email setup',
      '2 revision rounds + training call',
    ],
    popular: false,
    website_types: ['E-commerce'],
  },
  {
    id: 'webapp',
    name: 'Web App / Portal',
    price: 74999,
    price_note: 'starting from',
    delivery: '4 – 6 weeks',
    summary: 'Login-based platforms: dashboards, college portals, booking systems and internal tools.',
    features: [
      'Auth, roles & permissions',
      'Database design + realtime updates',
      'Dashboard with charts & exports',
      'File uploads and notifications',
      'Admin panel for your team',
      'Weekly demos until you sign off',
    ],
    popular: false,
    website_types: ['Web app', 'College / Event Portal'],
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 0,
    price_note: 'scope-based quote',
    delivery: 'timeline set together',
    summary: 'Anything unusual — AI features, integrations, migrations or a mix of the above.',
    features: [
      'Free 30-minute discovery call',
      'Written scope, price and timeline',
      'Fixed quote — no surprise invoices',
      'Staged payments tied to milestones',
      'Source code and IP handed to you',
    ],
    popular: false,
    website_types: ['Other'],
  },
];

export const SERVICES: Service[] = [
  {
    id: 's-design',
    title: 'Website design',
    icon: 'palette',
    description:
      'Custom layouts drawn for your brand — never a bought template, never a page builder.',
    points: ['Mobile-first wireframes', 'Brand colour & type system', 'Figma prototype before code'],
  },
  {
    id: 's-build',
    title: 'Development & launch',
    icon: 'code',
    description:
      'React + TypeScript builds that load fast, rank well and are easy to hand over.',
    points: ['Lighthouse 90+ target', 'SEO & analytics wired in', 'Hosting and domain handled'],
  },
  {
    id: 's-commerce',
    title: 'Online stores',
    icon: 'cart',
    description: 'Product pages, cart, checkout and payments with an admin panel you control.',
    points: ['UPI, cards & wallets', 'Order & stock management', 'Discount and shipping rules'],
  },
  {
    id: 's-portals',
    title: 'Portals & dashboards',
    icon: 'layout',
    description: 'Login-based systems for colleges, events, farms and internal teams.',
    points: ['Roles & permissions', 'Realtime data', 'CSV / PDF exports'],
  },
  {
    id: 's-brand',
    title: 'Branding basics',
    icon: 'sparkles',
    description: 'Wordmark, palette and social kit so the site and your Instagram finally match.',
    points: ['Logo refresh', 'Colour & font kit', 'Social banner templates'],
  },
  {
    id: 's-care',
    title: 'Care plans',
    icon: 'shield',
    description: 'Monthly updates, backups and small changes after launch — or we teach you to do it.',
    points: ['Content edits', 'Backups & uptime checks', 'Optional training call'],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    client: 'Ravi Teja',
    role: 'Founder, KrishiSetu',
    rating: 5,
    project: 'Web app portal',
    text: 'We came with a rough idea on a WhatsApp voice note. Three weeks later we had a working product with logins, payments and a dashboard. The booking flow on this site is exactly how the project ran — clear steps, no chaos.',
  },
  {
    id: 't2',
    client: 'Meera Nair',
    role: 'Owner, Brew & Bloom',
    rating: 5,
    project: 'Landing page',
    text: 'I was nervous about hiring online. They sent a design the next day, took my feedback on WhatsApp and launched in six days. Our weekend orders jumped immediately.',
  },
  {
    id: 't3',
    client: 'Vikram Shetty',
    role: 'Director, Nivaas Realty',
    rating: 5,
    project: 'Business website',
    text: 'Professional, punctual and honest about what would cost more. The site loads instantly on 4G and our enquiry calls have doubled since launch.',
  },
  {
    id: 't4',
    client: 'Kavya Iyer',
    role: 'Marketing, Pulse Fitness',
    rating: 4.5,
    project: 'Launch page',
    text: 'Two designers meant we never waited on one person. When Sundar was busy, Markanti jumped in and the deadline still held.',
  },
];

export const FAQS: Faq[] = [
  {
    id: 'f1',
    question: 'How does the booking process work?',
    answer:
      'Fill the 6-step form — designer, website type, details, budget, contact, review. You get a booking ID (DPA-XXXXXX) instantly and can track it on the Track page with your phone number. We reply on WhatsApp within one working day to accept and start.',
  },
  {
    id: 'f2',
    question: 'Do I need to know anything technical?',
    answer:
      'Nothing at all. You tell us what you want in plain language, we handle design, code, hosting and domain. At handover you get a short screen recording showing how to edit content yourself.',
  },
  {
    id: 'f3',
    question: 'How much does a website cost?',
    answer:
      'Landing pages start at ₹7,999, business sites at ₹19,999, stores at ₹44,999 and portals at ₹74,999. The final quote is fixed after the free discovery call — no surprise invoices.',
  },
  {
    id: 'f4',
    question: 'How long will my project take?',
    answer:
      'Landing pages ship in 5 – 7 days, business sites in 10 – 14 days, stores in 3 – 4 weeks and portals in 4 – 6 weeks. Your booking shows the live status so you always know where things stand.',
  },
  {
    id: 'f5',
    question: 'Can I choose which designer works on my site?',
    answer:
      'Yes. Step 1 of the booking form lets you pick Markanti, Sundar, or "no preference" — in which case we match you based on the website type and current availability.',
  },
  {
    id: 'f6',
    question: 'What if I do not like the design?',
    answer:
      'Every package includes revision rounds, and we show you a Figma prototype before any code is written. If the first direction is still not right, we redesign the concept once at no extra cost.',
  },
  {
    id: 'f7',
    question: 'Do you handle hosting, domain and emails?',
    answer:
      'Yes. We register the domain, connect hosting, set up SSL and connect your business email. The cost is billed at actuals with receipts — we never mark it up.',
  },
  {
    id: 'f8',
    question: 'What happens after the website goes live?',
    answer:
      'Every project includes 30 days of free fixes. After that you can take full control, or book a care plan for updates, backups and small content edits each month.',
  },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tell us what you want',
    body: 'A 6-minute form: your designer, website type, pages, features, budget and deadline. Upload a logo or sketch if you have one.',
  },
  {
    step: '02',
    title: 'We confirm and design',
    body: 'You get a booking ID instantly. Within one working day we confirm scope on WhatsApp, then share a Figma design before writing code.',
  },
  {
    step: '03',
    title: 'Review, revise, launch',
    body: 'Track every stage in your booking timeline. Approve, request revisions, then go live with domain, hosting and analytics handled.',
  },
];

export const WEBSITE_TYPES = [
  'Landing page',
  'Business',
  'Portfolio',
  'E-commerce',
  'Web app',
  'College / Event Portal',
  'Other',
];

export const FEATURE_OPTIONS = [
  'Login / user accounts',
  'Online payments',
  'Admin panel',
  'Live chat',
  'Booking / appointments',
  'Multi-language',
  'Blog / news',
  'Photo & video gallery',
  'Search & filters',
  'Maps & directions',
  'Contact form',
  'Email notifications',
  'Analytics & reports',
  'AI features / chatbot',
  'Subscription / membership',
  'Social media integration',
];

export const BUDGET_OPTIONS = [
  'Under ₹10,000',
  '₹10,000 – ₹25,000',
  '₹25,000 – ₹50,000',
  '₹50,000 – ₹1,00,000',
  'Above ₹1,00,000',
  'Not sure yet',
];

export const DEADLINE_OPTIONS = [
  'ASAP (within 1 week)',
  '2 – 3 weeks',
  'Within a month',
  '1 – 2 months',
  'Flexible / no deadline',
];

export const LANGUAGE_OPTIONS = ['English', 'हिन्दी (Hindi)', 'తెలుగు (Telugu)', 'Mixed'];

export const CONTACT_METHODS = ['WhatsApp', 'Phone call', 'Email'];

export const DESIGNER_OPTIONS = [
  { slug: 'markanti' as const, label: 'Markanti Hanmanth' },
  { slug: 'sundar' as const, label: 'Sundar' },
  { slug: null, label: 'No preference — assign me anyone' },
];
