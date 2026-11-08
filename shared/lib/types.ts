export type DesignerSlug = 'markanti' | 'sundar';

export type BookingStatus =
  | 'Pending'
  | 'Accepted'
  | 'In Design'
  | 'Review'
  | 'Revisions'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export const BOOKING_STATUSES: BookingStatus[] = [
  'Pending',
  'Accepted',
  'In Design',
  'Review',
  'Revisions',
  'Delivered',
  'Completed',
];

export interface StatusEvent {
  status: BookingStatus;
  at: string;
  note?: string;
}

export interface BookingFile {
  name: string;
  url?: string;
  size?: number;
  type?: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  designer_slug: DesignerSlug | null;
  website_type: string;
  website_name: string;
  description: string;
  pages_needed: string;
  features: string[];
  style_preferences: string;
  reference_links: string;
  files: BookingFile[];
  budget: string;
  deadline: string;
  language: string;
  package_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string;
  contact_method: string;
  status: BookingStatus;
  history: StatusEvent[];
  rating: number | null;
  review: string | null;
  internal_note: string;
  client_uid: string | null;
  created_at: string;
  updated_at: string;
}

export interface Designer {
  slug: DesignerSlug;
  name: string;
  short_name: string;
  title: string;
  tagline: string;
  bio: string;
  skills: string[];
  tools: string[];
  experience: string;
  photo_color: [string, string];
  starting_price: number;
  avg_delivery_days: number;
  availability: 'Available' | 'Busy';
  availability_note: string;
  whatsapp: string;
  email: string;
  stats: { projects: number; clients: number; rating: number };
}

export interface Project {
  id: string;
  designer: DesignerSlug;
  title: string;
  description: string;
  category: string;
  live_url: string;
  year: string;
  palette: [string, string, string];
  /** Real screenshot of the live site (in /public/images). Falls back to generated art. */
  image?: string;
}

export interface Review {
  id: string;
  designer: DesignerSlug;
  client: string;
  role: string;
  rating: number;
  text: string;
  project: string;
  date: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  price_note: string;
  delivery: string;
  summary: string;
  features: string[];
  popular: boolean;
  website_types: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: string[];
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  client: string;
  role: string;
  text: string;
  rating: number;
  project: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'designer';
  designer_slug: DesignerSlug | null;
  provider: 'email' | 'google' | 'demo';
}
