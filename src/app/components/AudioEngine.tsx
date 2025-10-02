"use client";

import * as Tone from "tone";
import { useState, useRef, useEffect } from "react";
import { type Sound } from "@/store/aiStore";

interface AudioEngineInterface {
  sound: Sound;
}

// Estructura para guardar cada instrumento junto con su canal de mezcla dedicado
interface InstrumentChannel {
  instrument: Tone.PolySynth;
  channel: Tone.Channel;
}

type InstrumentsMap = {
  [key: string]: InstrumentChannel | null;
};

export default function AudioEngine({ sound }: AudioEngineInterface) {
  const [isAudioReady, setIsAudioReady] = useState(false);

  // --- Refs para cada componente de audio ---
  const instrumentsRef = useRef<InstrumentsMap | null>(null);
  const masterCompressorRef = useRef<Tone.Compressor | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);

  // Nodos de efectos globales (los "pedales de efectos")
  const reverbEffectRef = useRef<Tone.Reverb | null>(null);
  const delayEffectRef = useRef<Tone.PingPongDelay | null>(null);
  const distortionEffectRef = useRef<Tone.BitCrusher | null>(null);

  // Efectos que afectan a toda la mezcla
  const filterRef = useRef<Tone.Filter | null>(null);
  const lfoRef = useRef<Tone.LFO | null>(null);
  const pannerRef = useRef<Tone.AutoPanner | null>(null);

  async function initializeAudio() {
    await Tone.start();
    if (instrumentsRef.current) return;

    // --- 1. CANAL MAESTRO ---
    // La salida final de audio. Todo pasa por aquí.
    limiterRef.current = new Tone.Limiter(-1).toDestination();
    masterCompressorRef.current = new Tone.Compressor(-24, 3).connect(limiterRef.current);

    // --- 2. BUSES DE EFECTOS GLOBALES ---
    // Creamos los efectos, que esperarán a recibir señal.
    reverbEffectRef.current = new Tone.Reverb(5).connect(masterCompressorRef.current);
    delayEffectRef.current = new Tone.PingPongDelay("4n", 0.3).connect(masterCompressorRef.current);
    distortionEffectRef.current = new Tone.BitCrusher(4).connect(masterCompressorRef.current);
    
    // --- 3. CADENA DE EFECTOS MAESTRA ---
    // Efectos que afectan a la suma de todos los instrumentos.
    pannerRef.current = new Tone.AutoPanner("2n").connect(masterCompressorRef.current).start();
    filterRef.current = new Tone.Filter(20000, "lowpass").connect(pannerRef.current);
    lfoRef.current = new Tone.LFO("4m", 400, 2500).connect(filterRef.current.frequency).start();
    const mainOutput = filterRef.current;

    // --- 4. CREACIÓN DE INSTRUMENTOS Y CANALES DEDICADOS ---
    instrumentsRef.current = {};
    const instrumentDefinitions = {
      'synthPiano': new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }),
      'dreamyPad': new Tone.PolySynth(Tone.Synth, { oscillator: { type: "fatsawtooth", count: 3, spread: 20 }, envelope: { attack: 1.5, decay: 0.2, sustain: 0.8, release: 3 } }),
      'glitchySynth': new Tone.PolySynth(Tone.FMSynth, { harmonicity: 3.5, modulationIndex: 10, envelope: { attack: 0.01, decay: 0.2, release: 0.2 } }),
      'ominousDrone': new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, envelope: { attack: 2, release: 3 } }),
      'crystalBells': new Tone.PolySynth(Tone.FMSynth, { harmonicity: 5.1, modulationIndex: 10, envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 1.4 } }),
      'hauntingFlute': new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 0.4, decay: 0.1, sustain: 0.9, release: 1 } }),
      'distantChoir': new Tone.PolySynth(Tone.Synth, { oscillator: { type: "fatsawtooth", count: 3, spread: 20 }, envelope: { attack: 1.5, decay: 0.2, sustain: 0.8, release: 3 } }),
      'rhythmicPluck': new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.2, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.3 } }),
    };

    for (const [name, instrument] of Object.entries(instrumentDefinitions)) {
      // Para cada instrumento, creamos un canal de mezcla.
      const channel = new Tone.Channel().connect(mainOutput);
      instrument.connect(channel);

      // **ARQUITECTURA CORRECTA DE ENVÍOS (SENDS)**
      // 1. Creamos un envío con un NOMBRE ('reverb').
      // 2. Conectamos la salida de ESE envío a nuestro efecto de reverb global.
      channel.send('reverb', -Infinity).connect(reverbEffectRef.current);
      channel.send('delay', -Infinity).connect(delayEffectRef.current);
      channel.send('distortion', -Infinity).connect(distortionEffectRef.current);

      instrumentsRef.current[name] = { instrument, channel };
    }
    
    setIsAudioReady(true);
  }

    useEffect(() => {
        if (!isAudioReady || !sound.motif || !instrumentsRef.current) return;

        const { effects } = sound;
        const instrumentChannel = instrumentsRef.current[sound.instrument];
        if (!instrumentChannel) return;

        const { instrument, channel } = instrumentChannel;

        const rampTimeConstant = 0.1; 

        channel.volume.setTargetAtTime(effects.volume ?? -6, Tone.now(), rampTimeConstant);
        
        const reverbSend = channel.send('reverb');
        if (reverbSend instanceof Tone.Gain) {
        reverbSend.gain.setTargetAtTime(effects.reverbSend ?? 0, Tone.now(), rampTimeConstant);
        }
        
        const delaySend = channel.send('delay');
        if (delaySend instanceof Tone.Gain) {
        delaySend.gain.setTargetAtTime(effects.delaySend ?? 0, Tone.now(), rampTimeConstant);
        }

        const distortionSend = channel.send('distortion');
        if (distortionSend instanceof Tone.Gain) {
        distortionSend.gain.setTargetAtTime(effects.distortionSend ?? 0, Tone.now(), rampTimeConstant);
        }

        if (filterRef.current) {
        filterRef.current.frequency.setTargetAtTime(effects.filterCutoff ?? 20000, Tone.now(), rampTimeConstant);
        }
        
        if (pannerRef.current) {
        pannerRef.current.wet.setTargetAtTime(effects.panningWet ?? 0, Tone.now(), rampTimeConstant);
        }
        
        if (effects.lfo && lfoRef.current) {
        lfoRef.current.frequency.rampTo(effects.lfo.frequency, 0.5);
        lfoRef.current.min = effects.lfo.min;
        lfoRef.current.max = effects.lfo.max;
        lfoRef.current.amplitude.setTargetAtTime(effects.lfo.wet, Tone.now(), rampTimeConstant);
        }

        const transport = Tone.getTransport();
        transport.cancel(0).stop();
        const part = new Tone.Part((time, chord) => {
            instrument.triggerAttackRelease(chord.notes, chord.duration, time);
        }, sound.motif).start(0);
        part.loop = false;
        transport.start("+0.1");

        return () => { part.dispose(); };

    }, [sound, isAudioReady]);

  return (
    <div>
      {!isAudioReady && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center z-50">
          <button
            onClick={initializeAudio}
            className="px-6 py-3 text-white font-bold rounded-lg shadow-lg hover:bg-yellow-600 transition-all bg-yellow-500"
          >
            Activar Música
          </button>
        </div>
      )}
    </div>
  );
}
