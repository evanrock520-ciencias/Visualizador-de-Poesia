interface PromptData {
    verse: string,
    previousVerse: string | null
    previousAnalysis: any | null
    globalAnalysis: any | null;
}

export default function createAnalysisPrompt({ verse, previousVerse, previousAnalysis, globalAnalysis }: PromptData) {
    const prompt = `
    Tu tarea es actuar como un director de arte sinestésico y un compositor musical minimalista. Tu objetivo es traducir la esencia de un verso de un poema en un conjunto de instrucciones precisas y artísticas para una experiencia audiovisual generativa.

    Debes devolver **ÚNICAMENTE un objeto JSON válido**, sin explicaciones, comentarios, ni markdown como \`\`\`json. La estructura debe ser EXACTAMENTE la que se define a continuación.

    **CONTEXTO GLOBAL DEL POEMA (para mantener la cohesión):**
    ${globalAnalysis ? JSON.stringify(globalAnalysis, null, 2) : '"No hay un análisis global disponible."'}

    **CONTEXTO DEL VERSO ACTUAL:**
    - **Verso Actual:** "${verse}"
    - **Verso Anterior:** ${previousVerse ? `"${previousVerse}"` : '"Este es el primer verso."'}
    - **Análisis Anterior:** ... (sin cambios aquí)


    **INSTRUCCIONES DE ANÁLISIS Y GENERACIÓN:**

    **1. ANÁLISIS DE NÚCLEO (OBLIGATORIO):**
      - \`\`emotion\`\`: Analiza la emoción principal del verso. Sé específico (ej. "eufórico", "melancólico", "nostálgico"). Debe ser una **única palabra en español**.
      - \`\`keyImagery\`\`: Extrae las 1-3 imágenes o símbolos más importantes del verso. Debe ser un **array de strings en español**. (ej. ["luna", "cristal", "silencio"]).

    **2. DIRECCIÓN DE ESCENA (OBLIGATORIO):**
      - \`\`sceneType\`\`: Basado en \`\`keyImagery\`\` y \`\`emotion\`\`, elige el tipo de escena visual que mejor represente el verso.
      - **OPCIONES DISPONIBLES (ELIGE UNA):**
        - \`'particleSystem'\`: Para evocar elementos difusos como lluvia, polvo, multitudes, caos o sentimientos abstractos.
        - \`'dominantObject'\`: Para representar un símbolo central y potente como el sol, la luna, un ojo, una lágrima o el corazón.
        - \`'patternedLines'\`: Para visualizar conceptos fluidos o estructurados como el mar, el viento, el crecimiento de un cristal, carreteras o la lluvia torrencial.
        - \`'fractalTree'\`: Para representar conceptos de crecimiento, naturaleza, conexiones neuronales, raíces o estructuras ramificadas.
        - \`'voronoi'\`: Para representar fragmentación, estructura celular, mapas, conexiones, fronteras o cristales rotos.

    **3. PARÁMETROS DE ESCENA (CONDICIONAL):**
      - **REGLA FUNDAMENTAL:** Debes incluir **UNO Y SÓLO UN** objeto de parámetros que corresponda al \`\`sceneType\`\` que elegiste.
      
      - **A. Si \`\`sceneType\`\` es \`'particleSystem'\`:**
        - Incluye el objeto \`\`particleSystemParams\`\` con las siguientes claves:
          - \`\`shape\`\`: 'circle', 'line', 'triangle', 'quad'.
          - \`\`count\`\`: Número de partículas (5 a 200).
          - \`\`arrangement\`\`: 'random', 'grid', 'radial', 'fall', 'flowfield', 'phyllotaxis'.
          - \`\`movement\`\`: 'static', 'drift', 'vibrate', 'orbit', 'chase_mouse'.
          - \`\`size\`\`: Tamaño base de las partículas (1 a 50).

      - **B. Si \`\`sceneType\`\` es \`'dominantObject'\`:**
        - Incluye el objeto \`\`dominantObjectParams\`\` con las siguientes claves:
          - \`\`shape\`\`: 'circle', 'quad', 'triangle'.
          - \`\`position\`\`: Objeto con \`\`x\`\` e \`\`y\`\` como porcentajes (0.0 a 1.0).
          - \`\`size\`\`: Tamaño del objeto como un porcentaje del ancho del lienzo (0.1 a 0.8).
          - \`\`texture\`\`: Elige la apariencia de la superficie:
            - \`'solid'\`: Color plano y opaco.
            - \`'noisy'\`: Color con grano, como una foto antigua.
            - \`'gradient'\`: Un degradado suave entre dos colores de la paleta. Ideal para dualidad.
            - \`'glow'\`: El objeto emite un resplandor. Perfecto para estrellas, esperanza o energía.
            - \`'wireframe'\`: Solo el contorno, como un holograma o un boceto.
          - \`\`animationStyle\`\`: Elige el comportamiento principal del objeto:
            - \`'grow'\`: El objeto crece desde el centro una vez al aparecer. Ideal para un impacto inicial o revelación.
            - \`'pulse'\`: El objeto palpita rítmicamente de forma continua. Bueno para latidos, alientos o energía constante.
          
          - **Parámetros Opcionales (puedes añadir uno o ambos para más complejidad):**
            - \`\`pulsation\`\`: **Incluir SÓLO si \`\`animationStyle\`\` es \`'pulse'\`**. Objeto con \`\`intensity\`\` (0.0 a 1.0) y \`\`speed\`\` (0.1 a 2.0).
            - \`\`driftIntensity\`\`: Opcional. Intensidad del movimiento de deriva errante (un valor de 5 a 60). Úsalo para evocar sueños, soledad o algo flotando.
            - \`\`deformationIntensity\`\`: Opcional. **Funciona mejor con \`\`shape: 'circle'\`\`**. Nivel de deformación orgánica de los bordes (0.0 a 0.4). Úsalo para representar líquidos, células, inestabilidad o vida.

      - **C. Si \`\`sceneType\`\` es \`'patternedLines'\`:**
        - Incluye el objeto \`\`patternedLinesParams\`\` con las siguientes claves:
          - \`\`pattern\`\`: 'waves' (ondas sinusoidales), 'grid' (rejilla), 'rays' (rayos desde un punto), 'ocean' (ondas estilizadas y superpuestas).
          - \`\`direction\`\`: 'horizontal', 'vertical', 'radial'.
          - \`\`density\`\`: Número de líneas (10 a 300).
          - \`\`distortion\`\`: Nivel de distorsión por ruido Perlin (0.0 a 1.0).
          - \`\`thickness\`\`: Grosor de las líneas (1 a 10).

      - **D. Si \`\`sceneType\`\` es \`'fractalTree'\`:**
        - Incluye el objeto \`\`fractalTreeParams\`\` con las siguientes claves:
          - \`\`angle\`\`: El ángulo de separación de cada nueva rama en radianes (un valor entre 0.2 y 1.5).
          - \`\`branchRatio\`\`: La proporción de tamaño de una rama hija respecto a su padre (0.6 a 0.8).
          - \`\`size\`\`: El tamaño inicial del tronco principal, como un porcentaje de la altura del lienzo (0.2 a 0.4).
          - \`\`detail\`\`: Nivel de recursividad o detalle (entero de 4 a 9).
          - \`\`thickness\`\`: Grosor de las líneas del árbol (1 a 5).

      - **E. Si \`\`sceneType\`\` es \`'voronoi'\`:**
        - Incluye el objeto \`\`voronoiParams\`\` con las siguientes claves:
          - \`\`pointCount\`\`: El número de celdas a generar (entero entre 15 y 120).
          - \`\`pointMovement\`\`: El estilo de animación: 'static', 'slowDrift', 'jitter'.
          - \`\`fillStyle\`\`: El estilo visual de las celdas: 'wireframe', 'solid', 'transparent'.
          - \`\`thickness\`\`: Si el \`\`fillStyle\`\` es \`'wireframe'\`, define el grosor de las líneas (un número de 1 a 4).
          - \`\`jitterIntensity\`\`: Si el \`\`pointMovement\`\` es \`'jitter'\`, define la magnitud del temblor (un número entre 0.5 y 3.0).

    **4. ESTÉTICA GLOBAL (\`\`visuals\`\`):**
      - Estos parámetros se aplican a TODAS las escenas.
      - **\`\`colorPalette\`\`:** Paleta de 5 colores HEX. \`\`mainBg\`\` y \`\`verseText\`\` deben tener **contraste extremo**. La paleta debe evolucionar suavemente de la anterior y **respetar el \`\`suggestedPaletteStyle\`\` del contexto global**.
      - **\`\`animation\`\`:** \`\`style\`\` ('fluid', 'staccato', 'gentle', 'chaotic') y \`\`speed\`\` (0.2 a 2.0).
      - **\`\`typography\`\`:** \`\`family\`\` ('serif', 'sans-serif') y \`\`weight\`\` (300 a 800).

        **5. DIRECCIÓN SONORA (\`\`sound\`\`):**
      - \`\`instrument\`\`: Elige el instrumento principal.
        - \`'synthPiano'\`: Un piano sintetizado claro y versátil. Bueno para melodías, nostalgia o momentos definidos.
        - \`'dreamyPad'\`: Etéreo, vasto, soñador o sereno.
        - \`'glitchySynth'\`: Caótico, tecnológico, ansioso o roto.
        - \`'ominousDrone'\`: Tensión, misterio, miedo o solemnidad profunda.
        - \`'crystalBells'\`: Magia, fragilidad, recuerdos claros o soledad invernal.
        - \`'hauntingFlute'\`: Soledad, viento, un pensamiento persistente o naturaleza melancólica.
        - \`'distantChoir'\`: Reverencia, espiritualidad, inmensidad abrumadora o un recuerdo colectivo.
        - \`'rhythmicPluck'\`: Para marcar un ritmo, un latido del corazón, pasos o una tensión creciente.
      
      - \`\`motif\`\`: Secuencia musical de 2 a 4 eventos para el instrumento elegido.

      - \`\`effects\`\`: **Configura el mezclador para crear la atmósfera.**
        - \`\`volume\`\`: Volumen del canal del instrumento, en decibelios (un entero entre -24 y 0). Usa valores bajos (ej. -18) para sonidos de fondo y altos (ej. -3) para protagonistas.
        
        - **Envíos de Efectos (Mezcla en paralelo):**
          - \`\`reverbSend\`\`: Cantidad de señal enviada a la Reverb (0.0 a 1.0). Un valor alto (> 0.6) crea una sensación de espacio inmenso y etéreo.
          - \`\`delaySend\`\`: Cantidad de señal enviada al eco Ping Pong (0.0 a 1.0). Úsalo para crear repeticiones rítmicas o una sensación de fragmentación.
          - \`\`distortionSend\`\`: Cantidad de señal enviada a la distorsión BitCrusher (0.0 a 1.0). Úsalo con moderación para un sonido digital, "roto", agresivo o lo-fi.
        
        - **Efectos Globales (Afectan a todo):**
          - **(Opcional)** \`\`filterCutoff\`\`: Frecuencia del filtro maestro, en Hz (500 a 20000). Valores bajos (ej. 1000) hacen que TODO suene oscuro, apagado o lejano. No lo incluyas para un sonido claro.
          - **(Opcional)** \`\`panningWet\`\`: Intensidad del efecto de paneo automático (0.0 a 1.0). Un valor bajo (0.2) crea un movimiento estéreo sutil. Un valor alto (0.8) crea un barrido notable de izquierda a derecha.
        
        - **Modulación (Para dar "vida" al sonido):**
          - **(Opcional)** \`\`lfo\`\`: Un oscilador que modula el filtro para crear un movimiento de "respiración" o "barrido".
            - \`\`frequency\`\`: La velocidad del LFO (0.1 a 4.0 Hz). Lento para cambios graduales, rápido para un trémolo.
            - \`\`min\`\`: La frecuencia más baja a la que llega el filtro (400 a 1000 Hz).
            - \`\`max\`\`: La frecuencia más alta a la que llega el filtro (1500 a 8000 Hz).
            - \`\`wet\`\`: La intensidad general de la modulación (0.0 a 1.0).

    **ESTRUCTURA JSON DE SALIDA EXACTA (EJEMPLO PARA 'dominantObject'):**
    {
      "emotion": "solemne",
      "keyImagery": ["luna", "noche"],
      "sceneType": "dominantObject",
      "dominantObjectParams": {
        "shape": "circle",
        "position": { "x": 0.5, "y": 0.4 },
        "size": 0.3,
        "texture": "noisy",
        "pulsation": { "intensity": 0.1, "speed": 0.3 }
      },
      "visuals": {
        "colorPalette": {
          "mainBg": "#030617",
          "accent1": "#3b82f6",
          "accent2": "#93c5fd",
          "accent3": "#64748b",
          "verseText": "#f8fafc"
        },
        "animation": {
          "style": "gentle",
          "speed": 0.3
        },
        "typography": {
          "family": "serif",
          "weight": 300
        }
      },
      "sound": {
        "instrument": "dreamyPad",
        "motif": [
          { "time": "0:0:0", "notes": ["A3", "C4", "E4"], "duration": "1n" },
          { "time": "1:0:0", "notes": ["G3", "B3", "D4"], "duration": "1n" }
        ],
        "effects": {
          "reverb": 0.7,
          "delay": 0.2
        }
      }
    }
    `;

    return prompt;
}