
import { useState, type ChangeEvent, type DragEvent, useRef } from 'react';
import TextArea from './TextArea';

interface WelcomeScreenProps {
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function WelcomeScreen({ onFileSelect }: WelcomeScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }; 

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const mockEvent = {
        target: { files },
      } as unknown as ChangeEvent<HTMLInputElement>;
      onFileSelect(mockEvent);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };
  


  const zoneClasses = `
    flex flex-col items-center justify-center
    p-8 lg:p-12 border-2 border-dashed rounded-lg
    cursor-pointer transition-all duration-300 ease-in-out
    ${isDragging ? 'border-violet-500 bg-violet-50/50 scale-105' : 'border-gray-400 hover:border-gray-600'}
  `;

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div
        className={zoneClasses}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleZoneClick}
      >
        <h2 className='text-2xl font-indie mb-4 text-center'>
          Arrastra tu poema aquí
        </h2>
        <p className='mb-4 text-sm text-center'>
          o haz clic para seleccionarlo.
        </p>
        <p className='text-xs text-gray-500 text-center'>
          (Archivo .txt, versos separados por comas)
        </p>
        <input
          type="file"
          accept=".txt"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}