import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardSelector } from "@/components/StandardSelector";
import { ProgressHeader } from "@/components/ProgressHeader";
import { InspectionSetupTab } from "@/components/tabs/InspectionSetupTab";
import { EquipmentTab } from "@/components/tabs/EquipmentTab";
import { CalibrationTab } from "@/components/tabs/CalibrationTab";
import { ScanParametersTab } from "@/components/tabs/ScanParametersTab";
import { AcceptanceCriteriaTab } from "@/components/tabs/AcceptanceCriteriaTab";
import { DocumentationTab } from "@/components/tabs/DocumentationTab";
import { ThreeDViewer } from "@/components/ThreeDViewer";
import { Button } from "@/components/ui/button";
import { Save, FileDown, CheckCircle2, Target } from "lucide-react";
import { 
  StandardType, 
  InspectionSetupData, 
  EquipmentData, 
  CalibrationData,
  ScanParametersData,
  AcceptanceCriteriaData,
  DocumentationData,
  MaterialType
} from "@/types/techniqueSheet";
import { toast } from "sonner";
import { standardRules, getRecommendedFrequency, getCouplantRecommendation, calculateMetalTravel } from "@/utils/autoFillLogic";

const Index = () => {
  const [standard, setStandard] = useState<StandardType>("AMS-STD-2154E");
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

  const [calibration, setCalibration] = useState<CalibrationData>({
    standardType: "",
    referenceMaterial: "",
    fbhSizes: "",
    metalTravelDistance: 0,
    blockDimensions: "",
    blockSerialNumber: "",
    lastCalibrationDate: "",
  });

  const [scanParameters, setScanParameters] = useState<ScanParametersData>({
    scanMethod: "",
    scanType: "",
    scanSpeed: 100,
    scanIndex: 70,
    coverage: 100,
    scanPattern: "",
    waterPath: 0,
    pulseRepetitionRate: 1000,
    gainSettings: "",
    alarmGateSettings: "",
  });

  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriteriaData>({
    acceptanceClass: "",
    singleDiscontinuity: "",
    multipleDiscontinuities: "",
    linearDiscontinuity: "",
    backReflectionLoss: 50,
    noiseLevel: "",
    specialRequirements: "",
  });

  const [documentation, setDocumentation] = useState<DocumentationData>({
    inspectorName: "",
    inspectorCertification: "",
    inspectorLevel: "",
    certifyingOrganization: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    procedureNumber: "",
    drawingReference: "",
    revision: "A",
    additionalNotes: "",
    approvalRequired: false,
  });
  
  // Auto-fill logic when standard changes
  useEffect(() => {
    if (standard && standardRules[standard]) {
      const rules = standardRules[standard];
      // Auto-set acceptance class based on standard
      setAcceptanceCriteria(prev => ({
        ...prev,
        acceptanceClass: prev.acceptanceClass || rules.defaultAcceptanceClass
      }));
      // Auto-set coverage
      setScanParameters(prev => ({
        ...prev,
        coverage: prev.coverage === 100 ? rules.scanCoverageDefault : prev.coverage
      }));
    }
  }, [standard]);
  
  // Auto-fill logic when material changes
  useEffect(() => {
    if (inspectionSetup.material && inspectionSetup.partThickness) {
      const recommendedFreq = getRecommendedFrequency(
        inspectionSetup.partThickness, 
        inspectionSetup.material as MaterialType
      );
      
      // Auto-set frequency if not manually changed
      if (equipment.frequency === "5.0" || !equipment.frequency) {
        setEquipment(prev => ({
          ...prev,
          frequency: recommendedFreq
        }));
      }
      
      // Auto-set metal travel distance in calibration
      const metalTravel = calculateMetalTravel(inspectionSetup.partThickness);
      setCalibration(prev => ({
        ...prev,
        metalTravelDistance: prev.metalTravelDistance === 0 ? metalTravel : prev.metalTravelDistance
      }));
    }
  }, [inspectionSetup.material, inspectionSetup.partThickness, equipment.frequency]);
  
  // Auto-fill couplant when transducer type changes
  useEffect(() => {
    if (equipment.transducerType && inspectionSetup.material) {
      const recommendedCouplant = getCouplantRecommendation(
        equipment.transducerType,
        inspectionSetup.material as MaterialType
      );
      
      setEquipment(prev => ({
        ...prev,
        couplant: prev.couplant || recommendedCouplant
      }));
    }
  }, [equipment.transducerType, inspectionSetup.material]);

  // Auto-save to localStorage
  useEffect(() => {
    const data = {
      standard,
      inspectionSetup,
      equipment,
      calibration,
      scanParameters,
      acceptanceCriteria,
      documentation,
    };
    localStorage.setItem("techniqueSheet", JSON.stringify(data));
  }, [standard, inspectionSetup, equipment, calibration, scanParameters, acceptanceCriteria, documentation]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("techniqueSheet");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStandard(data.standard || "MIL-STD-2154");
        setInspectionSetup(data.inspectionSetup || inspectionSetup);
        setEquipment(data.equipment || equipment);
        setCalibration(data.calibration || calibration);
        setScanParameters(data.scanParameters || scanParameters);
        setAcceptanceCriteria(data.acceptanceCriteria || acceptanceCriteria);
        setDocumentation(data.documentation || documentation);
        toast.success("Loaded saved technique sheet");
      } catch (error) {
        console.error("Failed to load saved data", error);
      }
    }
  }, []);

  // Calculate completion
  const calculateCompletion = () => {
    let completed = 0;
    let total = 35; // Approximate total required fields across all tabs

    // Inspection Setup (6 fields)
    if (inspectionSetup.partNumber) completed++;
    if (inspectionSetup.partName) completed++;
    if (inspectionSetup.material) completed++;
    if (inspectionSetup.materialSpec) completed++;
    if (inspectionSetup.partType) completed++;
    if (inspectionSetup.partThickness >= 6.35) completed++;
    
    // Equipment (8 fields)
    if (equipment.manufacturer) completed++;
    if (equipment.model) completed++;
    if (equipment.frequency) completed++;
    if (equipment.transducerType) completed++;
    if (equipment.couplant) completed++;
    if (equipment.verticalLinearity) completed++;
    if (equipment.horizontalLinearity) completed++;
    if (equipment.transducerDiameter) completed++;

    // Calibration (4 fields)
    if (calibration.standardType) completed++;
    if (calibration.referenceMaterial) completed++;
    if (calibration.fbhSizes) completed++;
    if (calibration.metalTravelDistance) completed++;

    // Scan Parameters (6 fields)
    if (scanParameters.scanMethod) completed++;
    if (scanParameters.scanType) completed++;
    if (scanParameters.scanSpeed) completed++;
    if (scanParameters.scanIndex) completed++;
    if (scanParameters.coverage) completed++;
    if (scanParameters.scanPattern) completed++;

    // Acceptance Criteria (6 fields)
    if (acceptanceCriteria.acceptanceClass) completed++;
    if (acceptanceCriteria.singleDiscontinuity) completed++;
    if (acceptanceCriteria.multipleDiscontinuities) completed++;
    if (acceptanceCriteria.linearDiscontinuity) completed++;
    if (acceptanceCriteria.backReflectionLoss) completed++;
    if (acceptanceCriteria.noiseLevel) completed++;

    // Documentation (5 fields)
    if (documentation.inspectorName) completed++;
    if (documentation.inspectorCertification) completed++;
    if (documentation.inspectorLevel) completed++;
    if (documentation.inspectionDate) completed++;
    if (documentation.revision) completed++;

    return { completed, total, percent: (completed / total) * 100 };
  };

  const completion = calculateCompletion();

  const handleSave = () => {
    toast.success("Technique sheet saved successfully!");
  };

  const handleExportPDF = () => {
    toast.info("PDF export coming soon!");
  };

  const handleValidate = () => {
    const missing = [];
    if (!inspectionSetup.partNumber) missing.push("Part Number");
    if (!equipment.manufacturer) missing.push("Equipment Manufacturer");
    if (!calibration.standardType) missing.push("Calibration Standard");
    if (!acceptanceCriteria.acceptanceClass) missing.push("Acceptance Class");
    if (!documentation.inspectorName) missing.push("Inspector Name");

    if (missing.length > 0) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
    } else {
      toast.success("All required fields complete! ✓");
    }
  };

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
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button size="sm" className="gradient-primary" onClick={handleValidate}>
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

                <TabsContent value="calibration" className="m-0">
                  <CalibrationTab
                    data={calibration}
                    onChange={setCalibration}
                    inspectionSetup={inspectionSetup}
                    acceptanceClass={acceptanceCriteria.acceptanceClass}
                  />
                </TabsContent>

                <TabsContent value="scan" className="m-0">
                  <ScanParametersTab
                    data={scanParameters}
                    onChange={setScanParameters}
                    standard={standard}
                  />
                </TabsContent>

                <TabsContent value="acceptance" className="m-0">
                  <AcceptanceCriteriaTab
                    data={acceptanceCriteria}
                    onChange={setAcceptanceCriteria}
                    material={inspectionSetup.materialSpec || inspectionSetup.material}
                    standard={standard}
                  />
                </TabsContent>

                <TabsContent value="docs" className="m-0">
                  <DocumentationTab
                    data={documentation}
                    onChange={setDocumentation}
                  />
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
