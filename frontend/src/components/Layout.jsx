import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import ParticlesLayer from "./ParticlesLayer";
import CustomCursor from "./CustomCursor";

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="site-frame">
      <ParticlesLayer />
      <div className="aurora one" />
      <div className="aurora two" />
      <CustomCursor />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, filter: "blur(10px)", y: 18 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, filter: "blur(12px)", y: -18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
