import React, { useState, useRef } from 'react';
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { SendHorizontal, Upload, X, Camera } from 'lucide-react'; 
import { Camera as CameraPro } from 'react-camera-pro';
import { Ocr } from './ocr'
import OutputResponse from './OutputResponse';
import axios from 'axios';

const UserInput = () => {
  const [recipeInput, setRecipeInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [outputResponse, setOutputResponse] = useState<any>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
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
    try {
      const detectedText = await Ocr(file); // Get text from OCR
      // const response = await axios.post('/process/text', { text: detectedText });
      // setOutputResponse(response.data); // Set server response
      console.log("detectedText", detectedText)
      setOutputResponse("????????????????????????"); // Set server response
    } catch (error) {
      setOutputResponse({ error: 'An error occurred while processing the image.' });
      console.error('Error processing file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      console.log('Photo taken:', photo);
      setShowCamera(false);
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
            response={outputResponse}
            // error={error}
          />
        </>
      )}
    </div>
  );
};

export default UserInput;