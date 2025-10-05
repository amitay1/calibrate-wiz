import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardSelector } from "@/components/StandardSelector";
import { ProgressHeader } from "@/components/ProgressHeader";
import { InspectionSetupTab } from "@/components/tabs/InspectionSetupTab";
import { EquipmentTab } from "@/components/tabs/EquipmentTab";
import { ThreeDViewer } from "@/components/ThreeDViewer";
import { Button } from "@/components/ui/button";
import { Save, FileDown, CheckCircle2, Target } from "lucide-react";
import { StandardType, InspectionSetupData, EquipmentData } from "@/types/techniqueSheet";

const Index = () => {
  const [standard, setStandard] = useState<StandardType>("MIL-STD-2154");
  const [activeTab, setActiveTab] = useState("setup");
  
  const [inspectionSetup, setInspectionSetup] = useState<InspectionSetupData>({
    partNumber: "",
    partName: "",
    material: "",
    materialSpec: "",
    partType: "",
    partThickness: 25.0,
    partLength: 100.0,
    partWidth: 50.0,
    diameter: 0,
  });

  const [equipment, setEquipment] = useState<EquipmentData>({
    manufacturer: "",
    model: "",
    serialNumber: "",
    frequency: "5.0",
    transducerType: "",
    transducerDiameter: 0.5,
    couplant: "",
    verticalLinearity: 95,
    horizontalLinearity: 85,
    entrySurfaceResolution: 0.125,
    backSurfaceResolution: 0.05,
  });

  // Calculate completion
  const calculateCompletion = () => {
    let completed = 0;
    let total = 15;

    // Count filled required fields
    if (inspectionSetup.partNumber) completed++;
    if (inspectionSetup.partName) completed++;
    if (inspectionSetup.material) completed++;
    if (inspectionSetup.materialSpec) completed++;
    if (inspectionSetup.partType) completed++;
    if (inspectionSetup.partThickness >= 6.35) completed++;
    
    if (equipment.manufacturer) completed++;
    if (equipment.model) completed++;
    if (equipment.frequency) completed++;
    if (equipment.transducerType) completed++;
    if (equipment.couplant) completed++;

    return { completed, total, percent: (completed / total) * 100 };
  };

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Scan Master Inspection Pro</h1>
                <p className="text-sm text-muted-foreground">Ultrasonic Inspection Technique Sheet Creator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button size="sm" className="gradient-primary">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Validate
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <StandardSelector value={standard} onChange={setStandard} />
          </div>
          <div className="lg:col-span-2">
            <ProgressHeader
              completionPercent={completion.percent}
              requiredFieldsComplete={completion.completed}
              totalRequiredFields={completion.total}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-4">
                <TabsTrigger value="setup" className="text-xs">
                  🔧 Setup
                </TabsTrigger>
                <TabsTrigger value="equipment" className="text-xs">
                  ⚙️ Equipment
                </TabsTrigger>
                <TabsTrigger value="calibration" className="text-xs">
                  📏 Calibration
                </TabsTrigger>
                <TabsTrigger value="scan" className="text-xs">
                  📡 Scan
                </TabsTrigger>
                <TabsTrigger value="acceptance" className="text-xs">
                  ✅ Criteria
                </TabsTrigger>
                <TabsTrigger value="docs" className="text-xs">
                  📝 Docs
                </TabsTrigger>
              </TabsList>

              <div className="bg-card rounded-lg border border-border shadow-technical">
                <TabsContent value="setup" className="m-0">
                  <InspectionSetupTab 
                    data={inspectionSetup} 
                    onChange={setInspectionSetup}
                  />
                </TabsContent>

                <TabsContent value="equipment" className="m-0">
                  <EquipmentTab 
                    data={equipment} 
                    onChange={setEquipment}
                    partThickness={inspectionSetup.partThickness}
                  />
                </TabsContent>

                <TabsContent value="calibration" className="m-0 p-6">
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Calibration Tab</h3>
                    <p className="text-sm text-muted-foreground">Coming soon - Auto Calibration Recommender</p>
                  </div>
                </TabsContent>

                <TabsContent value="scan" className="m-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">Scan Parameters tab - Coming soon</p>
                  </div>
                </TabsContent>

                <TabsContent value="acceptance" className="m-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">Acceptance Criteria tab - Coming soon</p>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="m-0 p-6">
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">Documentation tab - Coming soon</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - 3D Viewer */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-card rounded-lg border border-border shadow-technical p-4">
                <h3 className="text-sm font-semibold mb-4 text-foreground">3D Part Visualization</h3>
                <div className="aspect-square">
                  <ThreeDViewer
                    partType={inspectionSetup.partType}
                    material={inspectionSetup.material}
                    dimensions={{
                      length: inspectionSetup.partLength,
                      width: inspectionSetup.partWidth,
                      thickness: inspectionSetup.partThickness,
                      diameter: inspectionSetup.diameter,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
