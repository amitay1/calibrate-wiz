import { MaterialType, PartGeometry, StandardType, AcceptanceClass } from "@/types/techniqueSheet";

// Material properties database
interface MaterialProperties {
  velocity: number; // mm/µs (longitudinal wave)
  velocityShear: number; // mm/µs (shear wave)
  acousticImpedance: number; // MRayls
  attenuation: number; // dB/m at 5MHz
  density: number; // g/cm³
  surfaceCondition: string;
  typicalSpecs: string[];
}

export const materialDatabase: Record<MaterialType, MaterialProperties> = {
  aluminum: {
    velocity: 6.32,
    velocityShear: 3.08,
    acousticImpedance: 17.0,
    attenuation: 1.5,
    density: 2.7,
    surfaceCondition: "As-machined or better, Ra ≤ 6.3 μm",
    typicalSpecs: ["7075-T6 (QQ-A200/11)", "2024 (QQ-A-200/3)", "6061-T6", "2219-T87"]
  },
  steel: {
    velocity: 5.90,
    velocityShear: 3.23,
    acousticImpedance: 46.0,
    attenuation: 3.0,
    density: 7.8,
    surfaceCondition: "Ground or machined, Ra ≤ 3.2 μm",
    typicalSpecs: ["4340 annealed (MIL-S-5000)", "4130", "17-4 PH", "15-5 PH"]
  },
  titanium: {
    velocity: 6.10,
    velocityShear: 3.12,
    acousticImpedance: 27.3,
    attenuation: 4.5,
    density: 4.5,
    surfaceCondition: "Machined, Ra ≤ 6.3 μm, chemical milled acceptable",
    typicalSpecs: ["Ti-6Al-4V annealed (AMS 4928)", "Ti-6Al-4V STA", "Ti-5Al-2.5Sn", "CP Ti Grade 2"]
  },
  magnesium: {
    velocity: 5.77,
    velocityShear: 3.05,
    acousticImpedance: 10.0,
    attenuation: 8.0,
    density: 1.74,
    surfaceCondition: "Machined, protective coating acceptable if <0.05mm",
    typicalSpecs: ["ZK60A (QQ-M-31)", "AZ31B", "AZ80A", "ZE41A"]
  }
};

// Standard-based auto-fill rules
interface StandardRules {
  defaultAcceptanceClass: AcceptanceClass;
  minThickness: number; // mm
  typicalFrequencies: string[];
  couplantRecommendations: string[];
  scanCoverageDefault: number; // percentage
  linearityRequirements: {
    vertical: { min: number; max: number };
    horizontal: { min: number };
  };
}

export const standardRules: Record<StandardType, StandardRules> = {
  "AMS-STD-2154E": {
    defaultAcceptanceClass: "A",
    minThickness: 6.35,
    typicalFrequencies: ["2.25", "5.0", "10.0"],
    couplantRecommendations: ["Water (Immersion)", "Glycerin", "Commercial Gel (Sono 600)"],
    scanCoverageDefault: 100,
    linearityRequirements: {
      vertical: { min: 5, max: 98 },
      horizontal: { min: 90 }
    }
  },
  "ASTM-E-114": {
    defaultAcceptanceClass: "B",
    minThickness: 6.35,
    typicalFrequencies: ["1.0", "2.25", "5.0"],
    couplantRecommendations: ["Water", "Oil-based gel", "Glycerin"],
    scanCoverageDefault: 100,
    linearityRequirements: {
      vertical: { min: 10, max: 95 },
      horizontal: { min: 85 }
    }
  },
  "MIL-STD-2154": {
    defaultAcceptanceClass: "A",
    minThickness: 6.35,
    typicalFrequencies: ["2.25", "5.0", "10.0"],
    couplantRecommendations: ["Water", "Glycerin", "Couplant gel"],
    scanCoverageDefault: 100,
    linearityRequirements: {
      vertical: { min: 10, max: 95 },
      horizontal: { min: 85 }
    }
  }
};

// Part geometry-based recommendations
interface GeometryRecommendations {
  calibrationBlockType: string[];
  scanPattern: string;
  transducerType: "immersion" | "contact" | "dual_element";
  specialConsiderations: string;
}

export const geometryRecommendations: Record<PartGeometry, GeometryRecommendations> = {
  plate: {
    calibrationBlockType: ["flat_block"],
    scanPattern: "Raster scan, 0° and 90° directions",
    transducerType: "immersion",
    specialConsiderations: "Check for laminar discontinuities, back reflection loss"
  },
  bar: {
    calibrationBlockType: ["flat_block"],
    scanPattern: "Longitudinal scan along bar axis",
    transducerType: "contact",
    specialConsiderations: "Scan from multiple surfaces if diameter permits"
  },
  forging: {
    calibrationBlockType: ["curved_block", "flat_block"],
    scanPattern: "Contour following, multiple orientations",
    transducerType: "contact",
    specialConsiderations: "Match calibration block to part curvature, check grain structure effects"
  },
  tube: {
    calibrationBlockType: ["cylinder_fbh", "cylinder_notched"],
    scanPattern: "Helical or circumferential scan",
    transducerType: "immersion",
    specialConsiderations: "Check both ID and OD surfaces, wall thickness variation"
  },
  ring: {
    calibrationBlockType: ["curved_block", "cylinder_fbh"],
    scanPattern: "Circumferential scan, axial and radial",
    transducerType: "immersion",
    specialConsiderations: "Curvature compensation, grain structure orientation"
  },
  disk: {
    calibrationBlockType: ["flat_block"],
    scanPattern: "Radial and circumferential patterns",
    transducerType: "immersion",
    specialConsiderations: "Center bore area requires special attention, rim inspection"
  }
};

// Frequency selection based on thickness
export function getRecommendedFrequency(thickness: number, material?: MaterialType): string {
  // Material attenuation adjustment
  let attenuationFactor = 1.0;
  if (material) {
    const props = materialDatabase[material];
    // Higher attenuation materials need lower frequencies
    if (props.attenuation > 5) attenuationFactor = 0.5;
    else if (props.attenuation > 3) attenuationFactor = 0.75;
  }

  const adjustedThickness = thickness / attenuationFactor;

  if (adjustedThickness < 12.7) return "10.0";
  if (adjustedThickness < 25.4) return "5.0";
  if (adjustedThickness < 50.8) return "2.25";
  return "1.0";
}

// Resolution calculation based on frequency
export function getResolutionValues(frequency: string): { entry: number; back: number } {
  const resolutions: Record<string, { entry: number; back: number }> = {
    "1.0": { entry: 0.5, back: 0.2 },
    "2.25": { entry: 0.25, back: 0.1 },
    "5.0": { entry: 0.125, back: 0.05 },
    "10.0": { entry: 0.05, back: 0.025 },
    "15.0": { entry: 0.05, back: 0.025 },
  };
  return resolutions[frequency] || { entry: 0.125, back: 0.05 };
}

// Metal travel distance calculation
export function calculateMetalTravel(thickness: number): number {
  // Typically 2x to 4x thickness, rounded to nearest 5mm
  const travel = thickness * 3;
  return Math.round(travel / 5) * 5;
}

// Scan index calculation (overlap)
export function calculateScanIndex(transducerDiameter: number, coveragePercent: number = 100): number {
  // Scan index is spacing between scan lines
  // For 100% coverage, typically 80% of beam diameter
  // For 200% coverage (50% overlap), use 50% of beam diameter
  const overlapFactor = coveragePercent / 100;
  const indexInches = transducerDiameter * (2 - overlapFactor);
  // Convert to mm
  return Math.round(indexInches * 25.4 * 10) / 10;
}

// Acceptance criteria based on class
interface AcceptanceLimits {
  singleDiscontinuity: string;
  multipleDiscontinuities: string;
  linearDiscontinuity: string;
  backReflectionLoss: number;
  noiseLevel: string;
}

export const acceptanceLimits: Record<AcceptanceClass, AcceptanceLimits> = {
  "AAA": {
    singleDiscontinuity: "No indications >2% DAC",
    multipleDiscontinuities: "No indications >1% DAC",
    linearDiscontinuity: "Not permitted",
    backReflectionLoss: 2,
    noiseLevel: "Grass height <5% FSH"
  },
  "AA": {
    singleDiscontinuity: "No indications >5% DAC",
    multipleDiscontinuities: "No indications >2% DAC",
    linearDiscontinuity: "Not permitted",
    backReflectionLoss: 4,
    noiseLevel: "Grass height <10% FSH"
  },
  "A": {
    singleDiscontinuity: "No indications >8% DAC",
    multipleDiscontinuities: "No indications >5% DAC",
    linearDiscontinuity: "Linear indications >1/4\" not permitted",
    backReflectionLoss: 6,
    noiseLevel: "Grass height <15% FSH"
  },
  "B": {
    singleDiscontinuity: "No indications >15% DAC",
    multipleDiscontinuities: "No indications >8% DAC",
    linearDiscontinuity: "Linear indications >1/2\" not permitted",
    backReflectionLoss: 10,
    noiseLevel: "Grass height <20% FSH"
  },
  "C": {
    singleDiscontinuity: "No indications >25% DAC",
    multipleDiscontinuities: "No indications >15% DAC",
    linearDiscontinuity: "Linear indications >1\" not permitted",
    backReflectionLoss: 15,
    noiseLevel: "Grass height <25% FSH"
  }
};

// Couplant recommendation based on inspection type and material
export function getCouplantRecommendation(
  transducerType: string,
  material?: MaterialType,
  temperature?: number
): string {
  if (transducerType === "immersion") {
    if (temperature && temperature > 40) {
      return "Water with rust inhibitor (heated)";
    }
    return "Water (distilled or deionized)";
  }

  if (material === "magnesium") {
    return "Water-based gel (non-corrosive)";
  }

  return "Commercial ultrasonic gel (e.g., Sono 600)";
}

// FBH size recommendation based on material and frequency
export function getFBHSizeRecommendation(
  material: MaterialType,
  frequency: string,
  thickness: number
): string[] {
  const freq = parseFloat(frequency);
  const wavelength = materialDatabase[material].velocity / freq;
  
  // FBH diameter should be 1/4 to 1 wavelength
  const minFBH = Math.round(wavelength * 0.25 * 10) / 10;
  const maxFBH = Math.round(wavelength * 10) / 10;
  
  // Standard FBH sizes from the standard
  const standardSizes = [1.6, 2.0, 2.4, 3.2, 4.0, 4.8, 6.4, 8.0, 9.5];
  
  // Filter to recommended range
  const recommended = standardSizes.filter(size => size >= minFBH && size <= maxFBH);
  
  // If thickness-based selection needed
  if (thickness < 25) {
    return recommended.filter(s => s <= 4.8).map(s => `${s}mm (${(s/25.4).toFixed(3)}\")`);
  }
  
  return recommended.slice(0, 3).map(s => `${s}mm (${(s/25.4).toFixed(3)}\")`);
}