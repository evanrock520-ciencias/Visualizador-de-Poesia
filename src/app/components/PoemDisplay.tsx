import { AnimatePresence, motion } from "framer-motion";

interface PoemDisplayProps {
  poem: string[];
  currentIndex: number;
  hoverColor: string;
}

export default function PoemDisplay({ poem, currentIndex, hoverColor }: PoemDisplayProps) {
  if (poem.length === 0 || !poem[currentIndex]) {
    return null;
  }

  const verseVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const wordContainerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.08, 
      },
    },
  };
  
  const wordVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className='flex items-center justify-center min-h-screen min-w-screen text-center'>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="text-center p-4 rounded font-indie"
          style={{ scale: 2.5 }}
          variants={wordContainerVariants} 
          initial="initial"
          animate="animate"
          exit="exit" 
          transition={{ duration: 0.7, ease: "easeInOut" }}
          whileHover={{ scale: 3}}
        >
          {poem[currentIndex].split(' ').map((word, index) => (
            <motion.span
              key={index}
              style={{ display: 'inline-block', paddingRight: '0.25em' }}
              variants={wordVariants}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}