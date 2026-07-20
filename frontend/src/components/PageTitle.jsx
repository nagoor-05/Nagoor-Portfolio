import { motion } from "framer-motion";

export default function PageTitle({ eyebrow, title, description }) {
  return (
    <motion.div
      className="page-title"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </motion.div>
  );
}
