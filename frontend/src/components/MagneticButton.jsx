import { motion } from "framer-motion";

export default function MagneticButton({ children, to, type = "button", className = "", onClick }) {
  const props = {
    className: `magnetic-button ${className}`,
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.96 },
    onClick,
  };

  if (to) {
    return (
      <motion.a href={to} {...props}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} {...props}>
      {children}
    </motion.button>
  );
}
