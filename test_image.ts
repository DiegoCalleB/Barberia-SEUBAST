import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Create a 1x1 black image in base64 as a stub
  const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          parts: [
            { inlineData: { data: dummyImage, mimeType: "image/png" } },
            { text: "Apply a fade haircut. Only change the hair style. Maintain facial hair." }
          ]
        }
      ]
    });
    console.log("Success! Response text:", response.text);
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
