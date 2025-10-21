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
  partName: string; // Denominazione/Denomination (e.g., "Forging", "Forging cone")
  partType: string; // e.g., "Forging"

  // Criticality classification
  criticityClass?: string; // Classe criticità / Criticity class

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

  // Inspection type
  inspectionType: string; // Tipo ispezione / Inspection type (e.g., "I (Immersione)" / "I (Immersion)")

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
  equipmentPlant: string; // Impianto UT / UT Plant (e.g., "ISO 005 (ID 00489)")
  equipmentPlantId?: string; // ID (e.g., "00489")

  // Instrument details
  instrument: string; // Strumento UT / UT instrument (e.g., "GE USN60 (ID 00931)")
  instrumentId?: string; // ID (e.g., "00931")

  // Probe details
  probes: {
    probeNumber: number; // 1, 2, etc. for multiple probes
    probeType: string; // Type (e.g., "PANAMETRICS V309")
    probeId?: string; // ID (e.g., "ID:00485")
    frequency: string; // Frequency (e.g., "5 Mhz", "10 Mhz")
    focusing?: string; // Focalizzazione/Focusing (e.g., "8\"", "---")
    angle: number; // Angle in degrees (e.g., 0, 45)
    ebw?: string; // EBW -6dB (e.g., "6mm", "3mm")
  }[];

  // Accessories
  accessories?: string[]; // e.g., ["PORTACAMPIONI / TEST BLOCK HANGER (ID 489-M1)", "PORTAPEZZO / PART HANGER (ID489-M2)"]

  // Wave parameters (kept for backward compatibility)
  waveMode?: string; // e.g., "Longitudinal", "Shear"
  velocity?: number; // m/s or mm/µs

  // Scan parameters (kept for backward compatibility)
  gain?: string;
  range?: string;
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
  // Tank-specific parameters (from Tables 3 & 4)
  tankNumber: number; // 1 or 2

  // Couplant
  couplant: string; // Accoppiante / Couplant (e.g., "Acqua + W4-US" / "Water + W4-US")

  // Pulser parameters
  pulserParameters: {
    voltage: string; // e.g., "300V"
    waveform: string; // e.g., "SQUARE"
    pulseWidth: string; // e.g., "90ns", "110ns"
    damping: string; // e.g., "150", "150Ω"
  }[];

  // Water path
  waterPath: number[]; // mm (array for multiple probes, e.g., [140, 60])
  waterTemperature?: number; // °C

  // Threshold and PRF
  reject: string; // Soglia / Reject (e.g., "0%")
  prf: string; // PRF (e.g., "AUTO")

  // Filter
  filter: string[]; // Filtro / Filter (e.g., ["5 Mhz", "10 Mhz"])

  // Material velocity
  velocity: number[]; // Velocità materiale / Velocity (e.g., [6300, 3050] m/s)

  // Gain
  dB: string[]; // dB settings (e.g., ["58.0 dB", "57.0 dB"])

  // Indexing
  indexing: string[]; // Index resolution (e.g., ["2mm", "1mm"])

  // Gates
  gateIF: {
    gateNumber: number; // 1 or 2
    start: string; // Start position (e.g., "135mm")
    length: string; // Length (e.g., "10mm")
    level: string; // Level (e.g., "90%")
  }[];

  // TCG Mode
  tcgMode: boolean; // ON/OFF
  tcgReferenceLevel?: string; // Reference level (e.g., "80% FSH")

  // BEA Mode
  beaMode: boolean; // ON/OFF
  beaModeDescription?: string; // e.g., "BEA Mode on BWE"

  // Individual scan parameters
  scans: {
    scanId: string; // Scan ID/no. (e.g., "B", "D", "E", "F")
    probeNumber: number; // Which probe (1 or 2)
    range: string; // Campo di lavoro / Range (e.g., "95mm")
    axesSpeed: number; // Velocità assi / Axes speed (%) (e.g., 50)
    indexing: string; // Indice di acquisizione / Indexing (e.g., "2mm", "1mm", "gradi")
    curvatureCorrection?: string; // Correz. per curvatura / Curvature correction (dB)
    gate1: string; // Gate 1 settings (Inizio-Lungh.-Liv.) (e.g., "3-77,5-80%")
    gate2?: string; // Gate 2 settings (e.g., "80,5-10-45%")
    scanFile: string; // File percorso / Scanning file (e.g., "P03.00TS066RS00 POSB")
  }[];

  // Scanning setup (kept for backward compatibility)
  scanCoverage?: number; // percentage (e.g., 100)
  scanSpeed?: number; // mm/s
  indexResolution?: number; // mm
  scanResolution?: number; // mm

  // Detection parameters (kept for backward compatibility)
  detectionThreshold?: string; // e.g., "20% DAC"
  recordingLevel?: string; // e.g., "50% DAC"
  evaluationMethod?: string; // e.g., "Max amplitude"

  // Surface conditions (kept for backward compatibility)
  surfaceCondition?: string;
  surfaceRoughness?: string; // Ra value
}

export interface TUVAcceptanceCriteria {
  // Standard
  acceptanceStandard: string; // e.g., "AMS-STD-2154E Class A"

  // Discontinuity criteria (from Table 6)
  singleDiscontinuity: string; // Discontinuità singola-Ampiezza / Single discontinuity - Amplitude (e.g., "5/64\"")
  singleDiscontinuityNote?: string; // Note 1/6/7 details

  multipleDiscontinuities: string; // Discontinuità multiple-Ampiezza / Multiple discontinuities - Amplitude (e.g., "3/64\"")
  multipleDiscontinuitiesNote?: string; // Note 2/5/7 details

  linearDiscontinuity: string; // Discont. Lineari-Lunghezza e Ampiezza / Linear discontinuities - Length and Amplitude (e.g., "12,7 mm e 3/64\"")
  linearDiscontinuityNote?: string; // Note 3/7 details

  // Other criteria
  backReflectionLoss: string; // Perdita dell'eco di fondo-Percentuale / Loss of back reflection (e.g., "50%")
  backReflectionLossNote?: string; // Note 4 details

  noiseLevel: string; // Rumore / Noise (e.g., "Livello di registrazione" / "Recording level")

  // Detailed notes (1-7 from Table 6)
  criteriaNotes?: {
    note1?: string; // Single discontinuity criteria details
    note2?: string; // Multiple discontinuity criteria details
    note3?: string; // Linear discontinuity criteria details
    note4?: string; // Back reflection loss criteria details
    note5?: string; // Class-specific multiple discontinuity separation
    note6?: string; // Class-specific single discontinuity details
    note7?: string; // Class-specific linear and multiple discontinuity details
  };

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

export interface TUVSurfaceResolution {
  // Surface resolution requirements (from Table 5)
  scans: string; // Scansione / Scan (e.g., "A1,B,C1,D,B1,D1,A2,C2")
  minimumResolutionBeamEntry: number; // Minima risoluzione lato interfaccia / Minimum surface resolution beam entry side (mm)
  minimumResolutionBackwall: number; // Minima risoluzione superficiale lato fondo / Minimum surface resolution backwall side (mm)
}

export interface TUVRevisionHistory {
  // Revision details (from page 3 - Descrizione Revisioni)
  revision: string; // Revisione / Revision (e.g., "0", "1")
  description: string; // Descrizione Modifica / Modification Description
  paragraph?: string; // Paragrafo / Paragraph
  page?: string; // Pagina / Page
  preparedBy?: string; // Prepared
  checkedBy?: string; // Checked
  approvedBy?: string; // Approved
  date?: string; // Date
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

  // Page 3: Revision history
  revisionHistory?: TUVRevisionHistory[];

  // Pages 4-7: Part drawings and scan zones
  scanZones: TUVScanZone[];

  // Pages 8-14: Equipment and parameters
  equipment: TUVEquipmentDetails[];
  calibrationParameters: TUVCalibrationParameters;
  scanParameters: TUVScanParameters[]; // Array for multiple tanks
  surfaceResolution?: TUVSurfaceResolution[]; // Table 5
  acceptanceCriteria: TUVAcceptanceCriteria;

  // Pages 15: Results (optional)
  inspectionResults?: TUVInspectionResults;

  // Pages 16-17: Reference standard drawings
  referenceDrawings?: {
    title: string;
    description: string;
    drawingImage?: string; // Base64 or URL
    standard: string; // e.g., "ASTM E428"
    identificationNumber?: string; // S/N (e.g., "S/N DA 11-8055 A 11-8076")
    fabricationIdentification?: string;
    material?: string; // e.g., "7075"
    thickness?: string;
    defectTypology?: string; // e.g., "FBH"
    limitations?: string;
    notes?: string;
  }[];

  // Pages 18-19: Calibration data tables and signatures
  calibrationData?: {
    tankNumber: number;
    tcgNumber: number; // TCG 1 or TCG 2
    probe: string;
    waterPath: string;
    scanIds: string; // For Scan ID/no
    fbhData: {
      fbhSize: string; // FBH (x 1/64 in)
      mtd: string; // MTD (in / mm)
      response: string; // RESPONSE (% SCALE)
    }[];
  }[];

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
