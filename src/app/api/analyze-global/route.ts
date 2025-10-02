import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import createGlobalAnalysisPrompt from './prompt';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  if (!apiKey) {
    console.error('La API Key de Gemini no está configurada.');
    return NextResponse.json({ error: 'La API Key de Gemini no está configurada.' }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const { poem } = await request.json();

    if (!poem) {
      return NextResponse.json({ error: 'El poema es requerido' }, { status: 400 });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }); 
    const prompt = createGlobalAnalysisPrompt(poem);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();

    const startIndex = rawText.indexOf('{');
    const endIndex = rawText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
        console.error("No se encontró un objeto JSON en la respuesta de la IA.");
        console.error("Respuesta recibida:", rawText);
        return NextResponse.json({ error: 'La respuesta de la IA no contenía un JSON válido' }, { status: 500 });
    }
    
    const jsonText = rawText.substring(startIndex, endIndex + 1);

    try {
        const parsedJson = JSON.parse(jsonText);
        return NextResponse.json(parsedJson);
    } catch (e) {
        console.error("Error al parsear el JSON de la IA:", e);
        console.error("Texto recibido (después de limpiar):", jsonText);
        return NextResponse.json({ error: 'La respuesta de la IA no fue un JSON válido' }, { status: 500 });
    }

  } catch (error) {
    console.error("--- ERROR DURANTE LA LLAMADA A LA API DE GEMINI (GLOBAL) ---");
    console.error(error);
    return NextResponse.json({ error: 'Error al comunicarse con la IA de Gemini' }, { status: 500 });
  }
}