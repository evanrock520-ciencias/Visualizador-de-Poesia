import { motion } from "framer-motion";

interface SettingsPanelProps {
    waitTime: number
    onWaitTimeChange: (newWaitTime: number) => void
}

export default function SettingsPanel({ waitTime, onWaitTimeChange }: SettingsPanelProps) {

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    onWaitTimeChange(newValue);
  };

    return (
        <motion.div
        className='absolute bottom-full mb-4 p-4 bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg'
        initial={{ opacity: 0, y: 10}}
        animate={{ opacity: 1, y: 0}}
        exit={{ opacity: 0, y: 10}}
        >
            <label htmlFor="waitTimeSlider" className="block text-sm font-medium text-white mb-2">
                Velocidad de Transición: {(waitTime / 1000).toFixed(1)}s
            </label>
            <input id="waitTimeSlider"
            type="range"
            min="1000"
            max="8000"
            step="500"
            value={waitTime}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
        </motion.div>
    )
}