"use client";

import { createRoot } from 'react-dom/client'
import './globals.css'
import { useState, useEffect, type ChangeEvent, use } from 'react';
import { AnimatePresence, easeIn, easeInOut, motion } from "framer-motion"
import { sketch } from '@/app/components/sketch';
import P5Wrapper from '@/app/components/P5Wrapper';
import useAiStore from '@/store/aiStore';

function HomePage() {
  const [userPoem, setUserPoem] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const { analysis, isLoading, fetchAnalysis} = useAiStore();
  const { colorPalette, emotion } = analysis;

  // Set colors
  var lightPink = colorPalette[3] || '#FF9CE5';
  var lightRed = '#FF9CB3'
  var lightOrange = '#FFB69C'
  var lightGreen = '#9CFFB6'
  var lightBlue = '#9CE5FF'

  const [waitTime, setWaitTime] = useState(3000)

  useEffect(() => {
    
    if (userPoem.length === 0 || !isPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % userPoem.length);
    }, waitTime);

    return () => clearInterval(timer);
  }, [userPoem, isPlaying, waitTime]);

  function handleFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const poemContent = reader.result;
      if (typeof poemContent === "string") {
        const versesArray = poemContent.split(",");
        setUserPoem(versesArray);
        setCurrentIndex(0);
      }
    };
    reader.readAsText(file);
  }

  useEffect (() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === " ") {
        event.preventDefault()
        setCurrentIndex(prev => 
          userPoem.length > 0 ? (prev + 1) % userPoem.length : prev
        );
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
  }, [userPoem]);

  useEffect(() => {
    if (userPoem.length > 0) {
      const currentVerse = userPoem[currentIndex];
      const previousVerse = userPoem[currentIndex - 1]
      console.log("Analizando el verso : " + currentVerse)
      fetchAnalysis(currentVerse, previousVerse);
    }
  }, [currentIndex, userPoem, fetchAnalysis]);


  return (
    <div style={{ backgroundColor: colorPalette[0],
      color: colorPalette[3],
      transition: 'background-color 1.5s ease color 1.5s ease'
    }}>
      <AnimatePresence>
        <motion.h1
        initial = {{ opacity: 0.4}}
        animate = {{ opacity: 1}}
        transition = {{ duration: 2, ease: easeInOut}}
        className='text-center handlee-regular text-white rounded'
        style={{background: colorPalette[3]}}
        >
          Visualizador de Poesia
        </motion.h1>
      </AnimatePresence>
      { userPoem.length === 0 && (
      <div className='flex flex-col items-center '>
        <h2
        className='text-center font-indie'
        >
          Sube tu poema para comenzar.
        </h2> 
        <input type="file" accept=".txt" onChange={handleFile} />
      </div> )}

      <div className='flex flex-col text-center justify-center'
      style={{background: lightPink}}>
        { !isPlaying && (
        <motion.h4>
          En pausa
        </motion.h4> )}
        { userPoem.length > 0 && (
        <motion.h4 className="text-white">
          Tiempo de cambio : {waitTime}
        </motion.h4> )}
        <motion.h4
        className="text-white">
          Emoción: {emotion}
        </motion.h4>
      </div>

      <div className='flex flex-col items-center justify-center min-h-screen min-w-screen text-center'>
        {currentIndex > 1 && userPoem.length > currentIndex - 2 && (
          <AnimatePresence mode='wait'>
            <motion.p
              key={currentIndex - 2}
              initial={{ y: 0, opacity: 0.4 }}
              animate={{ y: -20, opacity: 0.4 }}
              exit={{ opacity: 0 }}
              layout
              transition={{ duration: 0.5, ease: easeInOut}}
              className="text-center p-4 rounded font-indie"
              style={{ scale: 2.0, backgroundColor: colorPalette[0], color: colorPalette[4]}}

            >
              {userPoem[currentIndex - 2]}
            </motion.p>
          </AnimatePresence>
        )}

        {currentIndex > 0 && userPoem.length > currentIndex - 1 && (
         <AnimatePresence mode='wait'>
          <motion.p
              key={currentIndex - 1}
              initial={{ y: 0, opacity: 0.4 }}
              animate={{ y: -20, opacity: 0.4 }}
              exit={{ opacity: 0 }}
              layout
              transition={{ duration: 0.5, ease: easeInOut }}
              className="text-center p-4 rounded font-indie"
              style={{ scale: 2.2, background: colorPalette[0], color: colorPalette[4]}}

              
            >
              {userPoem[currentIndex - 1]}
            </motion.p>
          </AnimatePresence>
        )}

        {userPoem.length > currentIndex && (
          <AnimatePresence mode='wait'>
          <motion.p
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            layout
            transition={{ duration: 0.5, ease: easeInOut }}
            className="text-center p-4 rounded font-indie"
            style={{ scale: 2.5, background: colorPalette[0], color: colorPalette[4]}}
            whileHover={{ scale: 3, background: colorPalette[2] }}
            
          >
            {userPoem[currentIndex]}
          </motion.p>
          </AnimatePresence>
        )}
      </div>

      <div className='flex justify-center my-4'>
        <P5Wrapper sketch={sketch}/>
      </div>

    </div>
  );
};

export default HomePage;
