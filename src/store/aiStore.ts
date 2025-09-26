import { create } from 'zustand';


export interface MusicNote {
  time: string;
  notes: string[]; // ¡Cambiado de 'note' a 'notes' y ahora es un array!
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

export interface Sound {
  timbre: {
    harmonicity: number;
  };
  motif: MusicNote[];
  effects: {
    reverb: number;
    delay: number;
  };
}

export interface AiAnalysis {
  emotion: string;
  visuals: Visuals;
  sound: Sound;
}

interface AiState {
  analysis: AiAnalysis;
  isLoading: boolean;
  error: string | null;
  fetchAnalysis: (verse: string, previousVerse: string | null) => Promise<void>;
}


const useAiStore = create<AiState>((set, get) => ({
    analysis: { 
      emotion: 'neutral',
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
        timbre: { harmonicity: 1.5 },
        motif: [],
        effects: { reverb: 0.1, delay: 0 },
      },
    },
    isLoading: false,
    error: null,

  fetchAnalysis: async (verse, previousVerse) => {
    set({ isLoading: true, error: null });

    const previousAnalysis = get().analysis;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse: verse,
          previousVerse: previousVerse,
          previousAnalysis: previousAnalysis,
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
}));

export default useAiStore;