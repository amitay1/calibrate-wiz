# Calibrate-Wiz - Features Overview

## Smart Auto-Fill System

The intelligent auto-fill system automatically populates over 20 fields based on user selections, dramatically reducing data entry time and ensuring consistency.

---

## 1️⃣ Standard Selection

### Auto-Filled Fields:

#### **Acceptance Class** (in Acceptance Criteria tab)
- **AMS-STD-2154E** → Class A (default)
- **ASTM-E-114** → Class B (default)
- **MIL-STD-2154** → Class A (default)

#### **Scan Coverage** (in Scan Parameters tab)
- All standards → 100% coverage (default)

#### **Linearity Requirements** (in Equipment tab)
Automatically set based on standard:

- **AMS-STD-2154E**:
  - Vertical: 5-98%
  - Horizontal: ≥90%

- **ASTM-E-114**:
  - Vertical: 10-95%
  - Horizontal: ≥85%

- **MIL-STD-2154**:
  - Vertical: 5-98%
  - Horizontal: ≥90%

---

## 2️⃣ Material Selection

### Auto-Filled Fields:

#### **Material Properties Display**
Each material displays:
- **Velocity** - Longitudinal and shear wave velocity (mm/µs)
- **Acoustic Impedance** (MRayls)
- **Attenuation** - Signal loss characteristic (dB/m)
- **Density** (g/cm³)
- **Surface Condition Requirements**

#### **Frequency** (in Equipment tab)
Automatically calculated based on:
- Part thickness
- Material attenuation level

Examples:
- Aluminum 25mm → 5.0 MHz
- Steel 50mm → 2.25 MHz
- Titanium 10mm → 10.0 MHz (adjusted for high attenuation)

#### **Metal Travel Distance** (in Calibration tab)
Calculated as 3× part thickness, rounded to nearest 5mm:
- Thickness 25mm → 75mm metal travel
- Thickness 50mm → 150mm metal travel

#### **Couplant Type** (in Equipment tab)
Auto-selected based on:
- Transducer type (Immersion/Contact)
- Material type

Examples:
- Immersion + Any material → "Water (distilled or deionized)"
- Contact + Aluminum → "Commercial ultrasonic gel"
- Contact + Magnesium → "Water-based gel (non-corrosive)"

---

## 3️⃣ Part Geometry Selection

### Auto-Filled Recommendations:

#### **Calibration Block Type**
System recommends:
- **Plate** → Flat Block with FBH
- **Bar** → Flat Block
- **Forging** → Curved Block / Flat Block
- **Tube** → Hollow Cylindrical - FBH
- **Ring** → Curved Block / Hollow Cylindrical
- **Disk** → Flat Block

#### **Scan Pattern** (in Scan Parameters tab)
Recommended patterns:
- **Plate** → "Raster scan, 0° and 90° directions"
- **Bar** → "Longitudinal scan along bar axis"
- **Forging** → "Contour following, multiple orientations"
- **Tube** → "Helical or circumferential scan"
- **Ring** → "Circumferential scan, axial and radial"
- **Disk** → "Radial and circumferential patterns"

#### **Transducer Type**
Automatic recommendation:
- Plate/Tube/Ring/Disk → **Immersion**
- Bar/Forging → **Contact**

#### **Special Considerations**
Alerts and recommendations:
- **Plate**: "Check for laminar discontinuities, back reflection loss"
- **Tube**: "Check both ID and OD surfaces, wall thickness variation"
- **Forging**: "Match calibration block to part curvature, check grain structure effects"

---

## 4️⃣ Acceptance Class Selection

### Auto-Filled Fields:

When selecting an Acceptance Class, ALL acceptance criteria fields are automatically populated:

#### **Class AAA** (Most Stringent)
- Single Discontinuity: "No indications >2% DAC"
- Multiple Discontinuities: "No indications >1% DAC"
- Linear Discontinuity: "Not permitted"
- Back Reflection Loss: 2%
- Noise Level: "Grass height <5% FSH"

#### **Class AA**
- Single: >5% DAC
- Multiple: >2% DAC
- Linear: Not permitted
- Back Reflection Loss: 4%
- Noise: <10% FSH

#### **Class A**
- Single: >8% DAC
- Multiple: >5% DAC
- Linear: >1/4" not permitted
- Back Reflection Loss: 6%
- Noise: <15% FSH

#### **Class B**
- Single: >15% DAC
- Multiple: >8% DAC
- Linear: >1/2" not permitted
- Back Reflection Loss: 10%
- Noise: <20% FSH

#### **Class C** (Least Stringent)
- Single: >25% DAC
- Multiple: >15% DAC
- Linear: >1" not permitted
- Back Reflection Loss: 15%
- Noise: <25% FSH

---

## 5️⃣ Frequency Selection

### Auto-Filled Fields:

#### **Resolution Values** (in Equipment tab)
Automatically calculated based on frequency:

| Frequency | Entry Surface | Back Surface |
|-----------|--------------|--------------|
| 1.0 MHz   | 0.5"         | 0.2"         |
| 2.25 MHz  | 0.25"        | 0.1"         |
| 5.0 MHz   | 0.125"       | 0.05"        |
| 10.0 MHz  | 0.05"        | 0.025"       |
| 15.0 MHz  | 0.05"        | 0.025"       |

---

## 6️⃣ Transducer Type Selection

### Auto-Filled Fields:

#### **Couplant Type**
- **Immersion** → "Water (distilled or deionized)"
- **Contact** → "Commercial ultrasonic gel"
- **Dual Element** → "High-viscosity gel"

With material consideration:
- Magnesium → Always "Water-based (non-corrosive)"

---

## 🎯 Special Features

### Smart Alerts:
1. **Titanium + Class AAA** → Special alert for additional requirements
2. **Thickness < 6.35mm** → Warning - below standard minimum
3. **Material attenuation** → Automatic frequency adjustment

### Visual Indicators:
- 🌟 **Recommended Frequency** - Marked with star in dropdown
- 🤖 **Auto-filled** - Badge next to automatically populated fields
- ℹ️ **Info tooltips** - Material property information

---

## 📊 Knowledge Database

### Material Database
Contains for each material:
- Longitudinal & Shear Velocity
- Acoustic Impedance
- Attenuation coefficient
- Density
- Surface condition requirements
- Typical material specifications

### Standard Rules Database
Contains for each standard:
- Default acceptance class
- Minimum thickness requirements
- Typical frequency ranges
- Couplant recommendations
- Scan coverage defaults
- Linearity requirements

### Geometry Recommendations Database
Contains for each geometry:
- Recommended calibration block types
- Optimal scan patterns
- Transducer type suggestions
- Special inspection considerations

---

## 🔄 Auto-Fill Flow Diagram

```
Standard Selected
    ↓
    → Acceptance Class
    → Scan Coverage
    → Linearity Requirements

Material Selected
    ↓
    → Display Material Properties
    → Calculate Frequency (with Thickness)
    → Calculate Metal Travel
    → Select Couplant (with Transducer Type)

Part Geometry Selected
    ↓
    → Recommend Calibration Block
    → Suggest Scan Pattern
    → Recommend Transducer Type
    → Show Special Considerations

Acceptance Class Selected
    ↓
    → Fill ALL Acceptance Criteria
    → Set Back Reflection Loss
    → Set Noise Level

Frequency Selected
    ↓
    → Calculate Entry Surface Resolution
    → Calculate Back Surface Resolution
```

---

## ✅ Summary

The auto-fill system **automatically** populates **over 20 fields** based on:
- 5 primary selections (Standard, Material, Geometry, Acceptance Class, Frequency)
- Comprehensive material properties database
- Standard compliance rules
- NDT expert recommendations

**All auto-filled values** can be manually edited if needed!

---

## Additional Features

### 3D Visualization
- **Real-time 3D Models**: Interactive visualization of parts
- **Material-Specific Colors**: Realistic representation
- **Geometry Support**: Plate, Bar, Forging, Tube, Ring, Disk
- **OrbitControls**: Rotate, zoom, and pan

### Technical Drawings
- **6 Calibration Block Types**: Per MIL-STD-2154
- **ISO 128 Standards**: Professional line types
- **Accurate Dimensions**: With arrows and annotations
- **Cross-Section Hatching**: Standard representation

### C-Scan & A-Scan Generation
- **C-Scan Heatmaps**: Color-coded thickness maps
- **A-Scan Waveforms**: Time-based amplitude display
- **High Resolution**: Print-quality graphics
- **Custom Color Scales**: Blue → Green → Yellow → Red

### PDF Export
- **Technique Sheets**: 1-page summary documents
- **Inspection Reports**: 19-page comprehensive reports
- **Professional Formatting**: Industry-standard layout
- **Embedded Images**: C-Scan, A-Scan, and diagrams

### Data Management
- **Auto-Save**: Automatic localStorage backup
- **Export/Import**: Save and load projects
- **Validation**: Real-time field validation
- **Error Handling**: Comprehensive error management

---

**Last Updated**: October 2025
