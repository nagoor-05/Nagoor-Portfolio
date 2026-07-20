import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  FaClock,
  FaCode,
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaLocationDot,
  FaPaperPlane,
  FaPhone,
  FaRegEnvelope,
  FaRocket,
  FaXTwitter,
  FaYoutube,
  FaWandMagicSparkles,
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
  email: "nagoormeerasha739",
  phone: "+91 6383897279",
  location: "PSG Institute of Technology and Applied Research, Neelambur, Coimbatore, 641062",
};

const socialButtons = [
  ["GitHub", "https://github.com/nagoor-05", FaGithub],
  ["LinkedIn", "https://www.linkedin.com/", FaLinkedin],
  ["Twitter", "https://x.com/", FaXTwitter],
  ["Instagram", "https://www.instagram.com/", FaInstagram],
  ["YouTube", "https://www.youtube.com/", FaYoutube],
];

export default function Contact() {
  const { data } = usePortfolio();
  const { contact, socialLinks } = data;
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

  const services = [
    "Full-Stack Web Applications",
    "Backend Development",
    "AI / ML Solutions",
    "Database Design",
  ];

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
    <section className="shell page-pad contact-page">
      <PageTitle
        eyebrow="Contact Me"
        title={contact.title}
        description={contact.description}
      />
      <GlassCard className="contact-main-card">
        <div className="contact-main-head">
          <span className="contact-n-logo">N</span>
          <div>
            <h3>{contactProfile.name}</h3>
            <strong>{contactProfile.role}</strong>
            <p>
              Building intelligent systems and modern web applications with clean code, useful AI features,
              and polished user experience.
            </p>
          </div>
        </div>
        <div className="contact-detail-grid">
          <InfoTile icon={<FaEnvelope />} label="Email" value={contactProfile.email} />
          <InfoTile icon={<FaPhone />} label="Phone" value={contactProfile.phone} />
          <InfoTile icon={<FaLocationDot />} label="Location" value={contactProfile.location} wide />
          <InfoTile icon={<FaClock />} label="Response Time" value="Within 24 hours" />
          <InfoTile icon={<FaRocket />} label="Availability" value="Open to opportunities" />
          <div className="contact-services-strip">
            <span><FaWandMagicSparkles /></span>
            <div>
              <small>Services Available</small>
              <div>{services.map((service) => <b key={service}>{service}</b>)}</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="contact-message-card contact-message-wide">
        <h3><FaPaperPlane /> Send Me a Message</h3>
        <form className="contact-form" onSubmit={submit}>
          <div className="form-pair">
            <input name="name" value={form.name} onChange={updateForm} placeholder="Name" />
            <input name="email" value={form.email} onChange={updateForm} placeholder="Email" type="email" />
          </div>
          <input name="subject" value={form.subject} onChange={updateForm} placeholder="Subject" />
          <textarea name="message" value={form.message} onChange={updateForm} placeholder="Message" rows="6" />
          {status.text && <p className={`toast ${status.type}`}>{status.text}</p>}
          <button disabled={sending}>
            <FaPaperPlane /> {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </GlassCard>

      <GlassCard className="contact-footer-card">
        <strong>{contactProfile.name}</strong>
        <div className="contact-social-buttons">
          {socialButtons.map(([label, url, Icon]) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("social_click", { page: "contact", metadata: { label, url } })}
            >
              <Icon /> {label}
            </a>
          ))}
        </div>
        <p>© 2026 Mohammed Nagoor Meerasha. All rights reserved.</p>
      </GlassCard>

      <div hidden aria-hidden="true">
        {socialLinks.map((item) => item.label).join(", ")}
        {contact.email}
      </div>
    </section>
  );
}

function InfoTile({ icon, label, value, wide = false }) {
  return (
    <div className={`contact-info-tile ${wide ? "wide" : ""}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
