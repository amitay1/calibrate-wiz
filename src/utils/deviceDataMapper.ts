/**
 * Maps device data to technique sheet fields
 */

import type { TechniqueSheet } from '@/types/techniqueSheet';

interface DeviceData {
  frequency?: string | null;
  gain?: number | null;
  range?: number | null;
  velocity?: number | null;
  probeType?: string | null;
  serialNumber?: string | null;
  temperature?: number | null;
  couplant?: string | null;
}

/**
 * Auto-fill technique sheet from device data
 */
export function autoFillFromDevice(
  currentSheet: TechniqueSheet,
  deviceData: DeviceData
): TechniqueSheet {
  const updatedSheet = { ...currentSheet };

  // Update equipment data
  if (deviceData.frequency) {
    updatedSheet.equipment = {
      ...updatedSheet.equipment,
      frequency: deviceData.frequency,
    };
  }

  if (deviceData.serialNumber) {
    updatedSheet.equipment = {
      ...updatedSheet.equipment,
      serialNumber: deviceData.serialNumber,
    };
  }

  if (deviceData.probeType) {
    updatedSheet.equipment = {
      ...updatedSheet.equipment,
      transducerType: deviceData.probeType,
    };
  }

  if (deviceData.couplant) {
    updatedSheet.equipment = {
      ...updatedSheet.equipment,
      couplant: deviceData.couplant,
    };
  }

  // Update scan parameters
  if (deviceData.gain !== null && deviceData.gain !== undefined) {
    updatedSheet.scanParameters = {
      ...updatedSheet.scanParameters,
      gainSettings: `${deviceData.gain} dB`,
    };
  }

  // Update calibration data with velocity
  if (deviceData.velocity) {
    // Store velocity in calibration notes or metadata
    updatedSheet.calibration = {
      ...updatedSheet.calibration,
      referenceMaterial: updatedSheet.calibration.referenceMaterial 
        ? `${updatedSheet.calibration.referenceMaterial} (${deviceData.velocity} m/s)`
        : `Velocity: ${deviceData.velocity} m/s`,
    };
  }

  // Update modification timestamp
  updatedSheet.modifiedDate = new Date().toISOString();

  return updatedSheet;
}

/**
 * Extract mappable fields from device data
 */
export function getDeviceFieldMappings(deviceData: DeviceData): Record<string, any> {
  const mappings: Record<string, any> = {};

  if (deviceData.frequency) {
    mappings['equipment.frequency'] = deviceData.frequency;
  }

  if (deviceData.gain !== null && deviceData.gain !== undefined) {
    mappings['scanParameters.gainSettings'] = `${deviceData.gain} dB`;
  }

  if (deviceData.velocity) {
    mappings['calibration.velocity'] = deviceData.velocity;
  }

  if (deviceData.probeType) {
    mappings['equipment.transducerType'] = deviceData.probeType;
  }

  if (deviceData.serialNumber) {
    mappings['equipment.serialNumber'] = deviceData.serialNumber;
  }

  if (deviceData.couplant) {
    mappings['equipment.couplant'] = deviceData.couplant;
  }

  if (deviceData.range) {
    mappings['scanParameters.range'] = deviceData.range;
  }

  return mappings;
}

/**
 * Validate device data completeness
 */
export function validateDeviceData(deviceData: DeviceData): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Critical fields
  if (!deviceData.frequency) {
    missingFields.push('Frequency');
  }

  if (deviceData.gain === null || deviceData.gain === undefined) {
    missingFields.push('Gain');
  }

  // Important but not critical
  if (!deviceData.velocity) {
    warnings.push('Velocity not provided - may affect calibration accuracy');
  }

  if (!deviceData.probeType) {
    warnings.push('Probe type not specified');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}
