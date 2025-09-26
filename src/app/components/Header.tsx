import { AnimatePresence, easeInOut, motion } from "framer-motion";

interface HeaderProps {
  title: string | null;
  bgColor: string;
  textColor: string;
}

export default function Header({ title, bgColor, textColor }: HeaderProps) {
  return (
    <AnimatePresence>
      <motion.h1
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: easeInOut }}
        className='text-center handlee-regular rounded'
        style={{
          background: bgColor,
          color: textColor,
          transition: 'background-color 1.5s ease, color 1.5s ease'
        }}
      >
        {title ? title : "Visualizador de Poesía"}
      </motion.h1>
    </AnimatePresence>
  );
}