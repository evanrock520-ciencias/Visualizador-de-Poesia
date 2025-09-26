// src/app/api/analyze/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'La API Key de Gemini no está configurada.' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { verse, previousVerse, previousAnalysis } = await request.json();

    if (!verse) {
      return NextResponse.json({ error: 'El verso es requerido' }, { status: 400 });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `Tu tarea es actuar como un director de arte sinestésico y un compositor musical minimalista. Tu objetivo es traducir la esencia de un verso de un poema en un conjunto de instrucciones precisas y artísticas para una experiencia audiovisual generativa.

    Debes devolver **únicamente un objeto JSON válido**, sin explicaciones, comentarios, ni markdown como \`\`\`json. La estructura debe ser exactamente la que se define a continuación.

    **CONTEXTO:**
    - **Verso Actual:** "${verse}"
    - **Verso Anterior:** ${previousVerse ? `"${previousVerse}"` : '"Este es el primer verso."'}
    - **Análisis Anterior:** ${previousAnalysis ? `Se adjunta el JSON del análisis anterior para asegurar una transición suave.` : '"No hay análisis anterior."'}
    ${previousAnalysis ? JSON.stringify(previousAnalysis, null, 2) : ''}

    **INSTRUCCIONES DE ANÁLISIS Y GENERACIÓN:**

    **1. Núcleo Emocional (\`emotion\`):**
      - Analiza la emoción principal del verso. Sé específico. En lugar de "feliz", considera "eufórico", "sereno", "jovial". En lugar de "triste", considera "melancólico", "desolado", "nostálgico".
      - Debe ser una **única palabra en español**.

    **2. Dirección Visual (\`visuals\`):**
      - **\`colorPalette\` (Paleta de Colores):**
        - Genera una paleta de 5 colores HEX que representen la emoción.
        - **REGLA DE ORO:** El primer color (\`mainBg\`) y el último (\`verseText\`) deben tener un **contraste extremadamente alto** (p. ej., casi negro y casi blanco) para garantizar la legibilidad del texto del poema.
        - **Transición Suave:** La paleta debe ser una evolución armónica de la paleta del análisis anterior (si existe), no un cambio brusco, a menos que la emoción del verso cambie radicalmente.
      - **\`animation\` (Parámetros de Animación):**
        - Define el carácter del movimiento visual en la escena.
        - \`style\`: Elige entre 'fluid' (suave, orgánico), 'staccato' (brusco, rítmico), 'gentle' (lento, calmado), 'chaotic' (rápido, impredecible).
        - \`speed\`: Un número del 0.2 (muy lento) al 2.0 (muy rápido).
      - **\`typography\` (Estilo de Texto):**
          - Define el estilo tipográfico para el verso.
          - \`family\`: Elige entre 'serif' (clásico, literario), 'sans-serif' (moderno, limpio), 'monospace' (técnico, frío).
          - \`weight\`: Un número entre 300 (ligero) y 800 (negrita).

    **3. Dirección Sonora (\`sound\`):**
      - **\`timbre\` (Carácter del Instrumento):**
        - Define las propiedades del sintetizador (un FMSynth).
        - \`harmonicity\`: Un número. Valores bajos (~1.0-2.0) para sonidos puros/consonantes (alegría, calma). Valores más altos (3.0-8.0) para sonidos complejos/disonantes (tensión, misterio).
      - **\`motif\` (Secuencia Musical):**
        - Genera una secuencia de 2 a 4 eventos musicales (acordes o notas únicas).
        - \`time\`: Formato "compás:cuarto:semicorchea". Deben ser secuenciales.
        - \`notes\`: **Un array de strings**. Para una nota única, \`["C4"]\`. Para un acorde, \`["C4", "E4", "G4"]\`.
        - \`duration\`: Notación musical estándar ("4n", "8n", "16n").
        - La composición debe ser minimalista y reflejar el ritmo y sentimiento del verso.
      - **\`effects\` (Ambiente Espacial):**
        - Define los parámetros de los efectos de audio.
        - \`reverb\`: Un número de 0.0 (totalmente seco) a 0.8 (una catedral inmensa).
        - \`delay\`: Un número de 0.0 (sin eco) a 0.7 (eco muy pronunciado).

    **ESTRUCTURA JSON DE SALIDA EXACTA:**
    {
      "emotion": "sereno",
      "visuals": {
        "colorPalette": {
          "mainBg": "#0a192f",
          "accent1": "#64ffda",
          "accent2": "#ccd6f6",
          "accent3": "#8892b0",
          "verseText": "#e6f1ff"
        },
        "animation": {
          "style": "gentle",
          "speed": 0.5
        },
        "typography": {
            "family": "serif",
            "weight": 400
        }
      },
      "sound": {
        "timbre": {
          "harmonicity": 1.5
        },
        "motif": [
          { "time": "0:0:0", "notes": ["C4", "G4"], "duration": "2n" },
          { "time": "0:2:0", "notes": ["E4", "B4"], "duration": "2n" }
        ],
        "effects": {
          "reverb": 0.6,
          "delay": 0.2
        }
      }
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();

    const startIndex = rawText.indexOf('{');
    const endIndex = rawText.lastIndexOf('}');
    const jsonText = rawText.substring(startIndex, endIndex + 1);

    try {
        const parsedJson = JSON.parse(jsonText);
        return NextResponse.json(parsedJson);
    } catch (e) {
        console.error("Error al parsear el JSON de la IA:", e);
        console.error("Texto recibido (después de limpiar):", jsonText); // Log para ver el texto ya limpio
        return NextResponse.json({ error: 'La respuesta de la IA no fue un JSON válido' }, { status: 500 });
    }

  } catch (error) {
    console.error("--- ERROR DURANTE LA LLAMADA A LA API DE GEMINI ---");
    console.error(error);
    return NextResponse.json({ error: 'Error al comunicarse con la IA de Gemini' }, { status: 500 });
  }
}