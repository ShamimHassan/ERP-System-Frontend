/**
 * Landing Page — ERP Sales & Marketing
 *
 * Full-featured public landing page per the content outline:
 * Hero → Features → Services → How It Works → Role Access →
 * Statistics → Testimonials → FAQ → CTA → Footer
 *
 * Dark/light aware via Tailwind dark: variants + next-themes.
 * Navbar shows 4 links when logged-out, 6 links + profile dropdown when logged-in.
 */

import LandingPage from "@/components/features/landing/LandingPage";

export default function RootPage() {
  return <LandingPage />;
}
