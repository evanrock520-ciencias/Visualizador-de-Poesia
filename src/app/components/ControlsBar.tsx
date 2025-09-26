import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip'
import { useState } from 'react';
import SettingsPanel from './SettingsPanel';

interface ControlsBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  currentIndex: number;
  verseCount: number;
  onVerseSelect: (index: number) => void;
  waitTime: number;
  onWaitTimeChange: (newWaitTime: number) => void;
  poem: string[]
}

export default function ControlsBar({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  isPreviousDisabled,
  isNextDisabled,
  currentIndex,
  verseCount,
  onVerseSelect,
  waitTime,
  onWaitTimeChange,
  poem
}: ControlsBarProps) {
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const buttonAnimation = {
    whileHover: { scale: 1.2 },
    whileTap: { scale: 0.9 },
  };
  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className='fixed bottom-0 left-0 right-0 p-4 bg-gray-900/50 backdrop-blur-sm text-white'>
      
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel
            waitTime={waitTime}
            onWaitTimeChange={onWaitTimeChange}
          />
        )}
      </AnimatePresence>

      <div className='flex justify-center items-center gap-2 mb-2'>
        {Array.from({ length: verseCount }).map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onVerseSelect(index)}
            whileHover={{ scale: 1.5 }}
            className={`
              btn-reset rounded-md transition-all duration-300
              ${index === currentIndex
                ? 'w-6 h-2 !bg-white scale-110'
                : 'w-4 h-2 !bg-white/40 hover:!bg-white/70'
              }
            `}
            data-tooltip-id="timeline-tooltip"
            data-tooltip-content={poem[index]}
            aria-label={`Ir al verso ${index + 1}`}
          />
        ))}
      </div>

      <div className='flex justify-center items-center gap-6'>
        <motion.button {...buttonAnimation} onClick={onPrevious} disabled={isPreviousDisabled} className={disabledClasses} aria-label="Verso anterior">
          <FaStepBackward />
        </motion.button>

        <motion.button {...buttonAnimation} onClick={onPlayPause} aria-label={isPlaying ? "Pausar" : "Reproducir"}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </motion.button>

        <motion.button {...buttonAnimation} onClick={onNext} disabled={isNextDisabled} className={disabledClasses} aria-label="Siguiente verso">
          <FaStepForward />
        </motion.button>
      </div>
      
      <div className="absolute right-4 bottom-4">
        <motion.button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Abrir configuración"
        >
          <IoSettingsSharp size={24} />
        </motion.button>
      </div>
      <Tooltip id='timeline-tooltip'/>
    </div>
  );
}