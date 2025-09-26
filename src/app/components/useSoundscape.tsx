import { useEffect, useRef } from "react";
import * as Tone from 'tone'
import { type MusicNote } from "@/store/aiStore";

export const useSoundscape = (musicMotif: MusicNote[]) => {
    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        if (!synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
            const reverb = new Tone.Reverb(4).toDestination();
            synthRef.current.connect(reverb);

            Tone.TransportTimeClass.connect(reverb);
        }
        return () => {
            Tone.
        }
    })
}