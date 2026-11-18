export interface StylistAnalysis {
  faceShape: string;
  hairType: string;
  hairThickness?: string;
  stylingProduct?: string;
  beardDensity?: string;
  barberTechnicalTip?: string;
  recommendations: {
    styleId: string;
    reason: string;
  }[];
  advice: string;
}

export async function analyzeFace(
  imageBase64: string,
  category: 'hair' | 'beard' | 'both' = 'hair'
): Promise<StylistAnalysis> {
  const response = await fetch('/api/stylist/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      category,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al analizar la imagen.');
  }

  return data as StylistAnalysis;
}

export async function generateTryOn(
  imageBase64: string,
  styleName: string,
  category: 'hair' | 'beard' | 'both' = 'hair',
  customInstructions: string = '',
  styleInstruction: string = '',
  perspective: 'front' | 'side' | 'back' = 'front'
): Promise<string> {
  const response = await fetch('/api/stylist/try-on', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      styleName,
      category,
      customInstructions,
      styleInstruction,
      perspective,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.imageUrl) {
    throw new Error(
      data.error ||
        'No se pudo generar la vista previa en este intento. Inténtalo de nuevo con una foto clara.'
    );
  }

  return data.imageUrl;
}
