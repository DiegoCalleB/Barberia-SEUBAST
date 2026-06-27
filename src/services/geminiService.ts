export interface StylistAnalysis {
  faceShape: string;
  hairType: string;
  hairThickness?: string;
  stylingProduct?: string;
  beardDensity?: string;
  recommendations: {
    styleId: string;
    reason: string;
  }[];
  advice: string;
}

export async function analyzeFace(imageBase64: string, category: 'hair' | 'beard' | 'both' = 'hair'): Promise<StylistAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageBase64, category })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error del servidor: ${response.status}`);
  }

  return response.json();
}

export async function generateTryOn(
  imageBase64: string, 
  styleName: string, 
  category: 'hair' | 'beard' | 'both' = 'hair',
  customInstructions: string = "",
  styleInstruction: string = "",
  perspective: 'front' | 'side' | 'back' = 'front'
): Promise<string> {
  const response = await fetch('/api/tryon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageBase64,
      styleName,
      category,
      customInstructions,
      styleInstruction,
      perspective
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error del servidor: ${response.status}`);
  }

  const result = await response.json();
  return result.image;
}
