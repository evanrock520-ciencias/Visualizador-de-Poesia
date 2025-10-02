import { create } from 'zustand';

export interface MusicNote {
  time: string;
  notes: string[];
  duration: string;
}

export interface ColorPalette {
  mainBg: string;
  accent1: string;
  accent2: string;
  accent3: string;
  verseText: string;
}

export interface Visuals {
  colorPalette: ColorPalette;
  animation: {
    style: 'fluid' | 'staccato' | 'gentle' | 'chaotic';
    speed: number;
  };
  typography: {
    family: 'serif' | 'sans-serif' | 'monospace';
    weight: number;
  };
}

export interface ParticleSystemParams {
  shape: 'circle' | 'line' | 'triangle' | 'quad';
  count: number;
  arrangement: 'random' | 'grid' | 'radial' | 'fall' | 'flowfield' | 'phyllotaxis';
  movement: 'static' | 'drift' | 'vibrate' | 'orbit' | 'chase_mouse' | 'flowfield';
  size: number;
}

export interface DominantObjectParams {
  shape: 'circle' | 'quad' | 'triangle';
  position: { x: number; y: number };
  size: number;
  texture: 'solid' | 'noisy' | 'gradient' | 'glow' | 'wireframe';
  animationStyle: 'pulse' | 'grow'; 
  pulsation?: { intensity: number; speed: number }; 
  driftIntensity?: number;
  deformationIntensity?: number; 
}

export interface PatternedLinesParams {
  pattern: 'waves' | 'grid' | 'rays' | 'ocean'
  direction: 'horizontal' | 'vertical' | 'radial'
  density: number
  distortion: number
  thickness: number
}

export interface FractalTreeParams {
  angle: number,
  size: number,
  detail: number,
  branchRatio: number,
  thickness: number,
}

export interface VoronoiParams {
  pointCount: number;
  pointMovement: 'static' | 'slowDrift' | 'jitter';
  fillStyle: 'wireframe' | 'solid' | 'transparent';
  colorLogic: 'random' | 'basedOnArea' | 'basedOnPosition';
  thickness: number,
  jitterIntensity: number
}

export interface Sound {
  // 1. Renombramos 'softPiano' a 'synthPiano'
  instrument: 'synthPiano' | 'dreamyPad' | 'glitchySynth' | 'ominousDrone' | 
              'crystalBells' | 'hauntingFlute' | 'distantChoir' | 'rhythmicPluck';
  
  motif: MusicNote[];

  // 2. Expandimos la sección de efectos para que sea un mezclador completo
  effects: {
    volume: number;          // Volumen del canal del instrumento (-24 a 0 dB)
    
    // Envíos de efectos (Sends)
    reverbSend: number;      // Cantidad de señal enviada a la Reverb (0.0 a 1.0)
    delaySend: number;       // Cantidad de señal enviada al PingPongDelay (0.0 a 1.0)
    distortionSend: number;  // Cantidad de señal enviada al BitCrusher (0.0 a 1.0)
    
    // Efectos globales
    filterCutoff?: number;   // Frecuencia del filtro maestro (500 a 20000 Hz)
    panningWet?: number;     // Intensidad del AutoPanner (0.0 a 1.0)
    
    // Modulación LFO (Low-Frequency Oscillator)
    lfo?: {
      frequency: number;   // Velocidad del LFO (0.1 a 4.0 Hz)
      min: number;         // Frecuencia mínima del filtro (400 a 1000 Hz)
      max: number;         // Frecuencia máxima del filtro (1500 a 8000 Hz)
      wet: number;         // Intensidad de la modulación (0.0 a 1.0)
    };
  };
}

export interface AiAnalysis {
  emotion: string;
  visuals: Visuals;
  sound: Sound;
  keyImagery: string[];
  sceneType: 'particleSystem' | 'dominantObject' | 'patternedLines';
  particleSystemParams?: ParticleSystemParams;
  dominantObjectParams?: DominantObjectParams;
  patternedLinesParams?: PatternedLinesParams;
  fractalTreeParams?: FractalTreeParams;
  voronoiParams?: VoronoiParams;
}

export interface GlobalAnalysis {
  mainTheme: string;
  emotionalArc: string;
  keySymbols: string[];
  suggestedPaletteStyle: 'somber' | 'vibrant' | 'pastel' | 'monochromatic'
}

interface AiState {
  analysis: AiAnalysis;
  isLoading: boolean;
  error: string | null;
  globalAnalysis: GlobalAnalysis | null;
  fetchAnalysis: (verse: string, previousVerse: string | null) => Promise<void>;
  fetchGlobalAnalysis: (fullPoem: string[]) => Promise<void>;
}

const useAiStore = create<AiState>((set, get) => ({
    globalAnalysis: null,
    analysis: { 
      emotion: 'neutral',
      keyImagery: [],
      sceneType: 'particleSystem',
      particleSystemParams: {
        shape: 'circle',
        count: 50,
        arrangement: 'random',
        movement: 'drift',
        size: 5,
      },
      visuals: {
        colorPalette: {
          mainBg: '#242424',
          accent1: '#4A4A4A',
          accent2: '#7F7F7F',
          accent3: '#B2B2B2',
          verseText: '#E5E5E5',
        },
        animation: { style: 'gentle', speed: 1 },
        typography: { family: 'sans-serif', weight: 400 },
      },
      sound: {
        instrument: 'synthPiano',
        motif: [],
        effects: { 
          volume: -6,
          reverbSend: 0.2,
          delaySend: 0,
          filterCutoff: 20000,
          panningWet: 0,
          lfo: {
            frequency: 0.5,
            min: 400,
            max: 2500,
            wet: 0
          },
          distortionSend: 0
        },
      },
    },
        isLoading: false,
    error: null,

    fetchAnalysis: async (verse, previousVerse) => {
      set({ isLoading: true, error: null });
      const previousAnalysis = get().analysis;
      const globalAnalysis = get().globalAnalysis; // <-- ¡CORRECCIÓN CLAVE 1: Obtener el estado!

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verse: verse,
            previousVerse: previousVerse,
            previousAnalysis: previousAnalysis,
            globalAnalysis: globalAnalysis, // <-- ¡CORRECIÓN CLAVE 2: Usar la variable y la coma!
          }),
        });

        if (!response.ok) {
          throw new Error('La respuesta de la API no fue exitosa');
        }

        const data: AiAnalysis = await response.json();
        set({ analysis: data, isLoading: false });

      } catch (error) {
        console.error("Error al llamar a la API de análisis:", error);
        set({ isLoading: false, error: 'No se pudo analizar el verso.' });
      }
    },

    fetchGlobalAnalysis: async (fullPoem) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/analyze-global', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ poem: fullPoem.join('\n') }),
        });

        if (!response.ok) {
          throw new Error('La respuesta de la API global no fue exitosa');
        }

        const data: GlobalAnalysis = await response.json();
        set({ globalAnalysis: data, isLoading: false });

      } catch (error) {
        console.error("Error al llamar a la API de análisis global:", error);
        set({ isLoading: false, error: 'No se pudo analizar el poema completo.' });
      }
    },
}));  

export default useAiStore;