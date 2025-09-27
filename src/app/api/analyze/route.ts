// src/app/api/analyze/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import createAnalysisPrompt from './prompt';

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
    const prompt = createAnalysisPrompt({ verse, previousVerse, previousAnalysis});
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