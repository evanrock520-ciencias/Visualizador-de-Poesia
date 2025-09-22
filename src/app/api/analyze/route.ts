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

    const prompt = `
      Tu tarea es ser un director de arte digital que crea una narrativa visual coherente para un poema.
      Debes devolver únicamente un objeto JSON válido, sin explicaciones.

      El verso actual es: "${verse}"
      ${previousVerse ? `El verso anterior fue: "${previousVerse}"` : 'Este es el primer verso.'}
      ${previousAnalysis ? `La paleta de colores generada para el verso anterior fue: [${previousAnalysis.colorPalette.join(', ')}]` : ''}

      Tu objetivo es analizar el verso actual y generar una nueva paleta de colores.
      IMPORTANTE: La nueva paleta debe ser una transición suave y lógica desde la paleta anterior.
      
      La estructura del JSON debe ser esta:
      {
        "emotion": "una sola palabra en español.",
        "visualElements": ["un", "array", "de 3 sustantivos."],
        "colorPalette": [
            "colorFondoVerso",   // Un color para el fondo del recuadro del texto.
            "colorAcento1",      // Un color de acento.
            "colorAcento2",      // Otro color de acento.
            "colorGeneralFondo", // Un color para el fondo general de la página (usualmente el más oscuro o claro).
            "colorTextoVerso"    // ¡LA REGLA MÁS IMPORTANTE! Un color para el texto del verso.
                                // Si "colorFondoVerso" es oscuro, "colorTextoVerso" DEBE SER CLARO.
                                // Si "colorFondoVerso" es claro, "colorTextoVerso" DEBE SER OSCURO.
                                // El contraste entre ambos debe ser alto para garantizar la legibilidad.
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