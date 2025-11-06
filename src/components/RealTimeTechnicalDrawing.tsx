import { useEffect, useRef, useMemo, useState } from 'react';
import { PartGeometry, MaterialType } from '@/types/techniqueSheet';
import { TechnicalDrawingGenerator, LayoutConfig, Dimensions } from '@/utils/technicalDrawings/TechnicalDrawingGenerator';
import { drawBoxTechnicalDrawing, type BoxDrawingOptions } from '@/utils/technicalDrawings/boxDrawing';
import { drawCylinderTechnicalDrawing } from '@/utils/technicalDrawings/cylinderDrawing';
import { drawTubeTechnicalDrawing } from '@/utils/technicalDrawings/tubeDrawing';
import { drawHexagonTechnicalDrawing } from '@/utils/technicalDrawings/hexagonDrawing';
import {
  drawLProfileTechnicalDrawing,
  drawTProfileTechnicalDrawing,
  drawIProfileTechnicalDrawing,
  drawUProfileTechnicalDrawing,
  drawZProfileTechnicalDrawing,
} from '@/utils/technicalDrawings/profileDrawings';

// Debounce hook to prevent flickering during input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface RealTimeTechnicalDrawingProps {
  partType: PartGeometry;
  material?: MaterialType;
  dimensions: {
    length: number;
    width: number;
    thickness: number;
    diameter?: number;
    isHollow?: boolean;
    innerDiameter?: number;
    innerLength?: number;
    innerWidth?: number;
    wallThickness?: number;
  };
  scans?: Array<{
    id: string;
    name: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
  }>;
  // New: Scan coverage visualization options
  showScanCoverage?: boolean;
  scanDepthPenetration?: number;  // Depth of penetration in mm (usually thickness)
  showGrid?: boolean;
  showDimensions?: boolean;
  viewMode?: 'multi' | 'front' | 'top' | 'side' | 'isometric';
}

export const RealTimeTechnicalDrawing = ({
  partType,
  material,
  dimensions,
  scans = [],
  showScanCoverage = true,
  scanDepthPenetration,
  viewMode = 'multi',
}: RealTimeTechnicalDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generatorRef = useRef<TechnicalDrawingGenerator | null>(null);

  // Shorter debounce for more responsive updates (200ms)
  const debouncedDimensions = useDebounce(dimensions, 200);

  // Standard layout configuration
  const layout: LayoutConfig = useMemo(() => ({
    frontView: { x: 50, y: 50, width: 350, height: 250 },
    topView: { x: 450, y: 50, width: 350, height: 250 },
    sideView: { x: 50, y: 350, width: 350, height: 250 },
    isometric: { x: 450, y: 350, width: 350, height: 250 }
  }), []);

  // Prepare dimensions
  const drawingDimensions: Dimensions = useMemo(() => ({
    length: debouncedDimensions.length || 100,
    width: debouncedDimensions.width || 50,
    thickness: debouncedDimensions.thickness || 10,
    diameter: debouncedDimensions.diameter,
    innerDiameter: debouncedDimensions.innerDiameter,
    innerLength: debouncedDimensions.innerLength,
    innerWidth: debouncedDimensions.innerWidth,
    wallThickness: debouncedDimensions.wallThickness,
  }), [debouncedDimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 850;
    canvas.height = 650;

    // Initialize generator if needed
    if (!generatorRef.current) {
      generatorRef.current = new TechnicalDrawingGenerator(canvas);
    }

    const generator = generatorRef.current;

    // Clear previous drawing
    generator.clear();

    // Draw title
    generator.drawText(425, 30, `TECHNICAL DRAWING - ${partType.toUpperCase()}`, 18, '#000000');

    // Prepare INTELLIGENT scan coverage options based on actual scan data
    const scanDepth = scanDepthPenetration || dimensions.thickness || dimensions.diameter || 50;
    const beamAngle = (scans[0]?.beamAngle || 0) as 0 | 45 | 60 | 70;
    
    // Determine wave type from scan data
    const waveType: 'longitudinal' | 'shear' = 
      scans[0]?.waveType?.toLowerCase().includes('shear') || 
      scans[0]?.waveType?.toLowerCase().includes('transverse') || 
      beamAngle > 0 
        ? 'shear' 
        : 'longitudinal';
    
    // Estimate probe frequency (typical values: 2-10 MHz)
    const probeFrequency = 5; // Default to 5MHz, could be extracted from scan data if available
    
    const scanOptions: BoxDrawingOptions = {
      showScanCoverage,
      scanDepth,
      beamAngle,
      scanDirection: 'longitudinal',
      numberOfZones: 5,
      waveType,
      probeFrequency
    };

      // Draw based on part type
      try {
        switch (partType) {
          case 'box':
          case 'rectangular_tube':
            drawBoxTechnicalDrawing(generator, drawingDimensions, layout, scans, scanOptions);
            break;

          case 'cylinder':
            drawCylinderTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 'sphere':
          case 'cone':
            // Use cylinder as base for sphere/cone
            drawCylinderTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 'tube':
            drawTubeTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 'hexagon':
            drawHexagonTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 'l_profile':
            drawLProfileTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 't_profile':
            drawTProfileTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 'i_profile':
            drawIProfileTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 'u_profile':
            drawUProfileTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          case 'z_profile':
            drawZProfileTechnicalDrawing(generator, drawingDimensions, layout, scans);
            break;

          default:
            // Default to box
            drawBoxTechnicalDrawing(generator, drawingDimensions, layout, scans, scanOptions);
        }

      // Render the drawing
      generator.render();
    } catch (error) {
      console.error('Error generating technical drawing:', error);
    }
  }, [partType, drawingDimensions, layout, scans, showScanCoverage, scanDepthPenetration]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg shadow-lg"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          imageRendering: 'crisp-edges'
        }}
      />
    </div>
  );
};
