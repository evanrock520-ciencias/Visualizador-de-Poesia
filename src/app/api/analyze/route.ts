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

      const prompt = `Tu tarea es ser un director de arte Y un compositor musical que crea una narrativa multisensorial para un poema.
      Debes devolver únicamente un objeto JSON válido, sin comillas triples al inicio o al final (\`\`\`) ni explicaciones.

      El verso actual es: "${verse}"
      ${previousVerse ? `El verso anterior fue: "${previousVerse}"` : 'Este es el primer verso.'}
      ${previousAnalysis ? `La paleta de colores generada para el verso anterior fue: [${previousAnalysis.colorPalette.join(', ')}]` : ''}

      Analiza el sentimiento, las imágenes y el ritmo del verso actual para generar:
      1. Una paleta de colores que sea una transición suave desde la anterior.
      2. Un "motivo musical" breve y simple que represente sónicamente el verso.

      REGLAS PARA LA MÚSICA (musicMotif):
      - Debe ser un array de 2 a 4 objetos de nota.
      - Usa notas simples. Para emociones positivas (alegría, calma), usa notas de la escala de Do Mayor (C, D, E, F, G, A, B) en la 4ª octava (ej: "C4").
      - Para emociones negativas o complejas (tristeza, tensión), puedes usar notas fuera de esa escala (sostenidos/bemoles como F#, Bb) o de octavas más bajas (ej: "A3").
      - El "time" debe estar en el formato "compás:cuarto:semicorchea". Las notas deben ocurrir secuencialmente (ej: "0:0:0", "0:1:0", "0:2:0"). El primer tiempo es siempre "0:0:0".
      - La "duration" debe ser notación musical estándar: "4n" (negra, larga), "8n" (corchea, media), "16n" (semicorchea, corta).
      - La composición debe ser simple y reflejar el verso. Un verso rápido y feliz podría tener corcheas ascendentes. Un verso triste, notas largas y graves.

      REGLAS PARA LOS COLORES (colorPalette):
      - ¡LA REGLA MÁS IMPORTANTE! "colorTextoVerso" y "colorFondoVerso" deben tener un alto contraste para garantizar la legibilidad. Si uno es oscuro, el otro DEBE ser claro.

      La estructura del JSON de salida debe ser esta EXACTAMENTE:
      {
        "emotion": "una sola palabra en español.",
        "visualElements": ["un", "array", "de 3 sustantivos en español."],
        "colorPalette": [
            "colorFondoVerso",
            "colorAcento1",
            "colorAcento2",
            "colorGeneralFondo",
            "colorTextoVerso"
        ],
        "musicMotif": [
          { "time": "0:0:0", "note": "C4", "duration": "8n" },
          { "time": "0:0:2", "note": "E4", "duration": "8n" },
          { "time": "0:1:0", "note": "G4", "duration": "4n" }
        ]
      }
    `;

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