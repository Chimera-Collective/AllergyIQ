export interface VisionApiResponse {
    responses: Array<{
      fullTextAnnotation?: {
        text: string;
      };
      textAnnotations?: Array<{
        description: string;
      }>;
    }>;
  }