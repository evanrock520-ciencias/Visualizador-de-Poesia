import { motion } from 'framer-motion';

interface EndScreenProps {
  onRestart: () => void;
  onLoadNew: () => void;
}

export default function EndScreen({ onRestart, onLoadNew }: EndScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-indie text-white mb-6">Fin del Poema</h2>
        <div className="flex gap-4">
          <button
            onClick={onRestart}
            className="btn-default px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Repetir
          </button>
          <button
            onClick={onLoadNew}
            className="btn-default px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cargar Nuevo
          </button>
        </div>
      </div>
    </motion.div>
  );
}