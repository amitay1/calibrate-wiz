# Calibrate-Wiz - Complete Documentation

**Version:** 1.0.0
**Last Updated:** October 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [User Guide](#user-guide)
5. [Technical Documentation](#technical-documentation)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Introduction

### What is Calibrate-Wiz?

Calibrate-Wiz (Scan Master Inspection Pro) is a professional web application designed to generate ultrasonic testing (UT) inspection documentation for aerospace and industrial NDT (Non-Destructive Testing) applications.

### Key Capabilities

- **1-Page Technique Sheets**: Generate standardized UT technique sheets
- **19-Page Inspection Reports**: Comprehensive inspection documentation
- **3D Visualization**: Interactive part and calibration block visualization
- **Technical Drawings**: CAD-quality calibration block diagrams
- **Smart Auto-Fill**: Intelligent field population based on material and standard selection
- **Multi-Standard Support**: MIL-STD-2154, AMS-STD-2154E, ASTM-E-114

### Who Should Use This?

- NDT Inspectors (Level II/III)
- Quality Assurance Engineers
- Aerospace Manufacturing Facilities
- NDT Service Providers
- Materials Engineers

---

## Getting Started

### Installation

#### Prerequisites

- Node.js v18 or higher
- npm or bun package manager
- Modern web browser (Chrome, Firefox, Edge, Safari)

#### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd calibrate-wiz

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:8080
```

#### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Quick Start Tutorial

1. **Select a Standard**: Choose from MIL-STD-2154, AMS-STD-2154E, or ASTM-E-114
2. **Enter Part Information**: Fill in part number, material, geometry, and dimensions
3. **Equipment Details**: Specify ultrasonic equipment and transducer information
4. **Calibration**: Select calibration block type and parameters
5. **Review**: Check the 3D preview and validation status
6. **Export**: Generate PDF technique sheet or inspection report

---

## Features

### 1. Intelligent Auto-Fill System

The application automatically populates over 20 fields based on your selections:

#### Material-Based Auto-Fill
When you select a material (Aluminum, Steel, Titanium, or Magnesium), the system automatically fills:

- **Frequency**: Calculated based on part thickness and material attenuation
- **Couplant Type**: Recommended based on transducer type and material
- **Metal Travel Distance**: Automatically calculated as 3x part thickness
- **Material Properties**: Displays acoustic velocity, impedance, density, and surface requirements

#### Standard-Based Auto-Fill
When you select an inspection standard, the system automatically sets:

- **Acceptance Class**: Default class per standard (e.g., Class A for AMS-STD-2154E)
- **Linearity Requirements**: Vertical and horizontal linearity thresholds
- **Scan Coverage**: Default coverage percentage (typically 100%)

#### Geometry-Based Auto-Fill
When you select part geometry, the system recommends:

- **Calibration Block Type**: Optimal block for the part geometry
- **Scan Pattern**: Appropriate scan strategy (raster, helical, circumferential)
- **Transducer Type**: Contact vs. Immersion recommendation
- **Special Considerations**: Geometry-specific inspection notes

### 2. 3D Visualization

Interactive 3D models with the following features:

- **Part Geometries**: Plate, Bar, Forging, Tube, Ring, Disk
- **Material Colors**: Realistic material-specific colors
- **OrbitControls**: Rotate, zoom, and pan the model
- **Real-time Updates**: Model updates as you change parameters

### 3. Technical Drawing Generator

Professional CAD-quality drawings for:

- **Flat Block with FBH** (Figure 4)
- **Curved Surface Block** (Figure 3)
- **Hollow Cylindrical Block** (Figure 6)
- **Angle Beam Test Block** (Figure 4A)
- **Notched Cylindrical Block** (Figure 5)
- **IIW Type Block** (Figure 7)

Features:
- ISO 128 line standards
- Professional dimensioning with arrows
- Cross-section hatching
- Accurate scale representation

### 4. C-Scan & A-Scan Visualization

- **C-Scan**: Heatmap visualization with color scale (Blue → Green → Yellow → Red)
- **A-Scan**: Waveform amplitude display with grid
- **High Resolution**: Professional quality for reporting

### 5. Material Database

Comprehensive acoustic properties for 4 materials:

| Material   | Velocity (mm/µs) | Impedance (MRayls) | Attenuation (dB/m @5MHz) |
|------------|------------------|--------------------|--------------------------|
| Aluminum   | 6.32             | 17.0               | 1.5                      |
| Steel      | 5.90             | 46.0               | 3.0                      |
| Titanium   | 6.10             | 27.3               | 4.5                      |
| Magnesium  | 5.77             | 10.0               | 8.0                      |

### 6. Acceptance Criteria (5 Classes)

Pre-configured acceptance criteria from AAA (most stringent) to C (least stringent):

- **Class AAA**: No indications >2% DAC, Back reflection loss ≤2%
- **Class AA**: No indications >5% DAC, Back reflection loss ≤4%
- **Class A**: No indications >8% DAC, Back reflection loss ≤6%
- **Class B**: No indications >15% DAC, Back reflection loss ≤10%
- **Class C**: No indications >25% DAC, Back reflection loss ≤15%

### 7. PDF Export

Two types of professional PDF documents:

#### Technique Sheet (1 Page)
- Header with standard and part information
- Inspection setup parameters
- Equipment specifications
- Calibration block details
- Scan parameters
- Acceptance criteria
- Documentation and signatures

#### Inspection Report (19 Pages)
- Page 1: Cover page with customer info
- Page 2: Part diagram
- Page 3: Probe details table
- Pages 4-18: C-Scan and A-Scan images
- Page 19: Remarks and notes

### 8. Keyboard Shortcuts

- **Ctrl+S**: Save current work
- **Ctrl+E**: Export to PDF
- **Ctrl+N**: New document / Clear all fields

---

## User Guide

### Creating a Technique Sheet

#### Step 1: Inspection Setup

1. Navigate to the **Inspection Setup** tab
2. Enter **Part Number** and **Part Name**
3. Select **Material** from dropdown (Aluminum, Steel, Titanium, Magnesium)
4. Choose **Part Geometry** (Plate, Bar, Forging, Tube, Ring, Disk)
5. Enter dimensions (Thickness, Length, Width, Diameter as applicable)

**Pro Tip**: The 3D viewer on the right updates in real-time as you enter dimensions.

#### Step 2: Equipment Configuration

1. Go to **Equipment** tab
2. Enter equipment **Manufacturer** and **Model**
3. **Frequency** is auto-filled based on material and thickness (you can override)
4. Select **Transducer Type** (Immersion, Contact, Dual Element, Angle Beam)
5. **Couplant** is auto-recommended (you can modify)
6. Review **Linearity** values (auto-filled per standard)

#### Step 3: Calibration

1. Open **Calibration** tab
2. Review recommended **Calibration Block Type** (auto-filled based on geometry)
3. Confirm **Reference Material** matches part material
4. **FBH Sizes** are suggested based on frequency and wavelength
5. **Metal Travel Distance** is auto-calculated (3x thickness, rounded to nearest 5mm)
6. Enter **Block Serial Number** and **Last Calibration Date**

#### Step 4: Scan Parameters

1. Navigate to **Scan Parameters** tab
2. **Scan Pattern** is pre-filled based on geometry
3. Set **Scan Speed** and **Scan Index**
4. **Coverage** defaults to 100% (adjust as needed)
5. Enter **Gain Settings** and **Alarm Gate Settings**

#### Step 5: Acceptance Criteria

1. Go to **Acceptance Criteria** tab
2. **Acceptance Class** is pre-selected per standard
3. All criteria (Single Discontinuity, Multiple Discontinuities, etc.) are auto-filled
4. Review and modify **Back Reflection Loss** threshold
5. Add any **Special Requirements**

#### Step 6: Documentation

1. Open **Documentation** tab
2. Enter **Inspector Name** and **Certification Number**
3. Select **Inspector Level** (I, II, III)
4. Enter **Certifying Organization**
5. **Inspection Date** defaults to today
6. Add **Procedure Number** and **Drawing Reference**
7. Include any **Additional Notes**

#### Step 7: Export

1. Click **Export** button in toolbar or use **Ctrl+E**
2. Choose "Technique Sheet" from export options
3. PDF downloads automatically
4. Review exported PDF for completeness

### Creating an Inspection Report

#### Pages 1-3: General Information

1. Use **Cover Page** tab to enter:
   - Document number and revision
   - Customer name and PO number
   - Item description and specifications
   - Sample details

2. **Part Diagram** tab:
   - Generate technical drawing of the part
   - Includes dimensions and views

3. **Probe Details** tab:
   - Add probe information (frequency, make, wave mode)
   - Multiple probes can be documented

#### Pages 4-18: Scan Data

1. Go to **Scans** tab
2. For each scan position:
   - Upload or generate C-Scan image
   - Upload or generate A-Scan waveform
   - Enter scan parameters (direction, length, probe type)
3. Add up to 15 scan locations

#### Page 19: Remarks

1. Open **Remarks** tab
2. Add inspection observations
3. Note any special conditions or findings
4. Include recommendations

#### Export Report

1. Click **Export** → "Inspection Report"
2. 19-page PDF generates automatically
3. Review all pages before submission

---

## Technical Documentation

### Architecture

**Frontend Stack**:
- React 18.3.1 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- shadcn/ui component library

**3D Rendering**:
- Three.js with React Three Fiber
- @react-three/drei utilities

**PDF Generation**:
- jsPDF for document creation
- jsPDF-AutoTable for tables

**State Management**:
- React useState hooks
- localStorage for persistence
- TanStack Query for server state

### Project Structure

```
calibrate-wiz/
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn UI components
│   │   ├── tabs/          # Form tab components (11 tabs)
│   │   ├── ErrorBoundary.tsx
│   │   └── ThreeDViewer.tsx
│   ├── pages/
│   │   └── Index.tsx      # Main application page
│   ├── types/
│   │   ├── techniqueSheet.ts
│   │   └── inspectionReport.ts
│   ├── utils/
│   │   ├── autoFillLogic.ts
│   │   ├── errorHandling.ts
│   │   ├── safeExport.ts
│   │   └── *Export.ts     # PDF export utilities
│   └── test/              # Test utilities and setup
├── vitest.config.ts       # Test configuration
└── package.json
```

### Data Flow

```
User Input
    ↓
Form State (useState)
    ↓
Auto-Fill Logic (useEffect)
    ├─ Material Properties
    ├─ Standard Rules
    └─ Calibration Recommender
    ↓
Preview Components
    ├─ 3D Viewer
    ├─ Technical Drawings
    └─ Visualizations
    ↓
Export Functions
    ├─ Technique Sheet PDF
    └─ Inspection Report PDF
```

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Test Coverage**:
- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for workflows
- Error handling tests

### Error Handling

The application includes comprehensive error handling:

- **ErrorBoundary**: Catches React component errors
- **AppError**: Custom error types (Validation, Network, PDF Generation, etc.)
- **SafeStorage**: Protected localStorage operations
- **retryOperation**: Automatic retry for network requests

---

## API Reference

### Auto-Fill Functions

#### `getRecommendedFrequency(thickness: number, material?: MaterialType): string`

Returns recommended frequency based on part thickness and material attenuation.

**Parameters**:
- `thickness`: Part thickness in mm
- `material`: Optional material type

**Returns**: Frequency as string (e.g., "5.0")

**Example**:
```typescript
const freq = getRecommendedFrequency(25, 'aluminum');
// Returns: "5.0"
```

#### `getCouplantRecommendation(transducerType: string, material?: MaterialType): string`

Recommends appropriate couplant based on transducer type and material.

**Parameters**:
- `transducerType`: Type of transducer ("immersion", "contact", etc.)
- `material`: Optional material type

**Returns**: Couplant recommendation

**Example**:
```typescript
const couplant = getCouplantRecommendation('immersion', 'aluminum');
// Returns: "Water (distilled or deionized)"
```

#### `calculateMetalTravel(thickness: number): number`

Calculates metal travel distance (3x thickness, rounded to nearest 5mm).

**Parameters**:
- `thickness`: Part thickness in mm

**Returns**: Metal travel distance in mm

**Example**:
```typescript
const travel = calculateMetalTravel(25);
// Returns: 75
```

### Export Functions

#### `safeExportTechniqueSheet(data: TechniqueSheetExportData): Promise<boolean>`

Safely exports technique sheet with validation and error handling.

**Parameters**:
- `data`: Complete technique sheet data object

**Returns**: Promise resolving to true if successful, false otherwise

#### `safeExportInspectionReport(data: InspectionReportData): Promise<boolean>`

Safely exports inspection report with validation.

**Parameters**:
- `data`: Complete inspection report data object

**Returns**: Promise resolving to true if successful, false otherwise

---

## Troubleshooting

### Common Issues

#### PDF Export Fails

**Symptoms**: Error message when trying to export PDF

**Solutions**:
1. Ensure all required fields are filled (Part Number, Material, Inspector Name)
2. Check browser console for specific error messages
3. Try clearing browser cache and reloading
4. Verify browser allows downloads

#### 3D Viewer Not Loading

**Symptoms**: Blank space where 3D model should appear

**Solutions**:
1. Check if WebGL is enabled in your browser
2. Update graphics drivers
3. Try a different browser (Chrome recommended)
4. Disable browser extensions that might block WebGL

#### Auto-Fill Not Working

**Symptoms**: Fields don't populate after selecting material/standard

**Solutions**:
1. Ensure you've selected both Material and Standard
2. Try refreshing the page
3. Check that JavaScript is enabled
4. Clear localStorage: `localStorage.clear()` in browser console

#### Data Loss After Refresh

**Symptoms**: Work is lost when page reloads

**Solutions**:
1. Use Ctrl+S to save before navigating away
2. Check if browser is blocking localStorage
3. Verify you're not in private/incognito mode
4. Enable auto-save in browser settings

### Error Messages

#### "Validation Error: Part number is required"
- Fill in the Part Number field in Inspection Setup tab
- Part Number cannot be empty for export

#### "PDF Generation Error"
- Check all required fields are complete
- Verify images (C-Scan, A-Scan) are valid
- Try reducing image sizes if report is very large

#### "Storage Error: Failed to save data"
- Browser storage may be full
- Clear old data or use private/incognito mode
- Check browser storage settings

---

## FAQ

### General

**Q: Is internet connection required?**
A: No, the application works offline once loaded. Data is saved locally in your browser.

**Q: Can I use this on mobile devices?**
A: Yes, the application is responsive and works on tablets and phones, though desktop is recommended for best experience.

**Q: How is my data stored?**
A: All data is stored locally in your browser's localStorage. No data is sent to external servers by default.

### Features

**Q: Can I add custom materials?**
A: Currently, only the 4 pre-defined materials are supported. Custom materials may be added in future versions.

**Q: Can I modify the auto-filled values?**
A: Yes! All auto-filled fields can be manually edited if needed.

**Q: How many standards are supported?**
A: Three standards: MIL-STD-2154, AMS-STD-2154E, and ASTM-E-114.

**Q: Can I save multiple technique sheets?**
A: With Supabase integration (if enabled), yes. Otherwise, export to PDF to save documents.

### Export & Printing

**Q: What format are the exports?**
A: PDF format, compatible with all PDF readers.

**Q: Can I edit the PDF after export?**
A: The exported PDF is read-only. To make changes, modify the data in the application and re-export.

**Q: Can I export to DXF for CAD?**
A: Basic DXF export is available for technical drawings. Full CAD integration is planned for future releases.

### Technical

**Q: What browsers are supported?**
A: Modern browsers with ES6+ support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.

**Q: Can I integrate this with our existing system?**
A: API integration is possible. Contact support for enterprise integration options.

**Q: Is the source code available?**
A: Yes, this is an open-source project. See the repository for details.

---

## Support & Contributing

### Getting Help

- **Documentation**: This file and inline help tooltips
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions on GitHub

### Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request

### License

See LICENSE file in repository.

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintained by**: Calibrate-Wiz Development Team
