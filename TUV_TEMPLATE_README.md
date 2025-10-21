# TÜV Technical Card Template System

## Overview

The TÜV Template System enables Calibrate-Wiz to export professional 19-page inspection technique sheets matching the TÜV SÜD / BYTEST format used in aerospace and industrial NDT inspections.

This system was created to replicate the exact structure and professional appearance of real-world technical cards like the one used by BYTEST for FORGITAL (Technical card TUV.pdf).

---

## Features

### ✅ Complete 19-Page Template

The system generates a full technical card with all required sections:

1. **Page 1**: Cover page with document header, client info, part specifications
2. **Page 2**: Table of contents
3. **Page 3**: Reserved
4. **Pages 4-7**: Part drawings with colored scan zones
5. **Pages 8-9**: Equipment and probe details
6. **Pages 10-11**: Calibration parameters with FBH specifications
7. **Pages 12-13**: Scan parameters and settings
8. **Pages 14-15**: Acceptance criteria per standard
9. **Pages 16-17**: Reference standard drawings
10. **Pages 18-19**: Calibration data tables and QA signatures

### ✅ Part Drawing Management

- **Upload drawings**: PNG, JPG, SVG, or PDF formats
- **Preview**: View drawings before export
- **Library**: Manage multiple drawings
- **Integration**: Automatically includes selected drawing in export

### ✅ Professional Formatting

- Standard headers/footers on all pages
- Professional tables with color-coded headers
- Proper typography and spacing
- Company logo support
- Signature lines and QA sections

### ✅ Flexible Export Options

- **Language**: English, Italian, or Bilingual (EN/IT)
- **Format**: PDF or PDF/A (archival)
- **Sections**: Toggle inclusion of specific sections
- **Customization**: Add company branding

---

## System Architecture

### Type Definitions (`src/types/tuvTemplate.ts`)

Complete TypeScript interfaces for all TUV data structures:

```typescript
// Main data structure
interface TUVTechnicalCard {
  documentHeader: TUVDocumentHeader;
  partInformation: TUVPartInformation;
  inspectionParameters: TUVInspectionParameters;
  scanZones: TUVScanZone[];
  equipment: TUVEquipmentDetails[];
  calibrationParameters: TUVCalibrationParameters;
  scanParameters: TUVScanParameters;
  acceptanceCriteria: TUVAcceptanceCriteria;
  inspectionResults?: TUVInspectionResults;
  referenceDrawings?: TUVReferenceDrawing[];
  qualityData: TUVQualityData;
  remarks: TUVRemarks;
  metadata: TUVMetadata;
}
```

### PDF Export (`src/utils/tuvTemplateExport.ts`)

Main export functions:

```typescript
// Export TUV Technical Card to PDF
exportTUVTemplateToPDF(data: TUVTechnicalCard, options: TUVExportOptions): void

// Convert existing TechniqueSheet to TUV format
convertTechniqueSheetToTUV(techniqueSheet: TechniqueSheet, additionalData?: any): TUVTechnicalCard
```

### Components

1. **`PartDrawingManager`** (`src/components/PartDrawingManager.tsx`)
   - Upload and manage part drawings
   - Preview, download, delete drawings
   - Library management

2. **`TUVExportPanel`** (`src/components/TUVExportPanel.tsx`)
   - Main UI for TUV export
   - TUV-specific data entry
   - Export configuration
   - Integration with part drawings

### Sample Data (`src/utils/tuvSampleData.ts`)

- Complete sample TUV data based on real technical card
- Minimal sample for quick testing
- Helper functions for data generation

---

## Usage Guide

### 1. Basic Integration

Add the TUV Export Panel to your existing form:

```tsx
import { TUVExportPanel } from '@/components/TUVExportPanel';

// In your component
<TUVExportPanel
  techniqueSheet={techniqueSheetData}
  onExport={() => console.log('Export complete')}
/>
```

### 2. Manual Export (Programmatic)

```typescript
import { exportTUVTemplateToPDF, convertTechniqueSheetToTUV } from '@/utils/tuvTemplateExport';
import { sampleTUVData } from '@/utils/tuvSampleData';

// Using sample data
exportTUVTemplateToPDF(sampleTUVData, {
  includeTableOfContents: true,
  includeScanImages: true,
  includeReferenceDrawings: true,
  language: 'en',
  outputFormat: 'pdf',
});

// Converting existing technique sheet
const tuvData = convertTechniqueSheetToTUV(techniqueSheet, {
  documentNumber: 'P03.00-066',
  clientName: 'FORGITAL FMDL',
  labName: 'BYTEST NDI Unit',
});

exportTUVTemplateToPDF(tuvData);
```

### 3. Part Drawing Upload

```tsx
import { PartDrawingManager } from '@/components/PartDrawingManager';

const [partDrawing, setPartDrawing] = useState(null);

<PartDrawingManager
  onDrawingSelected={(drawing) => setPartDrawing(drawing)}
  currentDrawing={partDrawing}
/>

// Use the drawing in export
const tuvData = convertTechniqueSheetToTUV(techniqueSheet, {
  partDrawingImage: partDrawing?.imageData,
  // ... other data
});
```

---

## Data Mapping

The system automatically maps existing TechniqueSheet data to TUV format:

| TechniqueSheet Field | TUV Field | Notes |
|---------------------|-----------|-------|
| `inspectionSetup.partNumber` | `partInformation.partNumber` | Direct mapping |
| `inspectionSetup.material` | `partInformation.materialGrade` | Direct mapping |
| `equipment.frequency` | `equipment[0].frequency` | First equipment entry |
| `calibration.standardType` | `calibrationParameters.referenceStandardType` | Direct mapping |
| `acceptanceCriteria` | `acceptanceCriteria` | All criteria mapped |

### Required Additional Data

These fields must be provided separately (not in TechniqueSheet):

```typescript
{
  documentNumber: string;    // TUV document number (e.g., "P03.00-066")
  clientName: string;         // Client company name
  clientLocation: string;     // Client location
  labName: string;            // Testing laboratory name
  labLocation: string;        // Lab location
  approvedBy?: string;        // QA approver name
  partDrawingImage?: string;  // Part drawing (base64 or URL)
  logoImage?: string;         // Company logo (base64 or URL)
}
```

---

## File Structure

```
src/
├── types/
│   └── tuvTemplate.ts              # Type definitions
├── utils/
│   ├── tuvTemplateExport.ts        # Export functions
│   └── tuvSampleData.ts            # Sample data
├── components/
│   ├── TUVExportPanel.tsx          # Main export UI
│   └── PartDrawingManager.tsx      # Drawing management
└── examples/ (to be added)
    └── Technical card TUV.pdf       # Reference template

```

---

## Example: Complete TUV Export

```typescript
import { TUVTechnicalCard } from '@/types/tuvTemplate';
import { exportTUVTemplateToPDF } from '@/utils/tuvTemplateExport';

const tuvData: TUVTechnicalCard = {
  documentHeader: {
    documentNumber: 'P03.00-066',
    revision: '01',
    pageCount: 19,
    labName: 'BYTEST NDI Unit',
    labLocation: 'Italy',
    clientName: 'FORGITAL FMDL',
    clientLocation: 'France',
    issueDate: '2025-01-15',
  },

  partInformation: {
    partNumber: 'LFC-19009-001-200000_C',
    partName: 'Aerospace Forging Ring',
    partType: 'Forging',
    materialGrade: 'Al-7175-T74',
    materialSpec: 'AMS4149',
    dimensions: {
      outerDiameter: 639.9,
      innerDiameter: 478.0,
      height: 736,
    },
  },

  inspectionParameters: {
    processSpec: 'SAE AMS STD 2154 (Rev.E)',
    inspectionExtension: '100%',
    acceptanceClass: 'Class A',
    techniques: [
      {
        description: 'PE longitudinal waves 0°',
        waveType: 'longitudinal',
        angle: 0,
      },
    ],
    referenceProcedure: 'PP UTI 038 Rev. 10',
  },

  scanZones: [
    {
      zoneId: 'A',
      zoneName: 'Zone A-A1',
      scanType: 'PE longitudinal 0°',
      scanDirection: 'Circumferential',
      scanLength: '360 degree',
      indexLength: '360 mm',
    },
  ],

  equipment: [
    {
      tankNumber: 1,
      equipmentType: 'Ultrasonic Scanner',
      probeType: 'PAUT',
      frequency: '2.25 MHz',
      manufacturer: 'Imasonic',
      numberOfElements: '128',
      waveMode: 'Longitudinal',
      velocity: 6320,
      gain: '18 dB',
      range: '0-200 mm',
    },
  ],

  calibrationParameters: {
    referenceStandardType: 'ASTM E428',
    fbhSizes: [
      { diameter: 1.19, depth: 25, metalTravel: 75, transferValue: 14.2 },
      { diameter: 1.98, depth: 50, metalTravel: 150, transferValue: 18.5 },
    ],
    blockMaterial: 'Al-7175-T74',
    calibrationDate: '2025-01-10',
    calibratedBy: 'John Smith - Level 3',
  },

  scanParameters: {
    scanCoverage: 100,
    detectionThreshold: '20% DAC',
    recordingLevel: '50% DAC',
    evaluationMethod: 'Max amplitude',
    surfaceCondition: 'Machined',
  },

  acceptanceCriteria: {
    acceptanceStandard: 'SAE AMS STD 2154 Rev.E - Class A',
    singleDiscontinuity: 'No indications >8% DAC',
    multipleDiscontinuities: 'No indications >5% DAC',
    linearDiscontinuity: '>1/4" not permitted',
    backReflectionLoss: '6%',
    noiseLevel: '<15% FSH',
  },

  qualityData: {
    inspectorName: 'John Smith',
    inspectorLevel: 'Level 3',
    inspectorCertification: 'ASNT UT L3-2024-1234',
  },

  remarks: {
    generalRemarks: [
      'Inspection per procedure PP UTI 038 Rev. 10',
      'All equipment calibrated prior to inspection',
    ],
  },

  metadata: {
    templateVersion: '1.0',
    createdDate: '2025-01-15',
    modifiedDate: '2025-01-15',
    createdBy: 'Calibrate-Wiz',
  },
};

// Export with options
exportTUVTemplateToPDF(tuvData, {
  includeTableOfContents: true,
  includeScanImages: true,
  includeReferenceDrawings: true,
  language: 'bilingual', // English/Italian
  outputFormat: 'pdf-a', // Archival format
});
```

---

## Customization

### Adding Company Logo

```typescript
// Convert logo to base64
const logoBase64 = 'data:image/png;base64,iVBORw0KG...';

const tuvData = {
  documentHeader: {
    logoImage: logoBase64,
    // ... other fields
  },
  // ... rest of data
};
```

### Custom Export Options

```typescript
const customOptions: TUVExportOptions = {
  includeTableOfContents: false,  // Skip ToC
  includeScanImages: true,         // Include C-Scan/A-Scan
  includeReferenceDrawings: false, // Skip reference drawings
  language: 'it',                  // Italian only
  outputFormat: 'pdf-a',           // PDF/A for archival
};

exportTUVTemplateToPDF(tuvData, customOptions);
```

---

## Testing

### Quick Test with Sample Data

```typescript
import { sampleTUVData, minimalTUVData } from '@/utils/tuvSampleData';
import { exportTUVTemplateToPDF } from '@/utils/tuvTemplateExport';

// Test with full sample data
exportTUVTemplateToPDF(sampleTUVData);

// Test with minimal data
exportTUVTemplateToPDF(minimalTUVData);
```

### Testing Part Drawing Upload

1. Prepare test images (PNG, JPG, SVG)
2. Use PartDrawingManager component
3. Upload test image
4. Verify preview works
5. Export TUV with drawing included

---

## Best Practices

1. **Always validate required fields** before export
   - Document number
   - Client name
   - Part number
   - Inspector information

2. **Use high-quality part drawings** (recommended 1200+ DPI)

3. **Provide complete calibration data** for professional output

4. **Review exported PDF** before distribution

5. **Store TUV data** for record-keeping and future reference

---

## Troubleshooting

### Export fails silently

**Check:**
- All required fields are populated
- Part drawing (if provided) is valid base64 or URL
- Browser console for errors

### Part drawing doesn't appear

**Check:**
- Image format is supported (PNG, JPG, SVG, PDF)
- File size is under 10MB
- Image data is properly base64 encoded

### PDF layout issues

**Possible causes:**
- Very long text strings (split into multiple lines)
- Missing data causes empty sections
- Special characters in text

---

## Future Enhancements

Planned features:

- [ ] DXF/DWG part drawing import
- [ ] Auto-generation of simple part drawings from dimensions
- [ ] C-Scan/A-Scan image integration
- [ ] Multi-language support (French, German, Spanish)
- [ ] Template customization (colors, fonts, branding)
- [ ] Batch export for multiple parts
- [ ] Digital signatures integration
- [ ] Cloud storage for drawings and templates

---

## Support

For issues or questions:

1. Check this README
2. Review sample code in `tuvSampleData.ts`
3. Check type definitions in `tuvTemplate.ts`
4. Contact development team

---

## License

Part of Calibrate-Wiz NDT Inspection System
Copyright © 2025

---

**Last Updated**: January 2025
**Version**: 1.0
**Template Format**: TÜV SÜD / BYTEST 19-Page Technical Card
