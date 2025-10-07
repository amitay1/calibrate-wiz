import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Wand2 } from "lucide-react";
import { PartDiagramGenerator } from "@/components/PartDiagramGenerator";
import { useState } from "react";

interface PartDiagramTabProps {
  partDiagramImage?: string;
  onChange: (image: string | undefined) => void;
  partType?: string;
  thickness?: string;
  diameter?: string;
  length?: string;
}

export const PartDiagramTab = ({ 
  partDiagramImage, 
  onChange, 
  partType = "tube",
  thickness = "50",
  diameter = "200",
  length = "400"
}: PartDiagramTabProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
  };

  const onDiagramGenerated = (imageDataUrl: string) => {
    onChange(imageDataUrl);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Part Diagram (Page 2)</h3>
        <p className="text-sm text-muted-foreground">
          Upload a technical diagram showing the part with all scan locations and dimensions.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="default"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Diagram"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('part-diagram-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Part Diagram
            </Button>
            <input
              id="part-diagram-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {partDiagramImage && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onChange(undefined)}
              >
                <X className="h-4 w-4 mr-2" />
                Remove Image
              </Button>
            )}
          </div>

          {partDiagramImage ? (
            <div className="border rounded-lg p-4">
              <img 
                src={partDiagramImage} 
                alt="Part Diagram" 
                className="w-full h-auto rounded"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No diagram yet</p>
              <p className="text-sm">Generate or upload a technical drawing with scan locations</p>
            </div>
          )}

          {isGenerating && (
            <PartDiagramGenerator
              partType={partType}
              thickness={thickness}
              diameter={diameter}
              length={length}
              onImageGenerated={onDiagramGenerated}
            />
          )}
        </div>
      </Card>
    </div>
  );
};
