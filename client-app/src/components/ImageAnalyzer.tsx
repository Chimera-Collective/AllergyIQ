// src/components/ImageAnalyzer.ts
import { VisionApiService } from '../services/visionApi';
import { googleCloudConfig } from '../config/googleCloud';

interface AnalyzeImageProps {
  file: File;
  onResult: (response: any) => void;
  onError: (error: string) => void;
}

export async function analyzeImage({ file, onResult, onError }: AnalyzeImageProps) {
  try {
    if (!googleCloudConfig.apiKey) {
      throw new Error('API key is not configured');
    }

    const visionService = new VisionApiService(googleCloudConfig.apiKey);
    const base64Image = await convertFileToBase64(file);
    const response = await visionService.analyzeImage(base64Image);
    
    // Verify response structure before passing it to the callback
    if (!response || !response.responses || !Array.isArray(response.responses)) {
      throw new Error('Invalid API response format');
    }

    onResult(response);
  } catch (err) {
    console.error('Vision API Error:', err);
    onError(err instanceof Error ? err.message : 'An error occurred while analyzing the image');
  }
}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = error => reject(error);
  });
}