import { motion } from 'framer-motion';

interface InfoPanelProps {
  waitTime: number;
  emotion: string;
  isPlaying: boolean;
  bgColor: string;
  textColor: string;
}

export default function InfoPanel({ waitTime, emotion, isPlaying, bgColor, textColor }: InfoPanelProps) {
  return (
    <div
      className='flex flex-col items-center justify-center text-center p-4'
      style={{
        background: bgColor,
        color: textColor,
        transition: 'background-color 1.5s ease, color 1.5s ease'
      }}
    >
      <motion.h4 style={{ color: textColor }}>
        Tiempo de cambio: {waitTime / 1000}s
      </motion.h4>
      <motion.h4 style={{ color: textColor }}>
        Emoción: {emotion}
      </motion.h4>
    </div>
  );
}