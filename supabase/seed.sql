-- ---------------------------------------------------------------------------
-- Duo Pixel Agency — seed data for Supabase
-- Run AFTER supabase/schema.sql. Safe to re-run (upserts).
-- ---------------------------------------------------------------------------

-- Designers ---------------------------------------------------------------
insert into public.designers
  (slug, name, short_name, title, tagline, bio, skills, tools, experience,
   photo_color, starting_price, avg_delivery_days, availability, availability_note,
   whatsapp, email, stats)
values
(
  'markanti',
  'Markanti Hanmanth',
  'Markanti',
  'Web Designer and Developer',
  'Designs it, then actually builds it.',
  'I design and ship full websites myself — no hand-off gaps between the mockup and the code. Over the last few years I have built farm-tracking dashboards, multi-vendor marketplaces and portal-style platforms for colleges and businesses. I care about clean structure, fast load times and interfaces that still feel obvious to a first-time user on a phone.',
  array['React','TypeScript','Supabase','Tailwind CSS','PWAs','UI design','AI-integrated sites','REST APIs','Responsive layouts'],
  array['Figma','VS Code','Vercel','Supabase','Git','Lighthouse','Framer Motion'],
  '4+ years · 40+ projects shipped',
  array['#B9FF39','#3E7BFF'],
  15000, 12, 'Available', 'Taking 2 new projects this month',
  '919876543210', 'hanmanthmarkanti@gmail.com',
  '{"projects": 42, "clients": 36, "rating": 4.9}'::jsonb
),
(
  'sundar',
  'Sundar',
  'Sundar',
  'Web Designer',
  'Landing pages that make people click.',
  'I am a designer focused on landing pages, brand systems and responsive marketing sites. My work starts with the message — what the visitor should understand in five seconds — and then builds the layout, type and colour around it. If you need a site that looks premium on a phone and converts cold WhatsApp traffic, that is exactly what I do.',
  array['UI/UX design','Landing pages','Branding','Responsive design','Design systems','Copy layout','Prototyping','Accessibility basics'],
  array['Figma','FigJam','Illustrator','Framer','Webflow','Notion'],
  '3+ years · 55+ pages designed',
  array['#FF7A45','#B9FF39'],
  8000, 7, 'Busy', 'Fully booked this week · next slot in 4 days',
  '919876543211', 'karunasrikaram@gmail.com',
  '{"projects": 58, "clients": 47, "rating": 4.8}'::jsonb
)
on conflict (slug) do nothing;

-- Packages ----------------------------------------------------------------
insert into public.packages (id, name, price, price_note, delivery, summary, features, popular, website_types)
values
('landing','Landing Page',7999,'one-time','5 – 7 days',
 'One high-converting page, designed and built, ready to share on WhatsApp or run ads against.',
 array['Custom mobile-first design','Hero, features, proof, FAQ, CTA sections','WhatsApp / call / form lead capture','Basic SEO + fast load score','1 revision round','Free domain & hosting setup help'],
 false, array['Landing page','Portfolio']),
('business','Business Website',19999,'one-time','10 – 14 days',
 'A complete 5-page website for shops, clinics, studios and service businesses.',
 array['Up to 6 pages with custom design','Contact form + Google Maps + WhatsApp','Services, gallery and testimonials blocks','On-page SEO & analytics setup','2 revision rounds','30 days of post-launch support'],
 true, array['Business','Portfolio']),
('ecommerce','E-commerce',44999,'one-time','3 – 4 weeks',
 'A real store with products, cart, checkout, payments and an admin panel you can run yourself.',
 array['Product catalogue + categories','Cart, checkout & online payments','Order management admin panel','Discount codes & shipping rules','Transactional email setup','2 revision rounds + training call'],
 false, array['E-commerce']),
('webapp','Web App / Portal',74999,'starting from','4 – 6 weeks',
 'Login-based platforms: dashboards, college portals, booking systems and internal tools.',
 array['Auth, roles & permissions','Database design + realtime updates','Dashboard with charts & exports','File uploads and notifications','Admin panel for your team','Weekly demos until you sign off'],
 false, array['Web app','College / Event Portal']),
('custom','Custom',0,'scope-based quote','timeline set together',
 'Anything unusual — AI features, integrations, migrations or a mix of the above.',
 array['Free 30-minute discovery call','Written scope, price and timeline','Fixed quote — no surprise invoices','Staged payments tied to milestones','Source code and IP handed to you'],
 false, array['Other'])
on conflict (id) do nothing;

-- Reviews -----------------------------------------------------------------
insert into public.reviews (id, designer, client, role, rating, text, project, date)
values
('r1','markanti','Ravi Teja','Founder, KrishiSetu',5,
 'Markanti handled design and code end to end. We launched in three weeks and the dashboard still loads fast on village networks.',
 'Farm tracking PWA','2025-11-02'),
('r2','markanti','Anitha Rao','Ops Lead, KhetBazaar',5,
 'He understood the marketplace flow better than we did. Payments, admin panel, seller roles — all shipped without a single re-explanation.',
 'Marketplace build','2025-09-18'),
('r3','markanti','Prof. K. Suresh','Registrar, CampusPort',4.5,
 '4,000 students onboarded in the first month with almost no support tickets. Communication was clear at every stage.',
 'Student portal','2025-06-30'),
('r4','sundar','Meera Nair','Owner, Brew & Bloom',5,
 'Sundar asked the right questions first. The page looks beautiful and our WhatsApp orders went up the week it went live.',
 'Café landing page','2025-10-11'),
('r5','sundar','Vikram Shetty','Director, Nivaas Realty',5,
 'The rebrand and site refresh paid for itself in six weeks. Enquiries doubled and the site finally matches how premium we are.',
 'Brand + business site','2025-07-22'),
('r6','sundar','Kavya Iyer','Marketing, Pulse Fitness',4.5,
 'Fast, tidy and genuinely creative. Every revision came back the same day with a short explanation of why it works better.',
 'Launch page','2025-12-04')
on conflict (id) do nothing;

-- Designer logins: create these two users in Authentication -> Users first
-- (email + password), then link them to a designer slug:
--
--   markanti@duopixel.agency  / any strong password  -> slug 'markanti'
--   sundar@duopixel.agency     / any strong password  -> slug 'sundar'
--
-- The app maps those two emails to their dashboard automatically.
