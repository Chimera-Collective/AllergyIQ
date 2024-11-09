import React from 'react';
import { Card, CardBody } from "@nextui-org/card";
import { Spinner } from "@nextui-org/spinner";

interface Conflict {
  ingredient: string;
  allergens: string[];
  description?: string;
}

interface OutputResponseProps {
  isLoading: boolean;
  response: {
    conflicts?: Conflict[];
    error?: string;
  } | null;
}

const OutputResponse: React.FC<OutputResponseProps> = ({ 
  isLoading = false, 
  response = null 
}) => {
  const renderConflicts = (conflicts: Conflict[]) => {
    if (conflicts.length === 0) {
      return (
        <div className="flex items-center justify-center p-4 text-success">
          No allergen conflicts found in these ingredients.
        </div>
      );
    }

    return conflicts.map((conflict, index) => (
      <div 
        key={index} 
        className="p-4 mb-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg"
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-danger">
            {conflict.ingredient}
          </h3>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Allergens:</p>
            <div className="flex flex-wrap gap-2">
              {conflict.allergens.map((allergen, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 text-xs bg-danger-100 dark:bg-danger-800/40 rounded-full"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
          {conflict.description && (
            <p className="text-sm mt-2 text-default-600">
              {conflict.description}
            </p>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Card className="w-full">
      <CardBody className="overflow-y-auto min-h-[300px] max-h-[600px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Spinner 
              size="lg" 
              color="primary"
              label="Analyzing ingredients..."
            />
          </div>
        ) : response ? (
          <div className="flex flex-col">
            {response.error ? (
              <div className="flex items-center justify-center p-4 text-danger">
                {response.error}
              </div>
            ) : response.conflicts ? (
              renderConflicts(response.conflicts)
            ) : (
              <div className="flex items-center justify-center p-4 text-danger">
                Invalid response format
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-default-500">
            Enter ingredients or upload a photo to check for allergen conflicts
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OutputResponse;