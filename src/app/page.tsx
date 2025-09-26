"use client";

import './globals.css';
import { useState, useEffect, type ChangeEvent } from 'react';
import useAiStore from '@/store/aiStore';
import { sketch } from '@/app/components/sketch';
import { useCallback } from 'react';

// Importa tus nuevos componentes modulares
import Header from '@/app/components/Header';
import WelcomeScreen from '@/app/components/WelcomeScreen';
import InfoPanel from '@/app/components/InfoPanel';
import PoemDisplay from '@/app/components/PoemDisplay';
import P5Wrapper from '@/app/components/P5Wrapper';
import ControlsBar from './components/ControlsBar';
import EndScreen from './components/EndScreen';
import { AnimatePresence } from 'framer-motion';

function HomePage() {
  const [userPoem, setUserPoem] = useState<string[]>([]);
  const [poemTitle, setPoemTitle] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const { analysis, fetchAnalysis} = useAiStore();
  const { colorPalette, emotion } = analysis;
  const [isFinished, setIsFinished] = useState(false);

  const [words, setWords] = useState([]);

  const handleTogglePlay = () => {
    setIsPlaying(prevIsPlaying => !prevIsPlaying);
  };

  const handleNextVerse = useCallback(() => {
    setCurrentIndex(prevIndex => {
      if (prevIndex >= userPoem.length - 1) {
        console.log("FIN DEL POEMA DETECTADO. Setting isFinished=true");
        setIsPlaying(false);
        setIsFinished(true);
        setPoemTitle("");
        return prevIndex;
      }
      return prevIndex + 1;
    });
  }, [userPoem.length]); 

  const handlePreviousVerse = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    })
  }

  // Set colors
  var lightPink = colorPalette[3] || '#FF9CE5';

  const [waitTime, setWaitTime] = useState(3000)

  useEffect(() => {
    if (userPoem.length === 0 || !isPlaying) {
      return;
    }
    const timer = setInterval(() => {
      handleNextVerse(); 
    }, waitTime);

    return () => clearInterval(timer);
  }, [userPoem, isPlaying, waitTime]);

  function handleFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPoemTitle(null);
      const poemContent = reader.result;
      if (typeof poemContent === "string") {
        let parts = poemContent.split(",").filter(part => part.trim() !== '');
        parts = parts.map(part => part.trim());
        if (parts.length > 0 && parts[0].startsWith('#')) {
          const title = parts[0].slice(1).trim();
          setPoemTitle(title);
          const versesArray = parts.slice(1);
          setUserPoem(versesArray);
        } else {
          setUserPoem(parts);
        }
        setCurrentIndex(0);
        setIsFinished(false);
      }
    };
    reader.readAsText(file);
  }

  useEffect (() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === " ") {
        event.preventDefault()
        handleNextVerse();
      }

      if (event.key === "Enter") {
        event.preventDefault()
        setCurrentIndex(0);
      }

      if (event.key === "b") {
        event.preventDefault()
        setCurrentIndex(prev =>
          userPoem.length > 1 ? (prev - 1) % userPoem.length : prev
        )
      }

      if (event.key === "p") {
        event.preventDefault()
        setIsPlaying(prev => !prev);
      }

      if (event.key === "o") {
        event.preventDefault()
        setUserPoem([])
        setPoemTitle("");
      }

      if (event.key === "-") {
        event.preventDefault()
        setWaitTime(prev => Math.max(1000, prev - 500))
      }

      if (event.key === "+") {
        event.preventDefault()
        setWaitTime(prev => Math.min(8000, prev + 500))
      }

    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userPoem, handleNextVerse]);

  useEffect(() => {
    if (userPoem.length > 0) {
      const currentVerse = userPoem[currentIndex];
      const previousVerse = userPoem[currentIndex - 1]
      console.log("Analizando el verso : " + currentVerse)
      fetchAnalysis(currentVerse, previousVerse);
    }
  }, [currentIndex, userPoem, fetchAnalysis]);

  const handleVerseSelect = (index: number) => {
    setCurrentIndex(index);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsFinished(false);
  };

  const handleLoadNew = () => {
    setUserPoem([]);
    setPoemTitle(null);
    setCurrentIndex(0);
    setIsPlaying(true); 
    setIsFinished(false);
  };

  console.log(
    `--- RENDER ---`,
    `Index: ${currentIndex}`,
    `Poem Length: ${userPoem.length}`,
    `Is Playing: ${isPlaying}`,
    `Is Finished: ${isFinished}`
  );

  return (
    <div style={{
      backgroundColor: colorPalette[3],
      color: colorPalette[4],
      transition: 'background-color 1.5s ease, color 1.5s ease'
    }} 
    className='flex flex-col min-h-screen'
    >
      <Header
        title={poemTitle}
        bgColor={colorPalette[1]}
        textColor={colorPalette[4]}
      />

      {userPoem.length === 0 ? (
        <WelcomeScreen onFileSelect={handleFile} />
      ) : (
        <>
          <InfoPanel
            waitTime={waitTime}
            emotion={emotion}
            isPlaying={isPlaying}
            bgColor={colorPalette[2]}
            textColor={colorPalette[4]}
          />

          <main className='flex-grow flex flex-col md:flex-row items-center justify-center'>

          <div className='w-full md:w-1/2 h-full flex items-center justify-center'>
          <PoemDisplay
            poem={userPoem}
            currentIndex={currentIndex}
            hoverColor={colorPalette[2]}
          />
          </div>

          <div className='w-full md:w-1/2 h-full flex items-center justify-center p-4'>
            <P5Wrapper sketch={sketch} />
          </div>

          </main>

          <ControlsBar 
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onNext={handleNextVerse}
            onPrevious={handlePreviousVerse}
            isPreviousDisabled={currentIndex === 0}
            isNextDisabled={currentIndex === userPoem.length - 1}
            currentIndex={currentIndex}
            verseCount={userPoem.length}
            onVerseSelect={handleVerseSelect}
            waitTime={waitTime}
            onWaitTimeChange={setWaitTime}
            poem={userPoem}
          />

        </>
      )}
    <AnimatePresence>
        {isFinished && (
          <EndScreen
            onRestart={handleRestart}
            onLoadNew={handleLoadNew}
          />
        )}
    </AnimatePresence>

  </div>
  );
};

export default HomePage;
