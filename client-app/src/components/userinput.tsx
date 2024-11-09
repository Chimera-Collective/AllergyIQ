// src/components/UserInput.tsx
import React, { useState, useRef } from 'react';
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { SendHorizontal, Upload, X, Camera } from 'lucide-react';
import { Camera as CameraPro } from 'react-camera-pro';
import { analyzeImage } from './ImageAnalyzer';
import OutputResponse from './OutputResponse';

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

const UserInput = () => {
  const [recipeInput, setRecipeInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [visionResponse, setVisionResponse] = useState<VisionApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const camera = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (value: string) => {
    setRecipeInput(value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const jsonData = {
        recipeText: recipeInput
      };
      console.log('Data to be sent:', jsonData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setVisionResponse(null);

    try {
      await analyzeImage({
        file,
        onResult: (response) => {
          setVisionResponse(response);
          const extractedText = response.responses[0]?.fullTextAnnotation?.text || '';
          setRecipeInput(extractedText);
        },
        onError: (errorMessage) => {
          setError(errorMessage);
          console.error('Error analyzing image:', errorMessage);
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      setShowCamera(false);
      
      // Convert base64 photo to File object
      const response = await fetch(photo);
      const blob = await response.blob();
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      
      setIsLoading(true);
      setError(null);
      setVisionResponse(null);

      try {
        await analyzeImage({
          file,
          onResult: (response) => {
            setVisionResponse(response);
            const extractedText = response.responses[0]?.fullTextAnnotation?.text || '';
            setRecipeInput(extractedText);
          },
          onError: (errorMessage) => {
            setError(errorMessage);
            console.error('Error analyzing image:', errorMessage);
          }
        });
      } catch (error) {
        console.error('Error processing photo:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {showCamera ? (
        <div className="relative w-[full] h-[300px] rounded-lg overflow-hidden">
          <CameraPro
            ref={camera}
            aspectRatio={1/1}
            facingMode="environment"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              color="danger"
              variant="solid"
              size="lg"
              onClick={() => setShowCamera(false)}
              startContent={<X size={20} />}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              variant="solid"
              size="lg"
              onClick={takePhoto}
              startContent={<Camera size={20} />}
            >
              Capture
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Textarea
            placeholder="12 ounces of spaghetti, 4 large egg yolks, 1 cup of freshly grated Parmesan cheese..."
            description="Enter link or ingredients to be analyzed here."
            value={recipeInput}
            onValueChange={handleInputChange}
            minRows={4}
            maxRows={20}
            size="lg"
            variant="bordered"
          />
          
          <div className="flex gap-2 sm:gap-4">
            <Button
              color="secondary"
              variant="shadow"
              size="lg"
              onClick={handleUploadClick}
              startContent={<Upload size={20} />}
              className="w-1/4"
            >
            </Button>

            <Button
              color="primary"
              variant="shadow"
              size="lg"
              onClick={handleSubmit}
              isLoading={isLoading}
              endContent={!isLoading && <SendHorizontal size={20} />}
              className="w-3/4"
            >
              Submit
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />

          <OutputResponse 
            isLoading={isLoading}
            response={visionResponse}
            error={error}
          />
        </>
      )}
    </div>
  );
};

export default UserInput;