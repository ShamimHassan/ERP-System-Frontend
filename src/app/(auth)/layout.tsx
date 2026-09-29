"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

/**
 * Auth layout — full-viewport two-column, no topbar, no scroll.
 * Left:  light blue branded panel with illustration (lg+).
 * Right: white form panel.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left panel */}
      <AuthLeftPanel />

      {/* Right panel — form, no scroll */}
      <main className="flex w-full flex-col items-center justify-center overflow-hidden bg-white px-8 dark:bg-slate-950 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Left branded panel — light blue, matches the reference illustration style
───────────────────────────────────────────────────────────────────────── */
function AuthLeftPanel() {
  const STATS = [
    { value: "1,200+", label: "Leads managed" },
    { value: "98%",    label: "Quotation accuracy" },
    { value: "24/7",   label: "System uptime" },
  ];

  const FEATURES = [
    { icon: "🎯", text: "Role-based access for every team level" },
    { icon: "📄", text: "Smart quotations with auto-approval flow" },
    { icon: "📊", text: "Real-time KPI dashboards" },
    { icon: "🔐", text: "Full audit trail on every action" },
  ];

  return (
    <aside className="relative hidden h-full w-1/2 shrink-0 flex-col overflow-hidden bg-[#ddeeff] dark:bg-slate-900 lg:flex">
      {/* Soft background circles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#b3d4f0]/50 dark:bg-slate-700/30" />
        <div className="absolute -bottom-16 -right-8 h-80 w-80 rounded-full bg-[#b3d4f0]/40 dark:bg-slate-700/20" />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 dark:bg-slate-600/10" />
      </div>

      <div className="relative flex h-full flex-col justify-between p-12">
        {/* Top — brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a6fa8]/20 dark:bg-slate-700">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <p className="text-base font-bold text-[#1a4a70] dark:text-slate-100">ERP System</p>
            <p className="text-sm text-[#4a7fa0] dark:text-slate-400">Sales &amp; Marketing</p>
          </div>
        </div>

        {/* Middle — illustration + headline */}
        <div className="space-y-5">
          <OfficeIllustration />

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold leading-tight text-[#1a3a5c] dark:text-slate-100 xl:text-4xl">
              Welcome back,<br />
              <span className="text-[#2a6fa8] dark:text-blue-400">let&apos;s close deals.</span>
            </h2>
            <p className="text-base leading-relaxed text-[#3a6080] dark:text-slate-400">
              Sign in to manage your pipeline, track leads, and drive revenue — all from one place.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t border-[#a0c8e8]/60 dark:border-slate-700 pt-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-[#1a3a5c] dark:text-slate-100">{s.value}</p>
                <p className="mt-0.5 text-sm text-[#4a7fa0] dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — feature bullets */}
        <div className="space-y-2.5 rounded-2xl border border-[#a0c8e8]/50 dark:border-slate-700 bg-white/30 dark:bg-slate-800/60 p-5 backdrop-blur-sm">
          {FEATURES.map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-lg">{f.icon}</span>
              <p className="text-sm text-[#1a4a70] dark:text-slate-300">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Office illustration — matches reference image style:
   light blue bg, person at desk, monitor with login UI,
   cactus, bookshelf, clock, speech bubble
───────────────────────────────────────────────────────────────────────── */
function OfficeIllustration() {
  return (
    <svg
      viewBox="0 0 480 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-h-52"
      aria-hidden="true"
    >
      {/* ── Background wall ── */}
      <rect x="0" y="0" width="480" height="260" rx="16" fill="#c8e3f5" />

      {/* ── Window (city view) ── */}
      <rect x="30" y="20" width="110" height="145" rx="6" fill="#e8f4ff" stroke="#a0c4e0" strokeWidth="1.5" />
      {/* Window cross */}
      <line x1="85" y1="20" x2="85" y2="165" stroke="#a0c4e0" strokeWidth="1.5" />
      <line x1="30" y1="90" x2="140" y2="90" stroke="#a0c4e0" strokeWidth="1.5" />
      {/* City buildings in window */}
      <rect x="38" y="55" width="18" height="35" rx="2" fill="#c0d8ec" />
      <rect x="60" y="40" width="22" height="50" rx="2" fill="#b8d2e8" />
      <rect x="92" y="50" width="16" height="40" rx="2" fill="#c0d8ec" />
      <rect x="112" y="60" width="14" height="30" rx="2" fill="#b8d2e8" />
      {/* Window sill */}
      <rect x="25" y="162" width="120" height="6" rx="3" fill="#a0c0d8" />

      {/* ── Floor line ── */}
      <rect x="0" y="210" width="480" height="50" rx="0" fill="#b8d8f0" />
      <rect x="0" y="208" width="480" height="5" rx="0" fill="#90b8d0" />

      {/* ── Desk ── */}
      <rect x="115" y="162" width="200" height="12" rx="4" fill="#2a5a8a" />
      {/* Desk legs */}
      <rect x="122" y="174" width="10" height="36" rx="3" fill="#1e4a72" />
      <rect x="293" y="174" width="10" height="36" rx="3" fill="#1e4a72" />

      {/* ── Chair ── */}
      {/* Chair seat */}
      <rect x="90" y="176" width="70" height="12" rx="5" fill="#e8a020" />
      {/* Chair back */}
      <rect x="90" y="140" width="14" height="38" rx="4" fill="#e8a020" />
      {/* Chair leg post */}
      <rect x="119" y="188" width="12" height="22" rx="3" fill="#555" />
      {/* Chair base */}
      <ellipse cx="125" cy="212" rx="22" ry="5" fill="#444" />
      {/* Chair wheels */}
      <circle cx="106" cy="213" r="4" fill="#333" />
      <circle cx="144" cy="213" r="4" fill="#333" />

      {/* ── Person ── */}
      {/* Legs (crossed/relaxed) */}
      <path d="M148 210 Q160 195 178 200 Q192 204 200 210" stroke="#6ab0d8" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M178 200 Q185 215 180 225" stroke="#6ab0d8" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Shoes */}
      <ellipse cx="182" cy="226" rx="12" ry="5" fill="#222" />
      <ellipse cx="165" cy="222" rx="10" ry="5" fill="#222" />
      {/* Body — suit jacket */}
      <rect x="130" y="130" width="48" height="58" rx="12" fill="#4a4a6a" />
      {/* Shirt/tie */}
      <rect x="150" y="132" width="8" height="30" rx="2" fill="#fff" />
      <rect x="152" y="138" width="4" height="18" rx="1" fill="#2a7abf" />
      {/* Arm to keyboard */}
      <path d="M155 160 Q195 165 225 163" stroke="#4a4a6a" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Head */}
      <circle cx="154" cy="118" r="20" fill="#f5c8a0" />
      {/* Hair */}
      <path d="M134 112 Q154 96 174 112 Q170 98 154 94 Q138 98 134 112Z" fill="#222" />
      {/* Face */}
      <circle cx="147" cy="119" r="2.5" fill="#8B5E3C" />
      <circle cx="161" cy="119" r="2.5" fill="#8B5E3C" />
      <path d="M148 128 Q154 133 160 128" stroke="#8B5E3C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Ear */}
      <ellipse cx="134" cy="118" rx="4" ry="6" fill="#f0b888" />

      {/* ── Speech bubble ── */}
      <rect x="58" y="75" width="56" height="36" rx="10" fill="#2a7abf" />
      <polygon points="82,111 90,122 98,111" fill="#2a7abf" />
      {/* Dots */}
      <circle cx="72" cy="93" r="5" fill="white" />
      <circle cx="86" cy="93" r="5" fill="white" />
      <circle cx="100" cy="93" r="5" fill="white" />

      {/* ── Monitor ── */}
      {/* Screen frame */}
      <rect x="220" y="72" width="160" height="96" rx="8" fill="#1a5a8a" />
      {/* Screen */}
      <rect x="226" y="78" width="148" height="82" rx="5" fill="#3a8abf" />
      {/* Monitor stand */}
      <rect x="292" y="168" width="16" height="12" rx="2" fill="#1a4a72" />
      <rect x="278" y="178" width="44" height="6" rx="3" fill="#1a4a72" />

      {/* ── Login UI on screen ── */}
      {/* "Sign In" title */}
      <rect x="268" y="87" width="50" height="6" rx="3" fill="white" opacity="0.7" />
      {/* Email field */}
      <rect x="238" y="100" width="124" height="14" rx="4" fill="white" opacity="0.9" />
      <rect x="242" y="104" width="40" height="5" rx="2" fill="#90b8d0" />
      {/* Password field */}
      <rect x="238" y="120" width="124" height="14" rx="4" fill="white" opacity="0.9" />
      <rect x="242" y="124" width="50" height="5" rx="2" fill="#90b8d0" />
      {/* Eye icon */}
      <circle cx="353" cy="127" r="4" fill="#70a0bf" opacity="0.7" />
      {/* Remember me */}
      <rect x="238" y="140" width="8" height="8" rx="2" fill="white" opacity="0.7" />
      <rect x="250" y="142" width="30" height="4" rx="2" fill="white" opacity="0.5" />
      {/* Login button */}
      <rect x="238" y="153" width="124" height="16" rx="5" fill="#1a3a5c" />
      <rect x="276" y="158" width="48" height="5" rx="2" fill="white" opacity="0.8" />

      {/* ── Keyboard ── */}
      <rect x="200" y="164" width="90" height="12" rx="4" fill="#3a7aaa" />
      <rect x="204" y="167" width="10" height="5" rx="1" fill="#2a5a80" />
      <rect x="217" y="167" width="10" height="5" rx="1" fill="#2a5a80" />
      <rect x="230" y="167" width="10" height="5" rx="1" fill="#2a5a80" />
      <rect x="243" y="167" width="10" height="5" rx="1" fill="#2a5a80" />
      <rect x="256" y="167" width="10" height="5" rx="1" fill="#2a5a80" />
      <rect x="269" y="167" width="18" height="5" rx="1" fill="#2a5a80" />

      {/* ── Clock on wall ── */}
      <circle cx="400" cy="38" r="24" fill="white" stroke="#a0c0d8" strokeWidth="2" />
      <circle cx="400" cy="38" r="3" fill="#5a8aaa" />
      <line x1="400" y1="38" x2="400" y2="20" stroke="#2a5a80" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="400" y1="38" x2="414" y2="44" stroke="#5a8aaa" strokeWidth="2" strokeLinecap="round" />
      {/* Clock ticks */}
      <line x1="400" y1="16" x2="400" y2="19" stroke="#a0b8cc" strokeWidth="1.5" />
      <line x1="400" y1="57" x2="400" y2="60" stroke="#a0b8cc" strokeWidth="1.5" />
      <line x1="378" y1="38" x2="381" y2="38" stroke="#a0b8cc" strokeWidth="1.5" />
      <line x1="419" y1="38" x2="422" y2="38" stroke="#a0b8cc" strokeWidth="1.5" />

      {/* ── Bookshelf ── */}
      <rect x="390" y="100" width="76" height="80" rx="4" fill="#d0e8f8" stroke="#a0c0d8" strokeWidth="1.5" />
      <rect x="390" y="172" width="76" height="6" rx="2" fill="#a0c0d8" />
      {/* Books */}
      <rect x="395" y="108" width="12" height="60" rx="2" fill="#2a7abf" />
      <rect x="409" y="112" width="10" height="56" rx="2" fill="#e8a020" />
      <rect x="421" y="108" width="14" height="60" rx="2" fill="#4a9a6a" />
      <rect x="437" y="114" width="10" height="54" rx="2" fill="#8a4abf" />
      <rect x="449" y="110" width="13" height="58" rx="2" fill="#d04040" />

      {/* ── Trash bin ── */}
      <rect x="338" y="188" width="32" height="28" rx="4" fill="#3a8abf" opacity="0.7" />
      <rect x="334" y="185" width="40" height="6" rx="3" fill="#2a6a9a" opacity="0.8" />
      {/* Bin pattern */}
      <line x1="344" y1="192" x2="344" y2="212" stroke="#2a6a9a" strokeWidth="1.5" opacity="0.6" />
      <line x1="352" y1="192" x2="352" y2="212" stroke="#2a6a9a" strokeWidth="1.5" opacity="0.6" />
      <line x1="360" y1="192" x2="360" y2="212" stroke="#2a6a9a" strokeWidth="1.5" opacity="0.6" />

      {/* ── Cactus (two plants) ── */}
      {/* Pot 1 */}
      <rect x="405" y="193" width="28" height="18" rx="4" fill="#333" />
      <rect x="402" y="190" width="34" height="6" rx="3" fill="#444" />
      {/* Cactus 1 main stem */}
      <rect x="416" y="155" width="8" height="38" rx="4" fill="#2a9a5a" />
      {/* Arm left */}
      <rect x="404" y="164" width="14" height="7" rx="3.5" fill="#2a9a5a" />
      <rect x="403" y="157" width="7" height="14" rx="3.5" fill="#2a9a5a" />
      {/* Arm right */}
      <rect x="422" y="168" width="14" height="7" rx="3.5" fill="#2a9a5a" />
      <rect x="429" y="160" width="7" height="15" rx="3.5" fill="#2a9a5a" />
      {/* Cactus flowers */}
      <circle cx="420" cy="155" r="6" fill="#e8a020" />
      <circle cx="406" cy="157" r="5" fill="#e8a020" />
      <circle cx="436" cy="160" r="5" fill="#3a8abf" />

      {/* Pot 2 (smaller) */}
      <rect x="448" y="200" width="22" height="14" rx="3" fill="#222" />
      <rect x="445" y="197" width="28" height="5" rx="2.5" fill="#333" />
      {/* Cactus 2 */}
      <rect x="456" y="170" width="7" height="30" rx="3.5" fill="#2a9a5a" />
      <circle cx="459" cy="170" r="5" fill="#3a8abf" />
      <circle cx="459" cy="162" r="3" fill="#e8a020" />
    </svg>
  );
}
