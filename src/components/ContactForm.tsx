import { useEffect, useRef, useState } from "react";
import "./styles/ContactForm.css";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface FormFields {
  name: string;
  email: string;
  interest: string;
  message: string;
  botcheck: string; // honeypot
}

interface FormErrors {
  name?: string;
  email?: string;
  interest?: string;
  message?: string;
}

type SubmitStatus = "idle" | "sending" | "success" | "error";

const EMPTY: FormFields = {
  name: "",
  email: "",
  interest: "",
  message: "",
  botcheck: "",
};

const INTERESTS = [
  "Web Development",
  "Frontend Development",
  "Full Stack Project",
  "Freelance Work",
  "Job Opportunity",
  "Collaboration",
  { label: "Write your own message", value: "Write your own message" },
];

/* ── Validation ────────────────────────────────────────────────────────── */
function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!fields.interest) {
    errors.interest = "Please select an option.";
  }

  if (!fields.message.trim()) {
    errors.message = "Message is required.";
  } else if (fields.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

/* ── Component ─────────────────────────────────────────────────────────── */
const ContactForm = () => {
  const [fields, setFields] = useState<FormFields>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, boolean>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [visible, setVisible] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  /* Entrance animation — fires once when the section scrolls into view */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Re-validate only touched fields as the user types */
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;
    const next = validate(fields);
    const filtered: FormErrors = {};
    (Object.keys(touched) as (keyof FormErrors)[]).forEach((k) => {
      if (next[k]) filtered[k] = next[k];
    });
    setErrors(filtered);
  }, [fields, touched]);

  /* ── Handlers ──────────────────────────────────────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleRetry = () => {
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* Mark all fields as touched to show all errors */
    setTouched({ name: true, email: true, interest: true, message: true });

    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    /* Honeypot filled — silently bail (bot detected) */
    if (fields.botcheck) return;

    setStatus("sending");

    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY as string;

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `New portfolio message from ${fields.name.trim()}`,
          name: fields.name.trim(),
          email: fields.email.trim(),
          interest: fields.interest,
          message: fields.message.trim(),
          botcheck: fields.botcheck,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setFields(EMPTY);
        setTouched({});
        setErrors({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  /* ── Helpers ───────────────────────────────────────────────────────── */
  const isSending = status === "sending";

  const fieldClass = (key: keyof FormErrors) =>
    `cf-field${errors[key] && touched[key] ? " cf-has-error" : ""}`;

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Subtle separator between Contact section and this form */}
      <div className="cf-divider" aria-hidden="true" />

      <section
        ref={sectionRef}
        id="contact-form"
        className={`cf-section section-container${visible ? " cf-visible" : ""}`}
        aria-labelledby="cf-heading"
      >
        {/* Heading */}
        <div className="cf-heading">
          <h2 id="cf-heading">
            Let's work <span>together</span>
          </h2>
          <p>Have a project in mind? Fill out the form and I'll get back to you.</p>
        </div>

        {/* Status messages — aria-live so screen readers announce changes */}
        <div aria-live="polite" aria-atomic="true">
          {status === "success" && (
            <p className="cf-status cf-status--success" role="status">
              Thanks! Your message has been sent. I'll be in touch soon.
            </p>
          )}
          {status === "error" && (
            <p className="cf-status cf-status--error" role="alert">
              Something went wrong. Please try again.
              <button type="button" className="cf-retry" onClick={handleRetry}>
                Retry
              </button>
            </p>
          )}
        </div>

        {/* Form — hidden after success to prevent re-submit confusion */}
        {status !== "success" && (
          <form
            className="cf-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Contact form"
          >
            {/* Honeypot — hidden from real users */}
            <div className="cf-honeypot" aria-hidden="true">
              <label htmlFor="botcheck">Leave this field empty</label>
              <input
                id="botcheck"
                name="botcheck"
                type="text"
                value={fields.botcheck}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Row 1 — Name + Email (two columns on desktop) */}
            <div className="cf-row-2">
              {/* Name */}
              <div className={fieldClass("name")}>
                <label htmlFor="cf-name">Name</label>
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={fields.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSending}
                  aria-required="true"
                  aria-describedby={errors.name && touched.name ? "cf-name-err" : undefined}
                />
                {errors.name && touched.name && (
                  <span id="cf-name-err" className="cf-error" role="alert">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className={fieldClass("email")}>
                <label htmlFor="cf-email">Email</label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your.email@company.com"
                  value={fields.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSending}
                  aria-required="true"
                  aria-describedby={errors.email && touched.email ? "cf-email-err" : undefined}
                />
                {errors.email && touched.email && (
                  <span id="cf-email-err" className="cf-error" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2 — Interest dropdown (full width) */}
            <div className={fieldClass("interest")}>
              <label htmlFor="cf-interest">What are you interested in?</label>
              <select
                id="cf-interest"
                name="interest"
                value={fields.interest}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSending}
                aria-required="true"
                aria-describedby={
                  errors.interest && touched.interest
                    ? "cf-interest-err"
                    : fields.interest === "Write your own message"
                    ? "cf-interest-hint"
                    : undefined
                }
              >
                <option value="" disabled>
                  Select a topic…
                </option>
                {INTERESTS.map((opt) => {
                  const label = typeof opt === "string" ? opt : opt.label;
                  const value = typeof opt === "string" ? opt : opt.value;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {/* Hint — only visible when "Write your own message" is selected */}
              {fields.interest === "Write your own message" && (
                <span id="cf-interest-hint" className="cf-interest-hint">
                  Tell me what you need in the message box below.
                </span>
              )}
              {errors.interest && touched.interest && (
                <span id="cf-interest-err" className="cf-error" role="alert">
                  {errors.interest}
                </span>
              )}
            </div>

            {/* Row 3 — Message textarea (full width) */}
            <div className={fieldClass("message")}>
              <label htmlFor="cf-message">Message</label>
              <textarea
                id="cf-message"
                name="message"
                placeholder={
                  fields.interest === "Write your own message"
                    ? "Write your own message here…"
                    : "Briefly describe your project, timeline and any details I should know…"
                }
                value={fields.message}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSending}
                aria-required="true"
                aria-describedby={errors.message && touched.message ? "cf-message-err" : undefined}
              />
              {errors.message && touched.message && (
                <span id="cf-message-err" className="cf-error" role="alert">
                  {errors.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="cf-submit"
              disabled={isSending}
              aria-busy={isSending}
            >
              {isSending ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </section>
    </>
  );
};

export default ContactForm;
