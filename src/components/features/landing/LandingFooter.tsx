import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

/* Inline SVG social icons — lucide-react v1 no longer ships brand icons */
function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zm6.5 0h3.84v2.14h.05C12 9.36 13.5 8 15.9 8c4.15 0 4.91 2.73 4.91 6.28V24h-4v-8.85c0-2.11-.04-4.83-2.94-4.83-2.95 0-3.4 2.3-3.4 4.68V24h-4V8.5z" />
    </svg>
  );
}
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
    </svg>
  );
}
function IconTwitterX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const FOOTER_LINKS = {
  Company: [
    { label: "About",    href: "/#how-it-works" },
    { label: "Careers",  href: "#" },
    { label: "Blog",     href: "#" },
  ],
  Services: [
    { label: "Internet",  href: "/#services" },
    { label: "Cloud",     href: "/#services" },
    { label: "Software",  href: "/#services" },
    { label: "Security",  href: "/#services" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us",  href: "mailto:support@erp-system.io" },
    { label: "FAQ",         href: "/#faq" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const SOCIAL = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/erp-system-demo",
    icon: IconLinkedin,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/erpsystemdemo",
    icon: IconFacebook,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/erpsystemdemo",
    icon: IconTwitterX,
  },
];

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">ERP  Sales & Marketing</span>
            </Link>

            {/* Contact */}
            <div className="mt-5 space-y-1.5 text-sm text-slate-400">
              <p>📧 support@erp-system.com</p>
              <p>📞 +880 17745-00810</p>
              <p>🏢 Dhaka, Bangladesh</p>
            </div>

            {/* Social */}
            <div className="mt-5 flex gap-3">
              {SOCIAL.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                {group}
              </h4>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-800 pt-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Shamim Hassan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
