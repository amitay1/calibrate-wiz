import { TUVTechnicalCard } from '@/types/tuvTemplate';

/**
 * Sample TUV Technical Card data for testing and demonstration
 * Based on the actual TUV technical card template (19 pages)
 */
export const sampleTUVData: TUVTechnicalCard = {
  // Page 1: Document header and overview
  documentHeader: {
    documentNumber: 'P03.00-066',
    revision: '01',
    pageCount: 19,
    labName: 'BYTEST NDI Unit',
    labLocation: 'Italy',
    clientName: 'FORGITAL FMDL',
    clientLocation: 'France',
    issueDate: '2025-01-15',
    effectiveDate: '2025-01-20',
  },

  partInformation: {
    partNumber: 'LFC-19009-001-200000_C',
    partName: 'Aerospace Forging Ring',
    partType: 'Forging',
    materialGrade: 'Al-7175-T74',
    materialSpec: 'AMS4149',
    heatTreatment: 'T74 - Solution heat treated and artificially aged',
    dimensions: {
      outerDiameter: 639.9,
      innerDiameter: 478.0,
      height: 736,
      thickness: 80.95,
    },
    partDrawingReference: 'DWG-LFC-19009-001',
  },

  inspectionParameters: {
    processSpec: 'SAE AMS STD 2154 (Rev.E) (Jul.2021)',
    processSpecRevision: 'E',
    inspectionExtension: '100%',
    acceptanceClass: 'Class A',
    techniques: [
      {
        description: 'PE longitudinal waves 0°',
        waveType: 'longitudinal',
        angle: 0,
        direction: 'circumferential',
      },
      {
        description: 'PE circumferential shear wave 45°',
        waveType: 'shear',
        angle: 45,
        direction: 'circumferential',
      },
      {
        description: 'PE axial shear wave 45°',
        waveType: 'shear',
        angle: 45,
        direction: 'axial',
      },
    ],
    referenceProcedure: 'PP UTI 038 Rev. 10',
  },

  // Pages 4-7: Scan zones
  scanZones: [
    {
      zoneId: 'A',
      zoneName: 'Zone A-A1',
      startAngle: 0,
      endAngle: 60,
      scanType: 'PE longitudinal 0°',
      scanDirection: 'Circumferential, Clockwise',
      scanLength: '360 degree',
      indexLength: '360 mm',
      color: '#FFD700', // Gold
    },
    {
      zoneId: 'B',
      zoneName: 'Zone B',
      startAngle: 60,
      endAngle: 120,
      scanType: 'PE longitudinal 0°',
      scanDirection: 'Circumferential, Clockwise',
      scanLength: '360 degree',
      indexLength: '360 mm',
      color: '#87CEEB', // Sky blue
    },
    {
      zoneId: 'C',
      zoneName: 'Zone C-C1',
      startAngle: 120,
      endAngle: 180,
      scanType: 'PE shear 45°',
      scanDirection: 'Circumferential, Clockwise',
      scanLength: '360 degree',
      indexLength: '360 mm',
      color: '#FF6347', // Tomato red
    },
    {
      zoneId: 'D',
      zoneName: 'Zone D',
      startAngle: 180,
      endAngle: 240,
      scanType: 'PE shear 45°',
      scanDirection: 'Axial',
      scanLength: '736 mm',
      indexLength: '360 degree',
      color: '#90EE90', // Light green
    },
    {
      zoneId: 'E',
      zoneName: 'Zone E',
      startAngle: 240,
      endAngle: 300,
      scanType: 'PE longitudinal 0°',
      scanDirection: 'Axial',
      scanLength: '736 mm',
      indexLength: '360 degree',
      color: '#DDA0DD', // Plum
    },
    {
      zoneId: 'F',
      zoneName: 'Zone F',
      startAngle: 300,
      endAngle: 360,
      scanType: 'PE longitudinal 0°',
      scanDirection: 'Circumferential, Counter-clockwise',
      scanLength: '360 degree',
      indexLength: '360 mm',
      color: '#F0E68C', // Khaki
    },
  ],

  // Pages 8-9: Equipment details
  equipment: [
    {
      tankNumber: 1,
      equipmentType: 'Ultrasonic Scanner - Immersion',
      probeType: 'PAUT',
      probeDescription: '128ele, PAUT, 0 degree, SL NO.1551801001',
      frequency: '2.25 MHz',
      manufacturer: 'Imasonic',
      numberOfElements: '128',
      waveMode: 'Longitudinal',
      velocity: 6320, // m/s for aluminum
      gain: '18 dB',
      range: '0-200 mm',
      pulseRepetitionFrequency: '2000 Hz',
      samplingFrequency: '100 MHz',
    },
    {
      tankNumber: 2,
      equipmentType: 'Ultrasonic Scanner - Immersion',
      probeType: 'Angle',
      probeDescription: 'Single element, Angle 45°, 2 MHz, SL NO.1234567',
      frequency: '2.0 MHz',
      manufacturer: 'GE Inspection',
      numberOfElements: '1',
      waveMode: 'Shear',
      velocity: 3130, // m/s shear wave in aluminum
      gain: '24 dB',
      range: '0-150 mm',
    },
  ],

  // Pages 10-11: Calibration parameters
  calibrationParameters: {
    referenceStandardType: 'ASTM E428',
    referenceStandardDrawing: 'See Page 16-17',
    fbhSizes: [
      {
        diameter: 1.19, // 3/64" = 1.19mm
        depth: 25,
        metalTravel: 75,
        transferValue: 14.2,
      },
      {
        diameter: 1.98, // 5/64" = 1.98mm
        depth: 50,
        metalTravel: 150,
        transferValue: 18.5,
      },
      {
        diameter: 3.18, // 8/64" = 3.18mm
        depth: 75,
        metalTravel: 225,
        transferValue: 22.1,
      },
    ],
    blockMaterial: 'Al-7175-T74 (AMS4149)',
    blockDimensions: '100mm × 100mm × 100mm',
    blockSerialNumber: 'CAL-BLOCK-AL7175-001',
    calibrationDate: '2025-01-10',
    calibratedBy: 'John Smith - Level 3',
    noiseLevel: '<5% FSH',
    backReflection: 98,
  },

  // Pages 12-13: Scan parameters
  scanParameters: {
    scanCoverage: 100,
    scanSpeed: 150, // mm/s
    indexResolution: 0.5, // mm
    scanResolution: 0.5, // mm
    waterPath: 50, // mm
    waterTemperature: 22, // °C
    detectionThreshold: '20% DAC',
    recordingLevel: '50% DAC',
    evaluationMethod: 'Max amplitude in gate',
    surfaceCondition: 'Machined - as received',
    surfaceRoughness: '3.2 µm',
    couplant: 'Water (distilled, deionized)',
  },

  // Pages 14-15: Acceptance criteria
  acceptanceCriteria: {
    acceptanceStandard: 'SAE AMS STD 2154 Rev.E - Class A',
    singleDiscontinuity: 'No indications >8% DAC',
    multipleDiscontinuities: 'No indications >5% DAC in any 6.45 cm² area',
    linearDiscontinuity: 'Linear indications >1/4" (6.35mm) not permitted',
    backReflectionLoss: '6%',
    noiseLevel: '<15% FSH (Full Screen Height)',
    specialRequirements: [
      'All indications >5% DAC shall be recorded and evaluated',
      'Cluster indications: 3 or more indications within 6.45 cm² area to be reported',
      'Edge effects within 12.7mm from part edges shall be documented',
      'Temperature variation during scan shall not exceed ±2°C',
    ],
  },

  // Pages 16-17: Reference drawings
  referenceDrawings: [
    {
      title: 'ASTM E428 Reference Block - Longitudinal Waves',
      description: 'Flat bottom hole reference standard for distance amplitude correction',
      standard: 'ASTM E428-08(2019)',
    },
    {
      title: 'Custom Reference Block - Shear Waves 45°',
      description: 'Side-drilled holes for angle beam calibration',
      standard: 'Based on ISO 2400',
    },
  ],

  // Pages 18-19: Quality data and remarks
  qualityData: {
    inspectorName: 'John Smith',
    inspectorLevel: 'Level 3',
    inspectorCertification: 'ASNT UT Level 3 - Cert# UT-L3-2024-1234',
    certificationExpiry: '2026-12-31',
    reviewedBy: 'Jane Doe - Level 3',
    reviewDate: '2025-01-16',
    approvedBy: 'Michael Johnson - QA Manager',
    approvalDate: '2025-01-17',
  },

  remarks: {
    generalRemarks: [
      'Inspection performed in accordance with procedure PP UTI 038 Rev. 10',
      'All equipment calibrated and verified prior to inspection',
      'Surface conditions met requirements - no additional preparation needed',
      'Environmental conditions: Temperature 21-23°C, Humidity 45-55%',
    ],
    technicalNotes: [
      'Water temperature maintained at 22±1°C throughout inspection',
      'Calibration verified every 4 hours and after any equipment adjustment',
      'No geometric limitations encountered during scanning',
      'Back reflection maintained >95% throughout inspection',
    ],
    deviations: [],
    attachments: [
      {
        name: 'C-Scan Images',
        description: 'Complete C-Scan data for all zones',
        pageReference: 'Separate file',
      },
      {
        name: 'Equipment Calibration Certificates',
        description: 'Valid calibration certificates for all UT equipment',
        pageReference: 'Attached',
      },
    ],
  },

  metadata: {
    templateVersion: '1.0',
    createdDate: '2025-01-15',
    modifiedDate: '2025-01-17',
    createdBy: 'Calibrate-Wiz System v1.0',
  },
};

/**
 * Generate sample data with custom values
 */
export const generateSampleTUVData = (
  overrides?: Partial<TUVTechnicalCard>
): TUVTechnicalCard => {
  return {
    ...sampleTUVData,
    ...overrides,
  };
};

/**
 * Sample minimal TUV data for quick testing
 */
export const minimalTUVData: TUVTechnicalCard = {
  documentHeader: {
    documentNumber: 'TEST-001',
    revision: '00',
    pageCount: 19,
    labName: 'Test Laboratory',
    labLocation: 'USA',
    clientName: 'Test Client Inc.',
    clientLocation: 'California',
    issueDate: new Date().toISOString().split('T')[0],
  },

  partInformation: {
    partNumber: 'TEST-PART-001',
    partName: 'Test Part',
    partType: 'Test',
    materialGrade: 'Test Material',
    materialSpec: 'TEST-SPEC',
    dimensions: {},
  },

  inspectionParameters: {
    processSpec: 'Test Specification',
    processSpecRevision: '1.0',
    inspectionExtension: '100%',
    acceptanceClass: 'Class A',
    techniques: [
      {
        description: 'Longitudinal wave 0°',
        waveType: 'longitudinal',
        angle: 0,
      },
    ],
    referenceProcedure: 'TEST-PROC-001',
  },

  scanZones: [],

  equipment: [
    {
      tankNumber: 1,
      equipmentType: 'Test Equipment',
      probeType: 'Test Probe',
      probeDescription: 'Test probe description',
      frequency: '5.0 MHz',
      manufacturer: 'Test Manufacturer',
      numberOfElements: '1',
      waveMode: 'Longitudinal',
      velocity: 5900,
      gain: '20 dB',
      range: '0-100 mm',
    },
  ],

  calibrationParameters: {
    referenceStandardType: 'Test Standard',
    fbhSizes: [],
    blockMaterial: 'Test Material',
    calibrationDate: new Date().toISOString().split('T')[0],
    calibratedBy: 'Test Technician',
  },

  scanParameters: {
    scanCoverage: 100,
    detectionThreshold: '20% DAC',
    recordingLevel: '50% DAC',
    evaluationMethod: 'Max amplitude',
    surfaceCondition: 'As received',
  },

  acceptanceCriteria: {
    acceptanceStandard: 'Test Standard',
    singleDiscontinuity: 'Test criteria',
    multipleDiscontinuities: 'Test criteria',
    linearDiscontinuity: 'Test criteria',
    backReflectionLoss: '5%',
    noiseLevel: '<10% FSH',
  },

  qualityData: {
    inspectorName: 'Test Inspector',
    inspectorLevel: 'Level 2',
    inspectorCertification: 'TEST-CERT-001',
  },

  remarks: {
    generalRemarks: ['Test remark'],
  },

  metadata: {
    templateVersion: '1.0',
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    createdBy: 'Calibrate-Wiz',
  },
};
