import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Increase payload limit to handle base64 images from camera/upload
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // POST /api/stylist/analyze
  app.post('/api/stylist/analyze', async (req, res) => {
    try {
      const { imageBase64, category = 'hair' } = req.body;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'imageBase64 is required' });
        return;
      }

      const ai = getGenAIClient();
      const model = 'gemini-3.5-flash';

      const hairPrompt = `
    Analiza esta foto de un hombre para una barbería premium.
    Determina su forma de cara (ovalada, cuadrada, redonda, diamante, etc.), su tipo de cabello y su grosor (fino, medio, grueso).
    Recomienda un producto de fijación ideal según su grosor (ej: polvos voluminizadores para fino, cera mate para medio, pomada fuerte para grueso).
    Incluye una indicación técnica breve para el barbero (barberTechnicalTip) sobre cómo trabajar sus sienes, coronilla o volumen según su cráneo y facciones.
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
    Incluye una indicación técnica breve para el barbero (barberTechnicalTip) sobre a qué altura trazar la línea del pómulo y del cuello para favorecer su mandíbula.
    Recomienda 3 estilos de barba de la siguiente lista que mejor le quedarían:
    - beard-short: Barba de 3 días sombreada, pulida, define mandíbula.
    - beard-corporate: Barba completa, recortada, profesional.
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
    Incluye una indicación técnica breve para el barbero (barberTechnicalTip) sobre cómo conectar la transición entre patilla, degradado y barba para equilibrar sus facciones.
    Recomienda un "Look Completo" combinando un corte de pelo y un estilo de barba de estas listas exactas:
    Pelo: [fade, classic, crop, mullet, buzz, pompadour, mohawk, top-knot, slick-back]
    Barba: [beard-short, beard-corporate, beard-viking, beard-goatee, beard-balbo, beard-van-dyke, beard-mutton-chops, beard-garibaldi]
    
    Proporciona 3 combinaciones ganadoras usando el formato exacto 'hairId+beardId' (ej: fade+beard-short, classic+beard-corporate).
  `;

      const prompt = `
    ${category === 'hair' ? hairPrompt : category === 'beard' ? beardPrompt : bothPrompt}

    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "faceShape": "string",
      "hairType": "string (tipo de pelo)",
      "hairThickness": "string (fino, medio, grueso)",
      "stylingProduct": "string (producto recomendado)",
      "beardDensity": "string (opcional, densidad de barba)",
      "barberTechnicalTip": "string (nota técnica precisa para el barbero sobre ángulos, sienes o mandíbula)",
      "recommendations": [
        { "styleId": "string (si es 'both', usa el formato 'hairId+beardId')", "reason": "string (por qué favorece a su rostro en español)" }
      ],
      "advice": "string (consejo general de estilo en español usando nombres naturales como 'Degradado', 'Corte Clásico a Tijera', 'Barba de 3 Días', etc.)"
    }
  `;

      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const mimeType = imageBase64.match(/^data:(image\/[a-zA-Z0-9.\-]+);base64,/)?.[1] || 'image/jpeg';

      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              faceShape: { type: Type.STRING },
              hairType: { type: Type.STRING },
              hairThickness: { type: Type.STRING },
              stylingProduct: { type: Type.STRING },
              beardDensity: { type: Type.STRING },
              barberTechnicalTip: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    styleId: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['styleId', 'reason']
                }
              },
              advice: { type: Type.STRING }
            },
            required: ['faceShape', 'hairType', 'recommendations', 'advice']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      res.status(500).json({
        error: error?.message || 'Error al analizar la imagen en el servidor.'
      });
    }
  });

  // POST /api/stylist/try-on
  app.post('/api/stylist/try-on', async (req, res) => {
    try {
      const {
        imageBase64,
        styleName,
        category = 'hair',
        customInstructions = '',
        styleInstruction = '',
        perspective = 'front'
      } = req.body;

      if (!imageBase64 || typeof imageBase64 !== 'string' || !styleName) {
        res.status(400).json({ error: 'imageBase64 and styleName are required' });
        return;
      }

      const ai = getGenAIClient();
      const model = 'gemini-2.5-flash-image';

      let baseTask = '';
      if (category === 'hair') {
        baseTask = `Edit the hair in this portrait photo to give the person a ${styleName} hairstyle. Keep their facial hair, face, lighting, and background intact.`;
      } else if (category === 'beard') {
        baseTask = `Edit the facial hair in this portrait photo to give the person a ${styleName} beard style. Keep their current hairstyle, face, lighting, and background intact.`;
      } else {
        baseTask = `Edit the hair and facial hair in this portrait photo to give the person a ${styleName} hairstyle and beard combination. Keep their face, lighting, and background intact.`;
      }

      let perspectivePrompt = '';
      if (perspective === 'side') {
        perspectivePrompt = `Show the hairstyle and beard from a natural side profile angle while preserving the same person and lighting.`;
      } else if (perspective === 'back') {
        perspectivePrompt = `Show the back view of the head and neck to display the rear haircut fade and neckline clearly.`;
      } else {
        perspectivePrompt = `Keep the exact same front portrait pose, facial identity, skin tone, clothing, and background.`;
      }

      // Sanitize instructions that might contain words like "navaja", "afeitados a cero", "skin" that can trigger false-positive IMAGE_OTHER filters
      const safeDetails = `${styleInstruction} ${customInstructions}`
        .replace(/navaja/gi, 'acabado limpio')
        .replace(/afeitados?\s+a\s+cero/gi, 'muy corto y pulido')
        .replace(/skin\s+fade/gi, 'clean gradient fade')
        .trim();

      const primaryPrompt = `${baseTask}
${safeDetails ? `Styling details: ${safeDetails}` : ''}
${perspectivePrompt}
Return the edited portrait image.`;

      const fallbackPrompt = `Virtual barbershop hairstyle preview: edit only the ${
        category === 'beard' ? 'beard' : category === 'hair' ? 'hairstyle' : 'hairstyle and beard'
      } in this portrait to a clean, professional "${styleName}" style. Keep the person's face, expression, clothing, and background unchanged.`;

      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const mimeType = imageBase64.match(/^data:(image\/[a-zA-Z0-9.\-]+);base64,/)?.[1] || 'image/jpeg';

      const promptsToTry = [primaryPrompt, fallbackPrompt];
      let lastFinishReason = '';

      for (const promptText of promptsToTry) {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              parts: [
                { inlineData: { data: base64Data, mimeType } },
                { text: promptText }
              ]
            }
          ]
        });

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        for (const part of parts) {
          if (part.inlineData?.data) {
            res.json({
              imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
            });
            return;
          }
        }

        if (candidate?.finishReason) {
          lastFinishReason = candidate.finishReason;
        }
      }

      if (lastFinishReason === 'SAFETY' || lastFinishReason === 'IMAGE_SAFETY') {
        res.status(422).json({
          error: 'No se pudo procesar esta imagen por políticas de seguridad. Hazte una foto frontal clara con buena luz e inténtalo de nuevo.'
        });
        return;
      }

      if (lastFinishReason === 'IMAGE_OTHER') {
        res.status(422).json({
          error: 'El modelo IA no pudo editar esta foto (evita fotos de famosos o con poca luz). Hazte una foto frontal con la cámara para probar el estilo.'
        });
        return;
      }

      res.status(422).json({
        error: 'No se pudo generar la vista previa en este intento. Por favor, prueba con una foto frontal bien iluminada.'
      });
    } catch (error: any) {
      res.status(500).json({
        error: error?.message || 'Error al generar el look en el servidor.'
      });
    }
  });

  // POST /api/fresha/booking-intent
  app.post('/api/fresha/booking-intent', async (req, res) => {
    try {
      const {
        clientName,
        clientEmail,
        clientPhone,
        serviceName,
        styleName,
        styleRecipe,
        barberName,
        dateFormatted,
        timeSlot,
        estimatedPrice,
        customFreshaUrl
      } = req.body;

      const baseFreshaUrl =
        customFreshaUrl ||
        process.env.FRESHA_BOOKING_URL ||
        process.env.VITE_FRESHA_URL ||
        'https://www.fresha.com/es';

      const bookingSummary = [
        `Reserva SEUBAST: ${serviceName || 'Servicio de Barbería'}`,
        styleName ? `Estilo: ${styleName}` : null,
        styleRecipe ? `Ficha Técnica: ${styleRecipe}` : null,
        barberName ? `Barbero preferido: ${barberName}` : null,
        dateFormatted && timeSlot ? `Horario solicitado: ${dateFormatted} a las ${timeSlot}` : null,
        estimatedPrice ? `Total estimado: €${estimatedPrice}` : null,
        clientName ? `Cliente: ${clientName} (${clientPhone || ''} · ${clientEmail || ''})` : null
      ]
        .filter(Boolean)
        .join(' | ');

      res.json({
        ok: true,
        freshaUrl: baseFreshaUrl,
        bookingSummary,
        referenceCode: `SB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      });
    } catch (error: any) {
      console.error('Server error in /api/fresha/booking-intent:', error);
      res.status(500).json({
        error: error?.message || 'Error al preparar la conexión con Fresha.'
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
