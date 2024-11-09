import React from 'react';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Validate API key on component load
if (!API_KEY) {
  console.error('Missing Google Cloud Vision API key in environment variables');
}

export const Ocr = async (file: File) => {
  console.log("Starting OCR process");
  
  try {
    if (!API_KEY) {
      throw new Error('Google Cloud Vision API key is not configured');
    }

    // Convert file to base64
    const base64Image = await fileToBase64(file);
    
    // Configure axios request
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    // Prepare request body
    const requestBody = {
      requests: [{
        image: {
          content: base64Image.split(',')[1],
        },
        features: [{
          type: 'TEXT_DETECTION',
          maxResults: 1,
        }],
      }],
    };

    // Make request with error handling
    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
        requestBody,
        config
      );

      // Check if we have valid response data
      if (!response.data || !response.data.responses) {
        throw new Error('Invalid response from Vision API');
      }

      const annotations = response.data.responses[0]?.textAnnotations;
      const detectedText = annotations?.[0]?.description || 'No text detected';

      console.log('Successfully detected text:', detectedText);
      return detectedText;

    } catch (apiError: any) {
      // Handle specific API errors
      if (apiError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response:', apiError.response.data);
        throw new Error(
          `Vision API Error: ${apiError.response.data.error?.message || apiError.message}`
        );
      } else if (apiError.request) {
        // The request was made but no response was received
        console.error('No response received:', apiError.request);
        throw new Error('No response received from Vision API');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', apiError.message);
        throw new Error(`Request setup error: ${apiError.message}`);
      }
    }

  } catch (error) {
    console.error('Error in OCR process:', error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default Ocr;