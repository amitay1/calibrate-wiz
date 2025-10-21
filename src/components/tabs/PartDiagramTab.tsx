import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Wand2, Download } from "lucide-react";
import { PartDiagramGenerator } from "@/components/PartDiagramGenerator";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";

const AdvancedTechnicalDrawingGenerator = lazy(() => 
  import("@/components/AdvancedTechnicalDrawingGenerator").then(module => ({
    default: module.AdvancedTechnicalDrawingGenerator
  }))
);

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
  const [useAdvanced, setUseAdvanced] = useState(true);
  const [lastGeneratorRef, setLastGeneratorRef] = useState<any>(null);

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

  const onDiagramGenerated = (imageDataUrl: string, generatorRef?: any) => {
    onChange(imageDataUrl);
    setIsGenerating(false);
    if (generatorRef) {
      setLastGeneratorRef(generatorRef);
    }
    toast.success("Technical drawing generated successfully!");
  };

  const handleExportDXF = () => {
    if (!lastGeneratorRef) {
      toast.error("Please generate a drawing first before exporting to DXF");
      return;
    }
    
    try {
      const dxfContent = lastGeneratorRef.exportToDXF();
      if (!dxfContent) {
        toast.error("Failed to generate DXF content");
        return;
      }
      
      // Create blob and download
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `part-diagram-${partType}-${Date.now()}.dxf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("DXF exported successfully!");
    } catch (error) {
      console.error('DXF export error:', error);
      toast.error("Failed to export DXF. Please try again.");
    }
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
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              type="button"
              variant="default"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : useAdvanced ? "Advanced Drawing" : "Basic Drawing"}
            </Button>
            <Button
              type="button"
              variant={useAdvanced ? "default" : "outline"}
              onClick={() => setUseAdvanced(!useAdvanced)}
              size="sm"
            >
              {useAdvanced ? "Professional Mode ✓" : "Basic Mode"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('part-diagram-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Drawing
            </Button>
            <input
              id="part-diagram-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {partDiagramImage && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportDXF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export DXF
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onChange(undefined)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </>
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
            <Suspense fallback={<div>Loading generator...</div>}>
              {useAdvanced ? (
                <AdvancedTechnicalDrawingGenerator
                  partType={partType}
                  thickness={thickness}
                  diameter={diameter}
                  length={length}
                  onImageGenerated={onDiagramGenerated}
                />
              ) : (
                <PartDiagramGenerator
                  partType={partType}
                  thickness={thickness}
                  diameter={diameter}
                  length={length}
                  onImageGenerated={onDiagramGenerated}
                />
              )}
            </Suspense>
          )}
        </div>
      </Card>
    </div>
  );
};
