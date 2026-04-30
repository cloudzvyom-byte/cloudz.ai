import React, { useState } from "react";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(5, "Required").max(30),
  company: z.string().trim().max(120).optional(),
});

export function CTA() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        map[String(issue.path[0])] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  return (
    <section id="demo" className="relative overflow-hidden py-32">
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2
          className="text-balance text-white font-bold"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            textShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        >
          Give your ideas <br />
          space to <em className="italic font-serif opacity-80">breathe</em>.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white font-bold leading-relaxed"
           style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          Book a free consultation with our workflow experts, and get a
          personalized product walkthrough tailored to your needs.
        </p>

        <div className="mx-auto mt-16 max-w-2xl rounded-[2.5rem] border border-white/20 bg-white/10 p-8 text-left shadow-2xl backdrop-blur-3xl md:p-12">
          {submitted ? (
            <div className="py-12 text-center">
              <h3
                className="text-white font-bold"
                style={{ fontSize: "2.5rem", letterSpacing: "-0.02em" }}
              >
                Thanks — we'll be in touch.
              </h3>
              <p className="mt-4 text-white font-bold">
                Look out for an email shortly to schedule your walkthrough.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field name="firstName" label="First name*" error={errors.firstName} />
                <Field name="lastName" label="Last name*" error={errors.lastName} />
              </div>
              <Field name="email" label="Email address*" type="email" error={errors.email} />
              <Field name="phone" label="Phone number*" type="tel" error={errors.phone} />
              <Field name="company" label="Company" error={errors.company} />
              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-white/10 border border-white/30 px-8 py-4 text-xl font-black text-white shadow-xl backdrop-blur-2xl transition-all hover-pop"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
              >
                Book a demo
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  error,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <input
        name={name}
        type={type}
        placeholder={label}
        maxLength={255}
        className="w-full rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-base text-white font-bold placeholder:text-white/80 focus:border-white/60 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all shadow-inner"
      />
      {error && <p className="mt-2 text-xs font-bold text-pink-200">{error}</p>}
    </div>
  );
}
