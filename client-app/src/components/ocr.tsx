import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
export const Ocr = async (file: File) => {
  try {
    console.log("Handling uploading of OCR", file);
    console.log("API_KEY:", API_KEY)

    // Convert file to Base64
    const base64Image = await fileToBase64(file);
    
    // Remove the `data:image/png;base64,` prefix if present
    const base64Data = base64Image.split(',')[1];

    // Set up request to Google Vision API
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        requests: [
          {
            image: { content: base64Data },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }
    );

    // // Extract text from the response
    const annotations = response.data.responses[0]?.textAnnotations;
    const detectedText = annotations?.[0]?.description || 'No text detected';

    console.log('Detected text:', detectedText);
    return detectedText;
  } catch (error) {
    console.error('Error uploading to Google Vision OCR:', error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

export default {Ocr, fileToBase64}