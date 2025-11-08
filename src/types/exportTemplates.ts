import type { TechniqueSheetData } from './techniqueSheet';

export type ExportFormat = 'pdf' | 'docx' | 'html';

export type ExportTemplateType = 'minimal' | 'standard' | 'comprehensive' | 'report' | 'audit';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface FontSettings {
  primaryFont: string;
  monospaceFont: string;
  headingFont: string;
  baseFontSize: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface ExportTemplate {
  id: string;
  name: string;
  type: ExportTemplateType;
  description: string;
  branding?: {
    logo?: string;
    companyName?: string;
    colors: ColorPalette;
    fonts: FontSettings;
  };
  layout: {
    pageSize: 'A4' | 'Letter' | 'A3';
    orientation: 'portrait' | 'landscape';
    margins: Margins;
    columns: 1 | 2 | 3;
  };
  sections: SectionConfig[];
  includeWatermark: boolean;
  includeQRCode: boolean;
  includeTOC: boolean;
}

export interface ExportOptions {
  format: ExportFormat;
  template: ExportTemplate;
  include3DViews: boolean;
  includeCalibrationDrawings: boolean;
  includeSignatures: boolean;
  documentNumber?: string;
  customWatermark?: string;
  customFooter?: string;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  error?: string;
}
