import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Plus } from "lucide-react";
import { CalibrationBlockType } from "@/types/techniqueSheet";

interface CalibrationModel {
  id: CalibrationBlockType | string;
  name: string;
  figure: string;
  description: string;
  beamType: "straight" | "angle";
  imageUrl: string;
  applications: string[];
  isCustom?: boolean;
}

interface CalibrationCatalogProps {
  recommendedModel?: CalibrationBlockType | null;
  onSelectModel: (modelId: string) => void;
  selectedModel?: string;
}

const calibrationModels: CalibrationModel[] = [
  {
    id: "flat_block",
    name: "Flat Block with FBH",
    figure: "Figure 4",
    description: "Standard flat reference block with flat-bottom holes for straight beam inspection",
    beamType: "straight",
    imageUrl: "/placeholder.svg",
    applications: ["Plate inspection", "Bar inspection", "General straight beam calibration"]
  },
  {
    id: "curved_block",
    name: "Curved Block with FBH",
    figure: "Figure 3",
    description: "Curved surface reference block matching part geometry for straight beam",
    beamType: "straight",
    imageUrl: "/placeholder.svg",
    applications: ["Cylindrical parts", "Curved surfaces", "Forgings with radius"]
  },
  {
    id: "cylinder_fbh",
    name: "Hollow Cylindrical - FBH",
    figure: "Figure 6",
    description: "Hollow cylindrical block with flat-bottom holes for tube inspection",
    beamType: "straight",
    imageUrl: "/placeholder.svg",
    applications: ["Tube inspection", "Pipe calibration", "Hollow shaft inspection"]
  },
  {
    id: "angle_beam",
    name: "Type IIv Reference Block",
    figure: "Figure 7",
    description: "Angle beam reference block for shear wave inspection with side-drilled holes",
    beamType: "angle",
    imageUrl: "/placeholder.svg",
    applications: ["Weld inspection", "Shear wave calibration", "Angle beam technique"]
  },
  {
    id: "cylinder_notched",
    name: "Hollow Cylindrical - Notched",
    figure: "Figure 5",
    description: "Hollow cylindrical block with notches for angle beam inspection",
    beamType: "angle",
    imageUrl: "/placeholder.svg",
    applications: ["Tube welds", "Pipe inspection", "Circumferential scanning"]
  },
  {
    id: "iiv_block",
    name: "IIW (V1/V2) Block",
    figure: "IIW Standard",
    description: "International Institute of Welding calibration block for angle beam",
    beamType: "angle",
    imageUrl: "/placeholder.svg",
    applications: ["Weld inspection", "Beam angle verification", "Index point calibration"]
  }
];

export const CalibrationCatalog = ({ 
  recommendedModel, 
  onSelectModel,
  selectedModel 
}: CalibrationCatalogProps) => {
  const [activeTab, setActiveTab] = useState<"straight" | "angle">("straight");
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customModels, setCustomModels] = useState<CalibrationModel[]>([]);
  const [customForm, setCustomForm] = useState({
    name: "",
    description: "",
    beamType: "straight" as "straight" | "angle",
    applications: ""
  });

  // Auto-switch to the tab containing the recommended model
  useEffect(() => {
    if (recommendedModel) {
      const model = [...calibrationModels, ...customModels].find(m => m.id === recommendedModel);
      if (model) {
        setActiveTab(model.beamType);
      }
    }
  }, [recommendedModel, customModels]);

  const handleCreateCustom = () => {
    if (!customForm.name) return;

    const newModel: CalibrationModel = {
      id: `custom_${Date.now()}`,
      name: customForm.name,
      figure: "Custom",
      description: customForm.description,
      beamType: customForm.beamType,
      imageUrl: "/placeholder.svg",
      applications: customForm.applications.split(',').map(s => s.trim()).filter(Boolean),
      isCustom: true
    };

    setCustomModels([...customModels, newModel]);
    setShowCustomDialog(false);
    setCustomForm({ name: "", description: "", beamType: "straight", applications: "" });
  };

  const allModels = [...calibrationModels, ...customModels];
  const straightModels = allModels.filter(m => m.beamType === "straight");
  const angleModels = allModels.filter(m => m.beamType === "angle");

  const ModelCard = ({ model }: { model: CalibrationModel }) => {
    const isRecommended = model.id === recommendedModel;
    const isSelected = model.id === selectedModel;

    return (
      <Card
        className={`relative p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
          isRecommended
            ? "ring-4 ring-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] animate-pulse-glow"
            : isSelected
            ? "ring-2 ring-accent"
            : "hover:shadow-lg"
        }`}
        onClick={() => onSelectModel(model.id as string)}
      >
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-primary text-primary-foreground shadow-lg flex items-center gap-1 px-3 py-1">
              <Sparkles className="h-3 w-3" />
              Recommended
            </Badge>
          </div>
        )}
        
        {model.isCustom && (
          <div className="absolute -top-3 right-3 z-10">
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
              Custom
            </Badge>
          </div>
        )}

        <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
          <img 
            src={model.imageUrl} 
            alt={model.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground">{model.name}</h4>
            <Badge variant="secondary" className="text-xs shrink-0">
              {model.figure}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {model.description}
          </p>

          <div className="flex flex-wrap gap-1 pt-2">
            {model.applications.slice(0, 2).map((app, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {app}
              </Badge>
            ))}
            {model.applications.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{model.applications.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "straight" | "angle")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="straight">Straight Beam</TabsTrigger>
            <TabsTrigger value="angle">Angle Beam</TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Custom Model
          </Button>
        </div>

        <TabsContent value="straight" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {straightModels.map(model => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
          {straightModels.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No straight beam models available. Create a custom model.
            </div>
          )}
        </TabsContent>

        <TabsContent value="angle" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {angleModels.map(model => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
          {angleModels.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No angle beam models available. Create a custom model.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Custom Model Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Calibration Model</DialogTitle>
            <DialogDescription>
              Define your own calibration block configuration for unique inspection requirements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Model Name *</Label>
              <Input
                value={customForm.name}
                onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                placeholder="e.g., Custom Forging Block"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={customForm.description}
                onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                placeholder="Describe the block configuration..."
              />
            </div>

            <div className="space-y-2">
              <Label>Beam Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={customForm.beamType === "straight"}
                    onChange={() => setCustomForm({ ...customForm, beamType: "straight" })}
                    className="w-4 h-4"
                  />
                  <span>Straight Beam</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={customForm.beamType === "angle"}
                    onChange={() => setCustomForm({ ...customForm, beamType: "angle" })}
                    className="w-4 h-4"
                  />
                  <span>Angle Beam</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Applications (comma-separated)</Label>
              <Input
                value={customForm.applications}
                onChange={(e) => setCustomForm({ ...customForm, applications: e.target.value })}
                placeholder="e.g., Forging inspection, Custom geometry"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCustom} disabled={!customForm.name}>
                Create Model
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
