// src/app/components/AudioEngine.tsx

import * as Tone from 'tone';
import { useState, useRef, useEffect } from 'react';
import { type Sound } from '@/store/aiStore'; 

interface AudioEngineInterface {
    sound: Sound;
}

type Instruments = {
    [key: string]: Tone.PolySynth | null;
}

export default function AudioEngine({ sound }: AudioEngineInterface) {
    const [isAudioReady, setIsAudioReady] = useState(false);
    
    const instrumentsRef = useRef<Instruments | null>(null);
    const gainNodeRef = useRef<Tone.Gain | null>(null); 

    async function initializeAudio() {
        await Tone.start();
        console.log("Audio Context is ready.");

        if (!instrumentsRef.current) {
            gainNodeRef.current = new Tone.Gain(0.7).toDestination();
            const gainNode = gainNodeRef.current;
            

            const reverb = new Tone.Reverb(4).connect(gainNode);

            instrumentsRef.current = {
                'softPiano': new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: "sine" },
                    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1 }
                }).connect(reverb),

                'dreamyPad': new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: "triangle" },
                    envelope: { attack: 0.5, decay: 0.1, sustain: 0.8, release: 2 }
                }).connect(reverb),

                'glitchySynth': new Tone.PolySynth(Tone.FMSynth, {
                    harmonicity: 3.5,
                    modulationIndex: 10,
                    envelope: { attack: 0.01, decay: 0.2, release: 0.2 }
                }).connect(reverb),
                
                'ominousDrone': new Tone.PolySynth(Tone.AMSynth, {
                    harmonicity: 1.5,
                    envelope: { attack: 1, release: 2 }
                }).connect(reverb),
            };
        }
        setIsAudioReady(true);
    }

    useEffect(() => {
        if (!isAudioReady || !sound.motif || sound.motif.length === 0 || !instrumentsRef.current || !gainNodeRef.current) {
            return;
        }

        console.log(`Updating sound. Instrument: ${sound.instrument}`, sound);

        const currentInstrument = instrumentsRef.current[sound.instrument];
        if (!currentInstrument) {
            console.error(`Instrumento no encontrado: ${sound.instrument}`);
            return;
        }

        const gainNode = gainNodeRef.current;
        const transport = Tone.getTransport();
        
        gainNode.gain.rampTo(0.7, 0.1);

        transport.cancel(0).stop();
        
        const part = new Tone.Part((time, chord) => {
            currentInstrument.triggerAttackRelease(chord.notes, chord.duration, time);
            
        }, sound.motif).start(0);

        part.loop = false;
        transport.start("+0.1");

        return () => {
            console.log("Cleaning up previous part...");
            gainNode.gain.rampTo(0, 0.2); 
            part.dispose();
        };

    }, [sound, isAudioReady]); 

    return (
        <div>
            {!isAudioReady && (
                <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center z-50">
                    <button 
                        onClick={initializeAudio}
                        className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg shadow-lg hover:bg-yellow-600 transition-all animate-bounce"
                    >
                        Activar Música 🎶
                    </button>
                </div>
            )}
        </div>
    );
}