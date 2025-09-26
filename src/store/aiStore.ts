import { create } from 'zustand';

export interface MusicNote {
  time: string
  note: string
  duration: string
}

export interface AiAnalysis {
  emotion: string;
  visualElements: string[];
  colorPalette: string[];
  musicMotif: MusicNote;
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
    visualElements: [],
    colorPalette: ['#242424', '#4A4A4A', '#7F7F7F', '#B2B2B2', '#E5E5E5'],
    musicMotif: [] as MusicNote[],
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