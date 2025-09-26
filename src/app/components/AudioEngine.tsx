import * as Tone from 'tone';
import { useState, useRef, useEffect } from 'react';
import { type Sound } from '@/store/aiStore'; 

interface AudioEngineInterface {
    sound: Sound;
}

export default function AudioEngine({ sound }: AudioEngineInterface) {
    const [isAudioReady, setIsAudioReady] = useState(false);
    
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const delayRef = useRef<Tone.FeedbackDelay | null>(null);

    async function initializeAudio() {
        await Tone.start();
        console.log("Audio Context is ready.");

        if (!reverbRef.current) {
            reverbRef.current = new Tone.Reverb({
                decay: 1.5,
                wet: 0.15,   
            }).toDestination();
        }

        if (!delayRef.current) {
            delayRef.current = new Tone.FeedbackDelay("8n", 0.25).connect(reverbRef.current);
        }

        if (!synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" }, 
                envelope: {
                    attack: 0.05,
                    decay: 0.2,
                    sustain: 0.4,
                    release: 0.8
                }
            }).connect(delayRef.current);
        }
        
        setIsAudioReady(true);
    }

    useEffect(() => {
        if (!isAudioReady || !sound.motif || sound.motif.length === 0 || !synthRef.current) {
            return;
        }

        console.log("Updating sound for new verse:", sound);

        const synth = synthRef.current;
        const transport = Tone.getTransport();

        synth.set({ harmonicity: Math.max(1.0, Math.min(sound.timbre.harmonicity, 2.0)) });

        transport.cancel(0).stop();
        
        const part = new Tone.Part((time, chord) => {
            synth.triggerAttackRelease(chord.notes, chord.duration, time);
        }, sound.motif).start(0);

        part.loop = false;

        transport.start("+0.05");

        return () => {
            console.log("Cleaning up previous part...");
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
                        Activar Música Alegre 🎶
                    </button>
                </div>
            )}
        </div>
    );
}
