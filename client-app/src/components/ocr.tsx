import React, { useState } from 'react';
import axios from 'axios';

// Declare type for environment variables
interface ImportMetaEnv {
  readonly VITE_GOOGLE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('Google Vision API key is missing from environment variables');
}

export const Ocr = async (file: File) => {
  console.log("Handling uploading of OCR", file);

  try {
    if (!API_KEY) {
      throw new Error('Google Vision API key is not configured');
    }

    // Convert file to base64
    const base64Image = await fileToBase64(file);

    // Make a request to Google Vision API
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        requests: [
          {
            image: {
              content: base64Image.split(',')[1],
            },
            features: [
              {
                type: 'TEXT_DETECTION',
              },
            ],
          },
        ],
      }
    );

    // Parse the response to get detected text
    const annotations = response.data.responses[0]?.textAnnotations;
    const detectedText = annotations?.[0]?.description || 'No text detected';

    console.log('Detected text:', detectedText);
    return detectedText;
  } catch (error) {
    console.error('Error uploading to Google Vision OCR:', error);
    throw error;
  }
};

// Helper function to convert a File object to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default Ocr;