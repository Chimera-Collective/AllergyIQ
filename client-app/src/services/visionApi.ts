// src/services/visionApi.ts
export class VisionApiService {
    private apiKey: string;
    
    constructor(apiKey: string) {
      if (!apiKey) {
        throw new Error('API key is required for Vision API');
      }
      this.apiKey = apiKey;
    }
  
    async analyzeImage(imageBase64: string) {
      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [{
                image: {
                  content: imageBase64
                },
                features: [{
                  type: 'TEXT_DETECTION',
                  maxResults: 10
                }]
              }]
            })
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}` +
            (errorData ? ` - ${JSON.stringify(errorData)}` : '')
          );
        }
  
        const data = await response.json();
        
        // Verify the response structure
        if (!data || !Array.isArray(data.responses) || data.responses.length === 0) {
          throw new Error('Invalid API response format');
        }
  
        return data;
      } catch (error) {
        console.error('Vision API Error:', error);
        throw error;
      }
    }
  }