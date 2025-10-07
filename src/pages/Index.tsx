import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardSelector } from "@/components/StandardSelector";
import { ThreeDViewer } from "@/components/ThreeDViewer";
import { MenuBar } from "@/components/MenuBar";
import { Toolbar } from "@/components/Toolbar";
import { StatusBar } from "@/components/StatusBar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InspectionSetupTab } from "@/components/tabs/InspectionSetupTab";
import { EquipmentTab } from "@/components/tabs/EquipmentTab";
import { CalibrationTab } from "@/components/tabs/CalibrationTab";
import { ScanParametersTab } from "@/components/tabs/ScanParametersTab";
import { AcceptanceCriteriaTab } from "@/components/tabs/AcceptanceCriteriaTab";
import { DocumentationTab } from "@/components/tabs/DocumentationTab";
import { CoverPageTab } from "@/components/tabs/CoverPageTab";
import { PartDiagramTab } from "@/components/tabs/PartDiagramTab";
import { ProbeDetailsTab } from "@/components/tabs/ProbeDetailsTab";
import { ScansTab } from "@/components/tabs/ScansTab";
import { RemarksTab } from "@/components/tabs/RemarksTab";
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
import { InspectionReportData } from "@/types/inspectionReport";
import { standardRules, getRecommendedFrequency, getCouplantRecommendation, calculateMetalTravel } from "@/utils/autoFillLogic";
import { exportTechniqueSheetToPDF } from "@/utils/techniqueSheetExport";
import { exportInspectionReportToPDF } from "@/utils/inspectionReportExport";

const Index = () => {
  const [standard, setStandard] = useState<StandardType>("AMS-STD-2154E");
  const [activeTab, setActiveTab] = useState("setup");
  const [reportMode, setReportMode] = useState<"Technique" | "Report">("Technique");
  
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

  const [inspectionReport, setInspectionReport] = useState<InspectionReportData>({
    documentNo: "",
    currentRevision: "0",
    revisionDate: new Date().toISOString().split('T')[0],
    customerName: "",
    poNumber: "",
    itemDescription: "",
    materialGrade: "",
    workOrderNumber: "",
    poSerialNumber: "",
    quantity: "01 no",
    samplePoSlNo: "",
    sampleSerialNo: "01",
    sampleQuantity: "01 No",
    thickness: "",
    typeOfScan: "Ring scan",
    testingEquipment: "",
    tcgApplied: "Yes",
    testStandard: "",
    observations: "",
    results: "Accepted",
    approvedBy: "",
    partDiagramImage: undefined,
    probeDetails: [],
    scans: [],
    remarks: [],
  });
  
  // Auto-fill logic when standard changes
  useEffect(() => {
    if (standard && standardRules[standard]) {
      const rules = standardRules[standard];
      setAcceptanceCriteria(prev => ({
        ...prev,
        acceptanceClass: prev.acceptanceClass || rules.defaultAcceptanceClass
      }));
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
      
      if (equipment.frequency === "5.0" || !equipment.frequency) {
        setEquipment(prev => ({
          ...prev,
          frequency: recommendedFreq
        }));
      }
      
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
        setStandard(data.standard || "AMS-STD-2154E");
        setInspectionSetup(data.inspectionSetup || inspectionSetup);
        setEquipment(data.equipment || equipment);
        setCalibration(data.calibration || calibration);
        setScanParameters(data.scanParameters || scanParameters);
        setAcceptanceCriteria(data.acceptanceCriteria || acceptanceCriteria);
        setDocumentation(data.documentation || documentation);
      } catch (error) {
        console.error("Failed to load saved data", error);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'e':
            e.preventDefault();
            handleExportPDF();
            break;
          case 'n':
            e.preventDefault();
            handleNewProject();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [inspectionSetup, equipment, calibration, scanParameters, acceptanceCriteria, documentation, inspectionReport, reportMode]);

  // Calculate completion
  const calculateCompletion = () => {
    let completed = 0;
    let total = 35;

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
    if (equipment.verticalLinearity) completed++;
    if (equipment.horizontalLinearity) completed++;
    if (equipment.transducerDiameter) completed++;

    if (calibration.standardType) completed++;
    if (calibration.referenceMaterial) completed++;
    if (calibration.fbhSizes) completed++;
    if (calibration.metalTravelDistance) completed++;

    if (scanParameters.scanMethod) completed++;
    if (scanParameters.scanType) completed++;
    if (scanParameters.scanSpeed) completed++;
    if (scanParameters.scanIndex) completed++;
    if (scanParameters.coverage) completed++;
    if (scanParameters.scanPattern) completed++;

    if (acceptanceCriteria.acceptanceClass) completed++;
    if (acceptanceCriteria.singleDiscontinuity) completed++;
    if (acceptanceCriteria.multipleDiscontinuities) completed++;
    if (acceptanceCriteria.linearDiscontinuity) completed++;
    if (acceptanceCriteria.backReflectionLoss) completed++;
    if (acceptanceCriteria.noiseLevel) completed++;

    if (documentation.inspectorName) completed++;
    if (documentation.inspectorCertification) completed++;
    if (documentation.inspectorLevel) completed++;
    if (documentation.inspectionDate) completed++;
    if (documentation.revision) completed++;

    return (completed / total) * 100;
  };

  const handleNewProject = () => {
    if (confirm('Start a new project? Unsaved changes will be lost.')) {
      window.location.reload();
    }
  };

  const handleSave = () => {
    toast.success("Technique sheet saved successfully!");
  };

  const handleExportPDF = () => {
    try {
      if (reportMode === "Technique") {
        exportTechniqueSheetToPDF({
          standard,
          inspectionSetup,
          equipment,
          calibration,
          scanParameters,
          acceptanceCriteria,
          documentation,
        });
        toast.success("Technique Sheet PDF exported successfully!");
      } else {
        exportInspectionReportToPDF(inspectionReport);
        toast.success("Inspection Report PDF exported successfully!");
      }
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    }
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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Menu Bar */}
      <MenuBar 
        onSave={handleSave}
        onExport={handleExportPDF}
        onNew={handleNewProject}
      />

      {/* Toolbar */}
      <Toolbar
        onSave={handleSave}
        onExport={handleExportPDF}
        onValidate={handleValidate}
        reportMode={reportMode}
        onReportModeChange={setReportMode}
      />

      {/* Main Content Area with Resizable Panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel: Tools & Standard Selector */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={20}>
          <div className="h-full app-panel flex flex-col">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold text-sm mb-3">Standard</h3>
              <StandardSelector 
                value={standard} 
                onChange={setStandard} 
              />
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">COMPLETION</h4>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(calculateCompletion())}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      const completion = calculateCompletion();
                      const totalFields = reportMode === "Technique" ? 50 : 40;
                      return Math.round((completion / 100) * totalFields);
                    })()}/{reportMode === "Technique" ? 50 : 40} fields
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel: Main Form */}
        <ResizablePanel defaultSize={55} minSize={40}>
          <ScrollArea className="h-full">
            <div className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {reportMode === "Technique" ? (
                  <>
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 bg-muted p-1 rounded-md">
                      <TabsTrigger value="setup" className="text-xs">Setup</TabsTrigger>
                      <TabsTrigger value="equipment" className="text-xs">Equipment</TabsTrigger>
                      <TabsTrigger value="calibration" className="text-xs">Calibration</TabsTrigger>
                      <TabsTrigger value="scan" className="text-xs">Scan Params</TabsTrigger>
                      <TabsTrigger value="acceptance" className="text-xs">Acceptance</TabsTrigger>
                      <TabsTrigger value="docs" className="text-xs">Documentation</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 app-panel rounded-md">
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
                  </>
                ) : (
                  <>
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 gap-1 bg-muted p-1 rounded-md">
                      <TabsTrigger value="cover" className="text-xs">Cover Page</TabsTrigger>
                      <TabsTrigger value="diagram" className="text-xs">Part Diagram</TabsTrigger>
                      <TabsTrigger value="probe" className="text-xs">Probe Details</TabsTrigger>
                      <TabsTrigger value="scans" className="text-xs">Scans</TabsTrigger>
                      <TabsTrigger value="remarks" className="text-xs">Remarks</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 app-panel rounded-md">
                      <TabsContent value="cover" className="m-0">
                        <CoverPageTab 
                          data={inspectionReport} 
                          onChange={(data) => setInspectionReport({ ...inspectionReport, ...data })}
                        />
                      </TabsContent>

                      <TabsContent value="diagram" className="m-0">
                        <PartDiagramTab 
                          partDiagramImage={inspectionReport.partDiagramImage}
                          onChange={(image) => setInspectionReport({ ...inspectionReport, partDiagramImage: image })}
                          partType={inspectionSetup.partType}
                          thickness={inspectionSetup.partThickness.toString()}
                          diameter={inspectionSetup.diameter?.toString()}
                          length={inspectionSetup.partLength.toString()}
                        />
                      </TabsContent>

                      <TabsContent value="probe" className="m-0">
                        <ProbeDetailsTab 
                          probeDetails={inspectionReport.probeDetails}
                          onChange={(probes) => setInspectionReport({ ...inspectionReport, probeDetails: probes })}
                        />
                      </TabsContent>

                      <TabsContent value="scans" className="m-0">
                        <ScansTab 
                          scans={inspectionReport.scans}
                          onChange={(scans) => setInspectionReport({ ...inspectionReport, scans })}
                        />
                      </TabsContent>

                      <TabsContent value="remarks" className="m-0">
                        <RemarksTab 
                          remarks={inspectionReport.remarks}
                          onChange={(remarks) => setInspectionReport({ ...inspectionReport, remarks })}
                        />
                      </TabsContent>
                    </div>
                  </>
                )}
              </Tabs>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: 3D Viewer */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <div className="h-full app-panel">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold text-sm">3D Part Viewer</h3>
            </div>
            <ThreeDViewer
              partType={inspectionSetup.partType || ""}
              material={inspectionSetup.material as MaterialType || ""}
              dimensions={{
                length: inspectionSetup.partLength || 100,
                width: inspectionSetup.partWidth || 50,
                thickness: inspectionSetup.partThickness || 10,
                diameter: inspectionSetup.diameter || 50
              }}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Status Bar */}
      <StatusBar
        completionPercent={calculateCompletion()}
        requiredFieldsComplete={(() => {
          const completion = calculateCompletion();
          const totalFields = reportMode === "Technique" ? 50 : 40;
          return Math.round((completion / 100) * totalFields);
        })()}
        totalRequiredFields={reportMode === "Technique" ? 50 : 40}
      />
    </div>
  );
};

export default Index;
