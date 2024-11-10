import React from 'react';
import { Card } from "@nextui-org/card";
import { CardBody } from "@nextui-org/card";
import { Spinner } from "@nextui-org/spinner";

interface VisionApiResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string;
    };
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
      locale?: string;
    }>;
  }>;
}

interface OutputResponseProps {
  isLoading?: boolean;
  response?: VisionApiResponse | null;
  error?: string | null;
}

const OutputResponse: React.FC<OutputResponseProps> = ({ 
  isLoading = false, 
  response = null,
  error = null
}) => {
  return (
    <Card className="min-h-[300px] max-h-[600px]">
      <CardBody className="overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" label="Processing image..." />
          </div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : response ? (
          <div className="flex flex-col gap-4">
            {/* Full Text Annotation */}
            {response.responses[0]?.fullTextAnnotation && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Detected Text:</h3>
                <pre className="whitespace-pre-wrap text-sm">
                  {response.responses[0].fullTextAnnotation.text}
                </pre>
              </div>
            )}
            
            {/* Individual Text Annotations */}
            {response.responses[0]?.textAnnotations && (
              <div>
                <h4 className="text-md font-semibold mb-2">Detailed Text Elements:</h4>
                <div className="space-y-2">
                  {response.responses[0].textAnnotations.slice(1).map((annotation, index) => (
                    <div key={index} className="text-sm border-b border-gray-200 pb-2">
                      <p>{annotation.description}</p>
                      {annotation.locale && (
                        <p className="text-xs text-gray-500">Locale: {annotation.locale}</p>
                      )}
                      {annotation.boundingPoly && (
                        <p className="text-xs text-gray-500">
                          Position: ({annotation.boundingPoly.vertices[0].x}, 
                          {annotation.boundingPoly.vertices[0].y})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Text Detected Case */}
            {!response.responses[0]?.fullTextAnnotation && 
             !response.responses[0]?.textAnnotations && (
              <div className="text-center text-gray-500">
                No text was detected in the image
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-default-500">
            Upload an image to see text detection results
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OutputResponse;