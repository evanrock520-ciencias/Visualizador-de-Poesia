export default function createGlobalAnalysisPrompt(poem: string) {
    const prompt = `
    Tu tarea es actuar como un analista literario y director de arte. Tu objetivo es leer un poema completo y extraer su esencia para guiar una experiencia audiovisual generativa.

    Debes devolver **ÚNICAMENTE un objeto JSON válido**, sin explicaciones ni comentarios. La estructura debe ser EXACTAMENTE la que se define a continuación.

    **POEMA COMPLETO:**
    """
    ${poem}
    """

    **INSTRUCCIONES DE ANÁLISIS GLOBAL:**

    1.  **\`\`mainTheme\`\`:** Resume el tema central del poema en una frase corta (ej: "La melancolía por un amor perdido").
    2.  **\`\`emotionalArc\`\`:** Describe el viaje emocional del poema de principio a fin (ej: "Comienza con una tristeza profunda, pasa por la nostalgia y termina con una aceptación resignada").
    3.  **\`\`keySymbols\`\`:** Identifica los 2-4 símbolos o imágenes más importantes y recurrentes en todo el poema (ej: ["noche", "estrellas", "viento"]).
    4.  **\`\`suggestedPaletteStyle\`\`:** Basado en la emoción general, sugiere un estilo de paleta de colores. Elige UNA de las siguientes opciones: 'somber' (oscuros, desaturados), 'vibrant' (brillantes, energéticos), 'pastel' (suaves, soñadores), 'monochromatic' (variaciones de un solo color).

    **ESTRUCTURA JSON DE SALIDA EXACTA:**
    {
      "mainTheme": "La melancolía por un amor perdido",
      "emotionalArc": "Comienza con una tristeza profunda, pasa por la nostalgia y termina con una aceptación resignada",
      "keySymbols": ["noche", "estrellas", "viento"],
      "suggestedPaletteStyle": "somber"
    }
    `;
    return prompt;
}