interface PromptData {
    verse: string,
    previousVerse: string | null
    previousAnalysis: any | null
}

export default function createAnalysisPrompt({ verse, previousVerse, previousAnalysis }: PromptData) {
    const prompt = `
    Tu tarea es actuar como un director de arte sinestésico y un compositor musical minimalista. Tu objetivo es traducir la esencia de un verso de un poema en un conjunto de instrucciones precisas y artísticas para una experiencia audiovisual generativa.

    Debes devolver **ÚNICAMENTE un objeto JSON válido**, sin explicaciones, comentarios, ni markdown como \`\`\`json. La estructura debe ser EXACTAMENTE la que se define a continuación.

    **CONTEXTO:**
    - **Verso Actual:** "${verse}"
    - **Verso Anterior:** ${previousVerse ? `"${previousVerse}"` : '"Este es el primer verso."'}
    - **Análisis Anterior:** ${previousAnalysis ? `Se adjunta el JSON del análisis anterior para asegurar una transición suave y coherente.` : '"No hay análisis anterior."'}
    ${previousAnalysis ? JSON.stringify(previousAnalysis, null, 2) : ''}

    **INSTRUCCIONES DE ANÁLISIS Y GENERACIÓN:**

    **1. ANÁLISIS DE NÚCLEO (OBLIGATORIO):**
      - **\`emotion\`:** Analiza la emoción principal del verso. Sé específico (ej. "eufórico", "melancólico", "nostálgico"). Debe ser una **única palabra en español**.
      - **\`keyImagery\`:** Extrae las 1-3 imágenes o símbolos más importantes del verso. Debe ser un **array de strings en español**. (ej. ["luna", "cristal", "silencio"]).

    **2. DIRECCIÓN DE ESCENA (OBLIGATORIO):**
      - **\`sceneType\`:** Basado en \`keyImagery\` y \`emotion\`, elige el tipo de escena visual que mejor represente el verso.
      - **OPCIONES DISPONIBLES (ELIGE UNA):**
        - \`'particleSystem'\`: Para evocar elementos difusos como lluvia, polvo, multitudes, caos o sentimientos abstractos.
        - \`'dominantObject'\`: Para representar un símbolo central y potente como el sol, la luna, un ojo, una lágrima o el corazón.
        - \`'patternedLines'\`: Para visualizar conceptos fluidos o estructurados como el mar, el viento, el crecimiento de un cristal, carreteras o la lluvia torrencial.

    **3. PARÁMETROS DE ESCENA (CONDICIONAL):**
      - **REGLA FUNDAMENTAL:** Debes incluir **UNO Y SÓLO UN** objeto de parámetros que corresponda al \`sceneType\` que elegiste. Si elegiste \`'dominantObject'\`, SÓLO debes incluir el objeto \`dominantObjectParams\`.
      
      - **A. Si \`sceneType\` es \`'particleSystem'\`:**
        - Incluye el objeto \`particleSystemParams\` con las siguientes claves:
          - \`shape\`: 'circle', 'line', 'triangle', 'quad'.
          - \`count\`: Número de partículas (5 a 200).
          - \`arrangement\`: 'random', 'grid', 'radial', 'fall', 'flowfield', 'phyllotaxis'.
          - \`movement\`: 'static', 'drift', 'vibrate', 'orbit', 'chase_mouse'.
          - \`size\`: Tamaño base de las partículas (1 a 50).

      - **B. Si \`sceneType\` es \`'dominantObject'\`:**
        - Incluye el objeto \`dominantObjectParams\` con las siguientes claves:
          - \`shape\`: 'circle', 'quad', 'triangle'.
          - \`position\`: Objeto con \`x\` e \`y\` como porcentajes (0.0 a 1.0). Usa \`{ "x": 0.5, "y": 0.5 }\` para el centro.
          - \`size\`: Tamaño del objeto como un porcentaje del ancho del lienzo (0.1 a 0.8).
          - \`texture\`: 'solid', 'noisy', 'gradient'. Describe la superficie del objeto.
          - \`pulsation\`: Objeto con \`intensity\` (0.0 a 1.0) y \`speed\` (0.1 a 2.0). Describe un pulso rítmico de tamaño o brillo.

      - **C. Si \`sceneType\` es \`'patternedLines'\`:**
        - Incluye el objeto \`patternedLinesParams\` con las siguientes claves:
          - \`pattern\`: 'waves' (ondas sinusoidales), 'grid' (rejilla), 'rays' (rayos desde un punto), 'ocean' (ondas estilizadas y superpuestas para una sensación de profundidad)..
          - \`direction\`: 'horizontal', 'vertical', 'radial'.
          - \`density\`: Número de líneas (10 a 300).
          - \`distortion\`: Nivel de distorsión por ruido Perlin (0.0 a 1.0).
          - \`thickness\`: Grosor de las líneas (1 a 10).

    **4. ESTÉTICA GLOBAL (\`visuals\`):**
      - Estos parámetros se aplican a TODAS las escenas.
      - **\`colorPalette\`:** Paleta de 5 colores HEX. \`mainBg\` y \`verseText\` deben tener **contraste extremo**. La paleta debe evolucionar suavemente de la anterior.
      - **\`animation\`:** \`style\` ('fluid', 'staccato', 'gentle', 'chaotic') y \`speed\` (0.2 a 2.0).
      - **\`typography\`:** \`family\` ('serif', 'sans-serif') y \`weight\` (300 a 800).

    **5. DIRECCIÓN SONORA (\`sound\`):**
      - **\`instrument\`:** Elige el instrumento que mejor represente la emoción: 'softPiano', 'dreamyPad', 'glitchySynth', 'ominousDrone'.
      - **\`motif\`:** Secuencia musical de 2 a 4 eventos. \`time\`, \`notes\` (array), \`duration\`. Usa disonancia SÓLO para tensión.
      - **\`effects\`:** \`reverb\` (0.0 a 0.8, usa > 0.6 para inmensidad) y \`delay\` (0.0 a 0.7, mantén bajo para sutileza).

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