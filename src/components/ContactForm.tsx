import { useState } from "react";
import { FiMail, FiCheck, FiAlertCircle } from "react-icons/fi";
import "./styles/ContactForm.css";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: "success" | "error" | null;
  message: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<FormStatus>({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear status when user starts typing
    if (status.type) {
      setStatus({ type: null, message: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setStatus({ type: "error", message: "Name is required." });
      return;
    }
    if (!formData.email.trim()) {
      setStatus({ type: "error", message: "Email is required." });
      return;
    }
    if (!validateEmail(formData.email)) {
      setStatus({ type: "error", message: "Please enter a valid email." });
      return;
    }
    if (!formData.subject.trim()) {
      setStatus({ type: "error", message: "Subject is required." });
      return;
    }
    if (!formData.message.trim()) {
      setStatus({ type: "error", message: "Message is required." });
      return;
    }

    setIsLoading(true);

    try {
      // ──────────────────────────────────────────────────────────────────
      // TODO: Replace with your email service integration
      // Option 1: EmailJS (https://www.emailjs.com/)
      // Option 2: Formspree (https://formspree.io/)
      // Option 3: Your own backend endpoint
      // ──────────────────────────────────────────────────────────────────

      // Example: Using EmailJS
      // const response = await emailjs.send(
      //   "YOUR_SERVICE_ID",
      //   "YOUR_TEMPLATE_ID",
      //   {
      //     from_name: formData.name,
      //     from_email: formData.email,
      //     subject: formData.subject,
      //     message: formData.message,
      //     to_email: "your-email@gmail.com",
      //   },
      //   "YOUR_PUBLIC_KEY"
      // );

      // Placeholder: Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus({
        type: "success",
        message: "Message sent successfully! I'll get back to you soon.",
      });

      // Clear form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 5000);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          "Failed to send message. Please try again or contact directly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="contact-form-section"
      id="contact-form"
      aria-labelledby="contact-form-heading"
    >
      <div className="contact-form-wrapper">
        {/* Left Column: Info */}
        <div className="contact-form-left">
          <div className="contact-form-header">
            <h2 id="contact-form-heading">
              Contact <span className="accent-text">Me</span>
            </h2>
          </div>

          <div className="contact-form-subtitle">
            <p>Let's work Together</p>
          </div>

          <p className="contact-form-description">
            I'm always interested in hearing about new projects and
            opportunities. Whether you have a question or just want to say hi,
            feel free to reach out!
          </p>

          {/* Email Section */}
          <div className="contact-info-item">
            <div className="contact-info-icon">
              <FiMail size={20} />
            </div>
            <a
              href="mailto:muhammad.ali992283@gmail.com"
              className="contact-info-link"
            >
              muhammad.ali992283@gmail.com
            </a>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="contact-form-right">
          <form onSubmit={handleSubmit} className="contact-form">
            {/* Name Field */}
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Enter Your Name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                aria-label="Your name"
              />
            </div>

            {/* Email Field */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                aria-label="Your email"
              />
            </div>

            {/* Subject Field */}
            <div className="form-group">
              <input
                type="text"
                name="subject"
                placeholder="Enter Your Subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-input"
                aria-label="Message subject"
              />
            </div>

            {/* Message Field */}
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Enter Your Message"
                value={formData.message}
                onChange={handleChange}
                className="form-textarea"
                rows={5}
                aria-label="Your message"
              />
            </div>

            {/* Status Message */}
            {status.type && (
              <div className={`status-message status-${status.type}`}>
                <div className="status-icon">
                  {status.type === "success" ? (
                    <FiCheck size={20} />
                  ) : (
                    <FiAlertCircle size={20} />
                  )}
                </div>
                <p>{status.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
              aria-label="Submit contact form"
            >
              {isLoading ? "Sending..." : "SUBMIT"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
