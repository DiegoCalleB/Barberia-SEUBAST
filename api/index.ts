import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();

// Support large base64 payload uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Lazy initialize GoogleGenAI
let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { imageBase64, category = "hair" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const aiInstance = getAI();
    const result = await analyzeFaceInternal(aiInstance, imageBase64, category);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    res.status(500).json({ error: error.message || "Failed to analyze face" });
  }
});

app.post("/api/tryon", async (req, res) => {
  try {
    const {
      imageBase64,
      styleName,
      category = "hair",
      customInstructions = "",
      styleInstruction = "",
      perspective = "front",
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }
    if (!styleName) {
      return res.status(400).json({ error: "Style name is required" });
    }

    const aiInstance = getAI();
    const result = await generateTryOnInternal(
      aiInstance,
      imageBase64,
      styleName,
      category,
      customInstructions,
      styleInstruction,
      perspective
    );
    res.json({ image: result });
  } catch (error: any) {
    console.error("Error in /api/tryon:", error);
    res.status(500).json({ error: error.message || "Failed to generate try-on" });
  }
});

async function analyzeFaceInternal(aiInstance: GoogleGenAI, imageBase64: string, category: "hair" | "beard" | "both"): Promise<any> {
  const model = "gemini-3-flash-preview";
  
  const hairPrompt = `
    Analiza esta foto de un hombre para una barbería premium.
    Determina su forma de cara (ovalada, cuadrada, redonda, diamante, etc.), su tipo de cabello y su grosor (fino, medio, grueso).
    Recomienda un producto de fijación ideal según su grosor (ej: polvos para fino, cera mate para medio, pomada para grueso).
    Recomienda 3 estilos de corte de la siguiente lista que mejor le quedarían:
    - fade: Moderno, limpio, resalta facciones.
    - classic: Elegante, atemporal, profesional.
    - crop: Texturizado, oculta entradas, fácil mantenimiento.
    - mullet: Atrevido, tendencia, mucha personalidad.
    - buzz: Minimalista, resalta la estructura ósea.
    - pompadour: Volumen clásico, audaz.
    - mohawk: Cresta moderna, rebelde.
    - top-knot: Moño superior, urbano.
    - slick-back: Peinado atrás, elegante.
  `;

  const beardPrompt = `
    Analiza esta foto de un hombre para una barbería premium.
    Determina su forma de cara (ovalada, cuadrada, redonda, diamante, etc.) y su densidad de barba si es visible.
    Recomienda 3 estilos de barba de la siguiente lista que mejor le quedarían:
    - beard-short: Barba de 3 días, pulida, define mandíbula.
    - beard-corporate: Barba completa, recortada, profesional.
    - beard-stubble: Barba sombreada, resalta facciones, moderna.
    - beard-viking: Barba larga, robusta, con carácter.
    - beard-goatee: Perilla clásica, centra atención en barbilla.
    - beard-balbo: Sin patillas, bigote flotante, sofisticado.
    - beard-van-dyke: Bigote y perilla puntiaguda, artístico.
    - beard-mutton-chops: Patillas anchas, retro potente.
    - beard-garibaldi: Ancha y redondeada, natural.
  `;

  const bothPrompt = `
    Analiza esta foto de un hombre para una barbería premium.
    Determina su forma de cara, tipo de cabello, grosor del cabello y densidad de barba.
    Recomienda un producto de fijación ideal según su grosor.
    Recomienda un "Look Completo" combinando un corte de pelo y un estilo de barba de estas listas:
    Pelo: [fade, classic, crop, mullet, buzz, pompadour, mohawk, top-knot, slick-back]
    Barba: [beard-short, beard-corporate, beard-stubble, beard-viking, beard-goatee, beard-balbo, beard-van-dyke, beard-mutton-chops, beard-garibaldi]
    
    Proporciona 3 combinaciones ganadoras (ej: fade + beard-stubble).
  `;

  const prompt = `
    ${category === "hair" ? hairPrompt : category === "beard" ? beardPrompt : bothPrompt}

    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "faceShape": "string",
      "hairType": "string (tipo de pelo)",
      "hairThickness": "string (fino, medio, grueso)",
      "stylingProduct": "string (producto recomendado)",
      "beardDensity": "string (opcional, densidad de barba)",
      "recommendations": [
        { "styleId": "string (si es 'both', usa el formato 'hairId+beardId')", "reason": "string" }
      ],
      "advice": "string (consejo general de estilo. IMPORTANTE: Cuando menciones los nombres de los cortes de pelo o barba en el consejo, usa SIEMPRE nombres COMUNES en Español como 'Degradado', 'Rapado a Máquina', 'Barba de 3 días', 'Perilla', 'Corte Clásico', etc. NO uses identificadores en inglés (ej. fade, mullet, buzz, beard-short) en el texto del consejo, tradúcelos al castellano para el cliente final. Si la categoría es 'both', incluye explícitamente una 'Combinación Perfecta según el Barbero Pro' sugiriendo el combo en español y por qué es la mejor opción para su rostro.)"
    }
  `;

  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.\-]+);base64,/);
  const mimeType = match ? match[1] : "image/jpeg";
  const data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

  const response = await aiInstance.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          faceShape: { type: Type.STRING },
          hairType: { type: Type.STRING },
          hairThickness: { type: Type.STRING },
          stylingProduct: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                styleId: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["styleId", "reason"],
            },
          },
          advice: { type: Type.STRING },
        },
        required: ["faceShape", "hairType", "recommendations", "advice"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

async function generateTryOnInternal(
  aiInstance: GoogleGenAI,
  imageBase64: string,
  styleName: string,
  category: "hair" | "beard" | "both",
  customInstructions: string,
  styleInstruction: string,
  perspective: "front" | "side" | "back"
): Promise<string> {
  const model = "gemini-2.5-flash-image";
  
  let baseTask = "";
  if (category === "hair") {
    baseTask = `Apply a ${styleName} haircut. Only change the hair style. Maintain facial hair.`;
  } else if (category === "beard") {
    baseTask = `Apply a ${styleName} beard style. Only change the facial hair. Maintain current haircut.`;
  } else {
    baseTask = `Apply a matching ${styleName} haircut and beard style.`;
  }

  let perspectivePrompt = "";
  if (perspective === "side") {
    perspectivePrompt = `
    Show the person from a side profile view to clearly display the side of the ${styleName}.
    Keep their identity recognizable.`;
  } else if (perspective === "back") {
    perspectivePrompt = `
    Show the person from the back to clearly display the back of the ${styleName}.
    The face should not be visible.`;
  } else {
    perspectivePrompt = `
    Show the person from the front. Maintain their original facial features, skin texture, and pose as much as possible, but apply the new ${styleName}.
    `;
  }

  const prompt = `
    Task: ${baseTask}
    Style specific details: ${styleInstruction}
    Additional user requests: ${customInstructions}
    
    ${perspectivePrompt}
  `;

  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.\-]+);base64,/);
  const mimeType = match ? match[1] : "image/jpeg";
  const data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

  const response = await aiInstance.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    const parts = candidate.content?.parts || [];
    
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    if (candidate.finishReason === "SAFETY") {
      throw new Error("The AI model blocked the generation due to safety guidelines. Please ensure the photo is appropriate and try again.");
    }
    
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      throw new Error(`The AI model stopped generating. Reason: ${candidate.finishReason}`);
    }
    
    let textOutput;
    try {
      textOutput = response.text;
    } catch (e) {}
    
    if (textOutput) {
      throw new Error(`AI Model Decision: ${textOutput}`);
    }
  }
  
  throw new Error("The AI model finished without generating an image candidate. Please try again with a clearer photo or different instructions.");
}

export default app;
