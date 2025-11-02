import { useEffect, useRef, useMemo } from 'react';
import { PartGeometry, MaterialType } from '@/types/techniqueSheet';
import { TechnicalDrawingGenerator, LayoutConfig, Dimensions } from '@/utils/technicalDrawings/TechnicalDrawingGenerator';
import { drawBoxTechnicalDrawing } from '@/utils/technicalDrawings/boxDrawing';
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
  showGrid?: boolean;
  showDimensions?: boolean;
  viewMode?: 'multi' | 'front' | 'top' | 'side' | 'isometric';
}

export const RealTimeTechnicalDrawing = ({
  partType,
  dimensions,
  viewMode = 'multi',
}: RealTimeTechnicalDrawingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generatorRef = useRef<TechnicalDrawingGenerator | null>(null);

  // Standard layout configuration
  const layout: LayoutConfig = useMemo(() => ({
    frontView: { x: 50, y: 50, width: 350, height: 250 },
    topView: { x: 450, y: 50, width: 350, height: 250 },
    sideView: { x: 50, y: 350, width: 350, height: 250 },
    isometric: { x: 450, y: 350, width: 350, height: 250 }
  }), []);

  // Prepare dimensions
  const drawingDimensions: Dimensions = useMemo(() => ({
    length: dimensions.length || 100,
    width: dimensions.width || 50,
    thickness: dimensions.thickness || 10,
    diameter: dimensions.diameter,
    innerDiameter: dimensions.innerDiameter,
    innerLength: dimensions.innerLength,
    innerWidth: dimensions.innerWidth,
    wallThickness: dimensions.wallThickness,
  }), [dimensions]);

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

      // Draw based on part type
      try {
        switch (partType) {
          case 'box':
          case 'rectangular_tube':
            drawBoxTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'cylinder':
            drawCylinderTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'sphere':
          case 'cone':
            // Use cylinder as base for sphere/cone
            drawCylinderTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'tube':
            drawTubeTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'hexagon':
            drawHexagonTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'l_profile':
            drawLProfileTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 't_profile':
            drawTProfileTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'i_profile':
            drawIProfileTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'u_profile':
            drawUProfileTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          case 'z_profile':
            drawZProfileTechnicalDrawing(generator, drawingDimensions, layout);
            break;

          default:
            // Default to box
            drawBoxTechnicalDrawing(generator, drawingDimensions, layout);
        }

      // Render the drawing
      generator.render();
    } catch (error) {
      console.error('Error generating technical drawing:', error);
    }
  }, [partType, drawingDimensions, layout]);

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
