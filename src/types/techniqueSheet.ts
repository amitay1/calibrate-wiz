export type StandardType = "MIL-STD-2154" | "AMS-STD-2154E" | "ASTM-E-114";

export type MaterialType = "aluminum" | "steel" | "stainless_steel" | "titanium" | "magnesium" | "custom";

export type PartGeometry = 
  // Plates & Sheets
  | "plate" 
  | "sheet"
  | "slab"
  
  // Bars (solid prismatic)
  | "round_bar"
  | "square_bar"
  | "hex_bar"
  | "rectangular_bar"
  | "flat_bar"
  | "bar" // Generic fallback
  
  // Tubes & Pipes (hollow)
  | "tube"
  | "pipe"
  | "rectangular_tube"
  | "square_tube"
  
  // Disks
  | "disk"
  | "disk_forging"
  
  // Rings
  | "ring"
  | "ring_forging"
  
  // Shafts & Cylinders
  | "shaft"
  | "cylinder"
  
  // Forgings
  | "forging"
  | "round_forging_stock"
  | "rectangular_forging_stock"
  | "hub"
  | "near_net_forging"
  
  // Billets & Blocks
  | "billet"
  | "block"
  
  // Extrusions & Profiles
  | "extrusion_l"
  | "extrusion_t"
  | "extrusion_i"
  | "extrusion_u"
  | "extrusion_channel"
  | "extrusion_angle"
  | "z_section"
  | "custom_profile"
  
  // Machined Components
  | "machined_component"
  | "sphere"
  | "cone"
  
  // Sleeves & Bushings
  | "sleeve"
  | "bushing"
  
  // Custom
  | "custom";

export type AcceptanceClass = "AAA" | "AA" | "A" | "B" | "C";

export type CalibrationBlockType = "flat_block" | "curved_block" | "cylinder_notched" | "cylinder_fbh" | "angle_beam" | "iiv_block";

export interface InspectionSetupData {
  partNumber: string;
  partName: string;
  material: MaterialType | "";
  customMaterialName?: string;
  materialSpec: string;
  partType: PartGeometry | "";
  customShapeDescription?: string;
  customShapeParameters?: {
    dimension1?: { label: string; value: number };
    dimension2?: { label: string; value: number };
    dimension3?: { label: string; value: number };
    dimension4?: { label: string; value: number };
  };
  partThickness: number;
  partLength: number;
  partWidth: number;
  diameter?: number;
}

export interface EquipmentData {
  manufacturer: string;
  model: string;
  serialNumber: string;
  frequency: string;
  transducerType: string;
  transducerDiameter: number;
  couplant: string;
  verticalLinearity: number;
  horizontalLinearity: number;
  entrySurfaceResolution: number;
  backSurfaceResolution: number;
}

export interface CalibrationData {
  standardType: CalibrationBlockType | "";
  referenceMaterial: string;
  fbhSizes: string;
  metalTravelDistance: number;
  blockDimensions: string;
  blockSerialNumber: string;
  lastCalibrationDate: string;
}

export interface ScanParametersData {
  scanMethod: string;
  scanType: string;
  scanSpeed: number;
  scanIndex: number;
  coverage: number;
  scanPattern: string;
  waterPath?: number;
  pulseRepetitionRate: number;
  gainSettings: string;
  alarmGateSettings: string;
}

export interface AcceptanceCriteriaData {
  acceptanceClass: AcceptanceClass | "";
  singleDiscontinuity: string;
  multipleDiscontinuities: string;
  linearDiscontinuity: string;
  backReflectionLoss: number;
  noiseLevel: string;
  specialRequirements: string;
}

export interface DocumentationData {
  inspectorName: string;
  inspectorCertification: string;
  inspectorLevel: string;
  certifyingOrganization: string;
  inspectionDate: string;
  procedureNumber: string;
  drawingReference: string;
  revision: string;
  additionalNotes: string;
  approvalRequired: boolean;
}

export interface CalibrationRecommendation {
  standardType: string;
  referenceFigure: string;
  material: string;
  fbhSizes: string[];
  metalTravel: {
    distances: number[];
    tolerance: string;
  };
  frequency: number;
  transducerDiameter: string;
  reasoning: {
    material: string;
    blockType: string;
    fbh: string;
    frequency: string;
    travel: string;
  };
  confidence: number;
  visualization3D: {
    blockDimensions: [number, number, number];
    fbhPositions: Array<{
      size: string;
      depth: number;
      coordinates: [number, number, number];
    }>;
  };
}

export interface TechniqueSheet {
  id: string;
  standardName: StandardType;
  standardVersion: string;
  createdDate: string;
  modifiedDate: string;
  status: "draft" | "complete" | "approved";
  
  inspectionSetup: InspectionSetupData;
  equipment: EquipmentData;
  calibration: CalibrationData;
  scanParameters: ScanParametersData;
  acceptanceCriteria: AcceptanceCriteriaData;
  documentation: DocumentationData;
  
  calibrationRecommendation?: CalibrationRecommendation;
  
  metadata: {
    completionPercent: number;
    lastModifiedBy: string;
  };
}
