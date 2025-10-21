/**
 * TÜV SÜD / BYTEST Technical Card Template Type Definitions
 * Matches the structure of the 19-page TUV technical card format
 */

export interface TUVDocumentHeader {
  // Document metadata
  documentNumber: string; // e.g., "P03.00-066"
  revision: string; // e.g., "01"
  pageCount: number; // Total pages (default 19)

  // Company/Lab info
  labName: string; // e.g., "BYTEST NDI Unit"
  labLocation: string; // e.g., "Italy"
  logoImage?: string; // Base64 or URL to TUV/company logo

  // Client information
  clientName: string; // e.g., "FORGITAL FMDL"
  clientLocation: string; // e.g., "France"

  // Date information
  issueDate: string;
  effectiveDate?: string;
}

export interface TUVPartInformation {
  // Part identification
  partNumber: string; // e.g., "LFC-19009-001-200000_C"
  partName: string;
  partType: string; // e.g., "Forging"

  // Material specifications
  materialGrade: string; // e.g., "Al-7175-T74"
  materialSpec: string; // e.g., "AMS4149"
  heatTreatment?: string;

  // Dimensions
  dimensions: {
    outerDiameter?: number; // mm
    innerDiameter?: number; // mm
    height?: number; // mm
    thickness?: number; // mm
    length?: number; // mm
    width?: number; // mm
    customDimensions?: Record<string, string>;
  };

  // Part drawings
  partDrawingImage?: string; // Base64 or URL
  partDrawingReference?: string; // Drawing number
}

export interface TUVInspectionParameters {
  // Process specification
  processSpec: string; // e.g., "SAE AMS STD 2154 (Rev.E) (Jul.2021)"
  processSpecRevision: string;
  inspectionExtension: string; // e.g., "100%"
  acceptanceClass: string; // e.g., "Class A"

  // Inspection techniques
  techniques: {
    description: string; // e.g., "PE longitudinal waves 0°"
    waveType: 'longitudinal' | 'shear' | 'surface';
    angle: number; // degrees
    direction?: string; // e.g., "circumferential", "axial"
  }[];

  // Reference procedure
  referenceProcedure: string; // e.g., "PP UTI 038 Rev. 10"
}

export interface TUVScanZone {
  // Zone identification
  zoneId: string; // e.g., "A", "B", "C-C1"
  zoneName: string; // e.g., "Zone A-A1"

  // Zone location
  startAngle?: number; // For circular parts
  endAngle?: number;
  startPosition?: string; // For linear parts
  endPosition?: string;

  // Scan parameters
  scanType: string; // e.g., "PE longitudinal 0°"
  scanDirection: string; // e.g., "Circumferential, Clockwise"
  scanLength: string; // e.g., "360 degree"
  indexLength: string; // e.g., "360 mm"

  // Visual representation
  color?: string; // For colored zones in drawing
  hatchPattern?: string;
}

export interface TUVEquipmentDetails {
  // Tank/Equipment identification
  tankNumber: number; // 1, 2, etc.
  equipmentType: string; // e.g., "Ultrasonic Scanner"

  // Probe details
  probeType: string; // e.g., "PAUT", "Normal", "Angle"
  probeDescription: string; // e.g., "128ele, PAUT, 0 degree, SL NO.1551801001"
  frequency: string; // e.g., "2.25 MHz"
  manufacturer: string; // e.g., "Imasonic"
  numberOfElements: string; // e.g., "128", "1"

  // Wave parameters
  waveMode: string; // e.g., "Longitudinal", "Shear"
  velocity: number; // m/s or mm/µs

  // Scan parameters
  gain: string;
  range: string;
  pulseRepetitionFrequency?: string;
  samplingFrequency?: string;
}

export interface TUVCalibrationParameters {
  // Reference standard
  referenceStandardType: string; // e.g., "ASTM E428"
  referenceStandardDrawing?: string; // Reference to drawing (page number)

  // FBH (Flat Bottom Hole) specifications
  fbhSizes: {
    diameter: number; // mm or inches
    depth: number; // mm
    metalTravel: number; // mm
    transferValue?: number; // dB
  }[];

  // Calibration block material
  blockMaterial: string; // e.g., "Al-7175-T74"
  blockDimensions?: string;
  blockSerialNumber?: string;

  // Calibration results
  calibrationDate: string;
  calibratedBy: string;
  noiseLevel?: string; // e.g., "<5% FSH"
  backReflection?: number; // percentage
}

export interface TUVScanParameters {
  // Scanning setup
  scanCoverage: number; // percentage (e.g., 100)
  scanSpeed?: number; // mm/s
  indexResolution?: number; // mm
  scanResolution?: number; // mm

  // Water path (for immersion)
  waterPath?: number; // mm
  waterTemperature?: number; // °C

  // Detection parameters
  detectionThreshold: string; // e.g., "20% DAC"
  recordingLevel: string; // e.g., "50% DAC"
  evaluationMethod: string; // e.g., "Max amplitude"

  // Surface conditions
  surfaceCondition: string;
  surfaceRoughness?: string; // Ra value
  couplant?: string;
}

export interface TUVAcceptanceCriteria {
  // Standard
  acceptanceStandard: string; // e.g., "AMS-STD-2154E Class A"

  // Discontinuity criteria
  singleDiscontinuity: string; // e.g., "No indications >8% DAC"
  multipleDiscontinuities: string; // e.g., "No indications >5% DAC"
  linearDiscontinuity: string; // e.g., ">1/4\" not permitted"

  // Other criteria
  backReflectionLoss: string; // e.g., "6%"
  noiseLevel: string; // e.g., "<15% FSH"

  // Special requirements
  specialRequirements?: string[];
}

export interface TUVInspectionResults {
  // Overall result
  overallResult: 'ACCEPTED' | 'REJECTED' | 'CONDITIONAL' | 'PENDING';
  resultDetails: string;

  // Zone-specific results
  zoneResults: {
    zoneId: string;
    status: 'PASS' | 'FAIL' | 'REVIEW';
    indications?: {
      location: string;
      amplitude: string; // e.g., "25% DAC"
      depth: string;
      type: string; // e.g., "Porosity", "Inclusion"
    }[];
    remarks?: string;
  }[];

  // C-Scan images
  cScanImages?: {
    zoneId: string;
    imageData: string; // Base64 or URL
    colorScale?: {
      min: number;
      max: number;
      unit: string;
    };
  }[];

  // A-Scan images
  aScanImages?: {
    location: string;
    imageData: string; // Base64 or URL
  }[];
}

export interface TUVQualityData {
  // Inspector information
  inspectorName: string;
  inspectorLevel: string; // e.g., "Level 2", "Level 3"
  inspectorCertification: string;
  certificationExpiry?: string;

  // Review and approval
  reviewedBy?: string;
  reviewDate?: string;
  approvedBy?: string;
  approvalDate?: string;

  // QA stamp/signature
  qaStamp?: string; // Base64 image
}

export interface TUVRemarks {
  // General remarks
  generalRemarks: string[];

  // Technical notes
  technicalNotes?: string[];

  // Deviations
  deviations?: {
    description: string;
    justification: string;
    approvedBy: string;
  }[];

  // Attachments
  attachments?: {
    name: string;
    description: string;
    pageReference?: string;
  }[];
}

/**
 * Complete TUV Technical Card Data Structure
 * Represents all data needed for a 19-page TUV inspection report
 */
export interface TUVTechnicalCard {
  // Page 1: Header and overview
  documentHeader: TUVDocumentHeader;
  partInformation: TUVPartInformation;
  inspectionParameters: TUVInspectionParameters;

  // Page 2: Table of contents (auto-generated)
  // tableOfContents: auto-generated based on sections present

  // Pages 4-7: Part drawings and scan zones
  scanZones: TUVScanZone[];

  // Pages 8-14: Equipment and parameters
  equipment: TUVEquipmentDetails[];
  calibrationParameters: TUVCalibrationParameters;
  scanParameters: TUVScanParameters;
  acceptanceCriteria: TUVAcceptanceCriteria;

  // Pages 15: Results (optional)
  inspectionResults?: TUVInspectionResults;

  // Pages 16-17: Reference standard drawings
  referenceDrawings?: {
    title: string;
    description: string;
    drawingImage?: string; // Base64 or URL
    standard: string; // e.g., "ASTM E428"
  }[];

  // Pages 18-19: Calibration data tables and signatures
  qualityData: TUVQualityData;
  remarks: TUVRemarks;

  // Metadata
  metadata: {
    templateVersion: string; // e.g., "1.0"
    createdDate: string;
    modifiedDate: string;
    createdBy: string;
  };
}

/**
 * Helper type for mapping existing TechniqueSheet to TUV format
 */
export interface TechniqueSheetToTUVMapping {
  techniqueSheet: any; // TechniqueSheet type
  additionalData?: Partial<TUVTechnicalCard>;
}

/**
 * Export options for TUV PDF
 */
export interface TUVExportOptions {
  // PDF settings
  includeTableOfContents: boolean;
  includeScanImages: boolean;
  includeReferenceDrawings: boolean;

  // Branding
  companyLogo?: string;
  watermark?: string;

  // Language
  language: 'en' | 'it' | 'bilingual'; // English, Italian, or both

  // Page selection
  pageRange?: {
    start: number;
    end: number;
  };

  // Output format
  outputFormat: 'pdf' | 'pdf-a'; // PDF/A for archival
}
