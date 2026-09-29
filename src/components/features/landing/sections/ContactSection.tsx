"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Mail, Phone, MapPin, Clock } from "lucide-react";

// ── EmailJS credentials ───────────────────────────────────────────────────
const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? "service_yjw5yci";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "template_i3rf68j";
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? "QIbyG3apI61UgRMcq";

type FormState = "idle" | "sending" | "success" | "error";
type ContactForm = { name: string; email: string; subject: string; message: string };

// ── Contact info ──────────────────────────────────────────────────────────
const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "shamimhassanpust@gmail.com",
    href: "https://mail.google.com/mail/u/0/?to=shamimhassanpust@gmail.com&fs=1&tf=cm",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    icon: Phone,
    label: "Phone / WhatsApp",
    value: "+880 1774 500 810",
    href: "https://wa.me/8801774500810",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Dhaka, Bangladesh",
    href: "https://maps.google.com/?q=Mirpur-10,Dhaka",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 hours",
    href: null,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
];

// ── Reusable input class ──────────────────────────────────────────────────
const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-700";

// ── Component ─────────────────────────────────────────────────────────────
export default function ContactSection() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm]   = useState<ContactForm>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  function validate(): boolean {
    const e: Partial<ContactForm> = {};
    if (!form.name.trim())    e.name    = "Name is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (form.message.trim().length < 10)
      e.message = "Message must be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof ContactForm])
      setErrors((p) => ({ ...p, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setFormState("sending");
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          service_id:  SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id:     PUBLIC_KEY,
          template_params: {
            from_name:  form.name,
            from_email: form.email,
            subject:    form.subject,
            message:    form.message,
          },
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setFormState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setFormState("idle"), 6000);
    } catch {
      setFormState("error");
      setTimeout(() => setFormState("idle"), 6000);
    }
  }

  return (
    <section id="contact" className="bg-white py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Contact Us
          </h2>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Have a question or want to learn more? Send us a message and we&apos;ll
            get back to you within 24 hours.
          </p>
        </div>

        {/* ── Content grid ───────────────────────────────────────────── */}
        <div className="mt-16 grid gap-8 lg:grid-cols-5 lg:items-stretch">

          {/* Left — contact info cards */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href, color, bg }) => {
              const inner = (
                <div className="flex items-center gap-4">
                  <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {value}
                    </p>
                  </div>
                </div>
              );

              const cardClass =
                "flex-1 rounded-xl border border-slate-100 bg-slate-50 p-5 transition-all dark:border-slate-800 dark:bg-slate-800/50 flex items-center";

              return href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cardClass} hover:-translate-y-0.5 hover:shadow-md`}
                >
                  {inner}
                </a>
              ) : (
                <div key={label} className={cardClass}>
                  {inner}
                </div>
              );
            })}
          </div>

          {/* Right — form */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-7 dark:border-slate-800 dark:bg-slate-800/50 lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Send a Message
            </h3>

            {/* Banners */}
            {formState === "success" && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Message sent successfully! We&apos;ll be in touch soon.
              </div>
            )}
            {formState === "error" && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Something went wrong. Please try again or email us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {/* Name + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name" name="name" type="text"
                    value={form.name} onChange={handleChange}
                    placeholder="Shamim Hassan"
                    disabled={formState === "sending"}
                    className={INPUT_CLASS}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email" name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@company.com"
                    disabled={formState === "sending"}
                    className={INPUT_CLASS}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject" name="subject" type="text"
                  value={form.subject} onChange={handleChange}
                  placeholder="How can we help you?"
                  disabled={formState === "sending"}
                  className={INPUT_CLASS}
                />
                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message" name="message" rows={6}
                  value={form.message} onChange={handleChange}
                  placeholder="Tell us about your inquiry…"
                  disabled={formState === "sending"}
                  className={`${INPUT_CLASS} resize-none`}
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
              </div>

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={formState === "sending" || formState === "success"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-8 py-3 text-sm font-bold text-slate-100 shadow-sm transition-all hover:bg-slate-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                >
                  {formState === "sending" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : formState === "success" ? (
                    <><CheckCircle2 className="h-4 w-4" /> Message Sent!</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Message</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
