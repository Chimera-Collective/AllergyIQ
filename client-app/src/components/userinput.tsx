import React, { useState, useRef } from 'react';
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { SendHorizontal, Upload, X, Camera } from 'lucide-react'; 
import { Camera as CameraPro } from 'react-camera-pro';

// TypeScript interface for the API response structure
// Defines the expected shape of conflicts and potential errors
interface ApiResponse {
  conflicts: {
    ingredient: string;
    allergens: string[];
    description?: string;
  }[];
  error?: string;
}

// Props interface for the UserInput component
// Defines the functions passed down from parent component to manage state
interface UserInputProps {
  setApiResponse: (response: ApiResponse | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const UserInput: React.FC<UserInputProps> = ({ setApiResponse, setIsLoading }) => {
  // State management hooks
  // recipeInput: stores user's text input for ingredients or recipe link
  const [recipeInput, setRecipeInput] = useState<string>("");
  
  // showCamera: toggles camera view for taking photos
  const [showCamera, setShowCamera] = useState<boolean>(false);
  
  // error: stores and displays error messages to the user
  const [error, setError] = useState<string | null>(null);

  // Refs for camera and file input
  // camera: reference to the camera component
  // fileInputRef: reference to hidden file input element
  const camera = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handler for text input changes
  // Clears any previous errors when user starts typing
  const handleInputChange = (value: string) => {
    setRecipeInput(value);
    setError(null);
  };

  // Main submission handler for text-based ingredient analysis
  // Validates input, sends request to backend, and handles response
  const handleSubmit = async () => {
    // Input validation - ensure non-empty input
    if (!recipeInput.trim()) {
      setError("Please enter ingredients or a recipe link");
      return;
    }

    // Manage loading state and clear previous errors
    setIsLoading(true);
    setError(null);
    
    try {
      // API call to ingredient analysis endpoint
      const response = await fetch('api-endpoint/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: recipeInput
        })
      });

      // Throw error for non-200 responses
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse and set API response
      const data: ApiResponse = await response.json();
      setApiResponse(data);
    } catch (error) {
      // Error handling - log to console, set user-friendly error message
      console.error('Error:', error);
      setError('Failed to analyze ingredients. Please try again.');
      setApiResponse(null);
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  // Triggers hidden file input when upload button is clicked
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handles file upload for image-based ingredient analysis
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (must be an image)
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Please upload an image smaller than 5MB');
      return;
    }

    // Prepare for API submission
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Send image to backend for analysis
      const response = await fetch('api-endpoint/analyze/image', {
        method: 'POST',
        body: formData
      });

      // Handle non-200 responses
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse and set API response
      const data: ApiResponse = await response.json();
      setApiResponse(data);
    } catch (error) {
      // Error handling
      console.error('Error uploading file:', error);
      setError('Failed to analyze image. Please try again.');
      setApiResponse(null);
    } finally {
      // Reset loading and file input
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handles photo capture from camera
  const takePhoto = async () => {
    if (camera.current) {
      try {
        // Capture photo from camera
        const photo = camera.current.takePhoto();
        setIsLoading(true);
        setError(null);

        // Convert base64 photo to blob/file for upload
        const response = await fetch(photo);
        const blob = await response.blob();
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

        // Prepare FormData for file upload
        const formData = new FormData();
        formData.append('image', file);

        // Send photo to backend for analysis
        const apiResponse = await fetch('api-endpoint/analyze/image', {
          method: 'POST',
          body: formData
        });

        // Handle non-200 responses
        if (!apiResponse.ok) {
          throw new Error(`HTTP error! status: ${apiResponse.status}`);
        }

        // Parse and set API response
        const data: ApiResponse = await apiResponse.json();
        setApiResponse(data);
      } catch (error) {
        // Error handling
        console.error('Error:', error);
        setError('Failed to process photo. Please try again.');
        setApiResponse(null);
      } finally {
        // Reset loading and camera view
        setIsLoading(false);
        setShowCamera(false);
      }
    }
  };

  // Render component UI
  // Conditionally renders camera view or text input/upload interface
  return (
    <div className="flex flex-col gap-4">
      {/* Camera view with capture functionality */}
      {showCamera ? (
        <div className="relative w-[full] h-[300px] rounded-lg overflow-hidden">
          <CameraPro
            ref={camera}
            aspectRatio={1/1}
            facingMode="environment"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            {/* Camera control buttons */}
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
        // Text input and file upload interface
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
          
          {/* Action buttons for upload and submit */}
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

          {/* Hidden file input for image upload */}
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