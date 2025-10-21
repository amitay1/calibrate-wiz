import { ErrorHandler, AppError, ErrorType } from './errorHandling';
import { exportTechniqueSheetToPDF } from './techniqueSheetExport';
import { exportInspectionReportToPDF } from './inspectionReportExport';
import type {
  StandardType,
  InspectionSetupData,
  EquipmentData,
  CalibrationData,
  ScanParametersData,
  AcceptanceCriteriaData,
  DocumentationData,
} from '@/types/techniqueSheet';
import type { InspectionReportData } from '@/types/inspectionReport';

interface TechniqueSheetExportData {
  standard: StandardType;
  inspectionSetup: InspectionSetupData;
  equipment: EquipmentData;
  calibration: CalibrationData;
  scanParameters: ScanParametersData;
  acceptanceCriteria: AcceptanceCriteriaData;
  documentation: DocumentationData;
}

/**
 * Validate technique sheet data before export
 */
function validateTechniqueSheetData(data: TechniqueSheetExportData): void {
  const errors: string[] = [];

  if (!data.standard) {
    errors.push('Standard is required');
  }

  if (!data.inspectionSetup.partNumber) {
    errors.push('Part number is required');
  }

  if (!data.inspectionSetup.material) {
    errors.push('Material is required');
  }

  if (!data.equipment.manufacturer) {
    errors.push('Equipment manufacturer is required');
  }

  if (!data.documentation.inspectorName) {
    errors.push('Inspector name is required');
  }

  if (errors.length > 0) {
    throw new AppError(
      `Cannot export technique sheet: ${errors.join(', ')}`,
      ErrorType.VALIDATION,
      'VALIDATION_FAILED'
    );
  }
}

/**
 * Validate inspection report data before export
 */
function validateInspectionReportData(data: InspectionReportData): void {
  const errors: string[] = [];

  if (!data.documentNo) {
    errors.push('Document number is required');
  }

  if (!data.customerName) {
    errors.push('Customer name is required');
  }

  if (!data.itemDescription) {
    errors.push('Item description is required');
  }

  if (errors.length > 0) {
    throw new AppError(
      `Cannot export inspection report: ${errors.join(', ')}`,
      ErrorType.VALIDATION,
      'VALIDATION_FAILED'
    );
  }
}

/**
 * Safely export technique sheet with error handling
 */
export async function safeExportTechniqueSheet(
  data: TechniqueSheetExportData
): Promise<boolean> {
  try {
    // Validate data
    validateTechniqueSheetData(data);

    // Export PDF
    exportTechniqueSheetToPDF(data);

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      ErrorHandler.handle(error, 'Technique Sheet Export');
    } else {
      ErrorHandler.handle(
        new AppError(
          'Failed to export technique sheet',
          ErrorType.PDF_GENERATION,
          undefined,
          error as Error
        ),
        'Technique Sheet Export'
      );
    }
    return false;
  }
}

/**
 * Safely export inspection report with error handling
 */
export async function safeExportInspectionReport(
  data: InspectionReportData
): Promise<boolean> {
  try {
    // Validate data
    validateInspectionReportData(data);

    // Export PDF
    exportInspectionReportToPDF(data);

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      ErrorHandler.handle(error, 'Inspection Report Export');
    } else {
      ErrorHandler.handle(
        new AppError(
          'Failed to export inspection report',
          ErrorType.PDF_GENERATION,
          undefined,
          error as Error
        ),
        'Inspection Report Export'
      );
    }
    return false;
  }
}

/**
 * Export data with loading state management
 */
export async function exportWithLoadingState<T>(
  exportFn: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
): Promise<T | null> {
  setLoading(true);

  try {
    const result = await exportFn();
    onSuccess?.(result);
    return result;
  } catch (error) {
    const appError = error instanceof AppError
      ? error
      : new AppError(
          'Export operation failed',
          ErrorType.PDF_GENERATION,
          undefined,
          error as Error
        );

    ErrorHandler.handle(appError, 'Export Operation');
    onError?.(appError);
    return null;
  } finally {
    setLoading(false);
  }
}
