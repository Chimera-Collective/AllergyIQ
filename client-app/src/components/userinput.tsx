import React, { useState, useRef } from 'react';
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { SendHorizontal, Upload, X, Camera } from 'lucide-react'; 
import { Camera as CameraPro } from 'react-camera-pro';

interface ApiResponse {
  conflicts: {
    ingredient: string;
    allergens: string[];
    description?: string;
  }[];
  error?: string;
}

interface UserInputProps {
  setApiResponse: (response: ApiResponse | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const UserInput: React.FC<UserInputProps> = ({ setApiResponse, setIsLoading }) => {
  const [recipeInput, setRecipeInput] = useState<string>("");
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const camera = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (value: string) => {
    setRecipeInput(value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!recipeInput.trim()) {
      setError("Please enter ingredients or a recipe link");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('api-endpoint/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: recipeInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to analyze ingredients. Please try again.');
      setApiResponse(null);
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

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Please upload an image smaller than 5MB');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('api-endpoint/analyze/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to analyze image. Please try again.');
      setApiResponse(null);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const takePhoto = async () => {
    if (camera.current) {
      try {
        const photo = camera.current.takePhoto();
        setIsLoading(true);
        setError(null);

        // Convert base64 to blob
        const response = await fetch(photo);
        const blob = await response.blob();
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

        const formData = new FormData();
        formData.append('image', file);

        const apiResponse = await fetch('api-endpoint/analyze/image', {
          method: 'POST',
          body: formData
        });

        if (!apiResponse.ok) {
          throw new Error(`HTTP error! status: ${apiResponse.status}`);
        }

        const data: ApiResponse = await apiResponse.json();
        setApiResponse(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to process photo. Please try again.');
        setApiResponse(null);
      } finally {
        setIsLoading(false);
        setShowCamera(false);
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
            isInvalid={!!error}
            errorMessage={error}
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
              isLoading={false}
              endContent={!false && <SendHorizontal size={20} />}
              className="w-3/4"
              isDisabled={!recipeInput.trim() && !showCamera}
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
        </>
      )}
    </div>
  );
};

export default UserInput;