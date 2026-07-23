import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  FaClock,
  FaEnvelope,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaLocationDot,
  FaPaperPlane,
  FaPhone,
  FaRocket,
  FaWandMagicSparkles,
  FaXTwitter,
} from "react-icons/fa6";
import GlassCard from "../components/GlassCard";
import PageTitle from "../components/PageTitle";
import { usePortfolio } from "../context/PortfolioContext";
import { trackEvent } from "../services/analyticsService";
import { saveContactMessage } from "../services/contactService";

const serviceId = "service_twzibxj";
const templateId = "template_8ap09ll";
const publicKey = "-X8jF-xSaAP7p3QKF";

const contactProfile = {
  name: "Mohammed Nagoor Meerasha",
  role: "AI / ML Intern",
  email: "nagoormeerasha739@gmail.com",
  phone: "+91 6383897279",
  location: "PSG Institute of Technology and Applied Research, Neelambur, Coimbatore, 641062",
};

const services = ["Full-Stack Web Applications", "Backend Development", "AI / ML Solutions", "Database Design"];

const socialButtons = [
  ["GitHub", "https://github.com/nagoor-05", FaGithub],
  ["LinkedIn", "https://www.linkedin.com/", FaLinkedin],
  ["Twitter", "https://x.com/", FaXTwitter],
  ["Instagram", "https://www.instagram.com/", FaInstagram],
  ["Facebook", "https://www.facebook.com/", FaFacebook],
];

export default function Contact() {
  const { data } = usePortfolio();
  const { contact } = data;
  const [localTime, setLocalTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    emailjs.init({ publicKey });
    const update = () =>
      setLocalTime(new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "Asia/Kolkata",
      }).format(new Date()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ type: "error", text: "Please fill every field before sending." });
      return;
    }
    setSending(true);
    setStatus({ type: "", text: "" });
    try {
      await emailjs.send(serviceId, templateId, { ...form, time: localTime }, publicKey);
      await saveContactMessage({ ...form, localTime });
      trackEvent("contact_click", { page: "contact", metadata: { subject: form.subject, channel: "emailjs" } });
      setStatus({ type: "success", text: "Message sent successfully." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus({ type: "error", text: "Message could not be sent. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="shell page-pad contact-page-v2">
      <PageTitle
        eyebrow="Contact Me"
        title={contact.title || "Let's Connect"}
        description={contact.description || "Have an opportunity, project, collaboration, or question? Feel free to send me a message."}
      />

      <div className="contact-v2-grid">
        <GlassCard className="contact-profile-panel-v2">
          <div className="contact-profile-head">
            <span className="contact-n-logo-v2">N</span>
            <div>
              <h2>{contactProfile.name}</h2>
              <strong>{contactProfile.role}</strong>
              <p>
                Building intelligent systems and modern web applications with clean code,
                useful AI features, and polished user experience.
              </p>
            </div>
          </div>
          <div className="contact-info-stack">
            <InfoTile icon={<FaEnvelope />} label="Email" value={contactProfile.email} />
            <InfoTile icon={<FaPhone />} label="Phone" value={contactProfile.phone} />
            <InfoTile icon={<FaLocationDot />} label="Location" value={contactProfile.location} />
            <InfoTile icon={<FaClock />} label="Response Time" value="Within 24 hours" />
            <InfoTile icon={<FaPaperPlane />} label="Availability" value="Open to opportunities" />
            <div className="contact-services-v2">
              <span><FaWandMagicSparkles /></span>
              <div>
                <small>Services Available</small>
                <ul>{services.map((service) => <li key={service}>{service}</li>)}</ul>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="contact-form-panel-v2">
          <h2><FaPaperPlane /> Send Me a Message</h2>
          <p className="contact-suggestion">If you have any suggestion, send me an email in this message box.</p>
          <form className="contact-form-v2" onSubmit={submit}>
            <div className="form-pair">
              <input name="name" value={form.name} onChange={updateForm} placeholder="Your Name" aria-label="Your Name" />
              <input name="email" value={form.email} onChange={updateForm} placeholder="Your Email" aria-label="Your Email" type="email" />
            </div>
            <input name="subject" value={form.subject} onChange={updateForm} placeholder="Subject" aria-label="Subject" />
            <textarea
              name="message"
              value={form.message}
              onChange={updateForm}
              placeholder="Your Message or suggestion"
              aria-label="Your Message or suggestion"
              rows="9"
            />
            {status.text && <p className={`toast ${status.type}`}>{status.text}</p>}
            <button disabled={sending}>
              <FaPaperPlane /> {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </GlassCard>
      </div>

      <GlassCard className="contact-social-footer-v2">
        <div>
          <h2>{contactProfile.name}</h2>
          <strong>{contactProfile.role}</strong>
          <p>Building intelligent solutions for a smarter tomorrow.</p>
        </div>
        <div>
          <span>Connect with me</span>
          <nav aria-label="Social links">
            {socialButtons.map(([label, url, Icon]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                onClick={() => trackEvent("social_click", { page: "contact", metadata: { label, url } })}
              >
                <Icon />
              </a>
            ))}
          </nav>
        </div>
        <p className="contact-copyright">&copy; 2026 Mohammed Nagoor Meerasha. All rights reserved.</p>
      </GlassCard>
    </section>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="contact-info-tile-v2">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
