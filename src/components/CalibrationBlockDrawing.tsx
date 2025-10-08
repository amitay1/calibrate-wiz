import { CalibrationBlockType } from '@/types/techniqueSheet';

// Import original technical drawings from MIL-STD-2154 / AMS-STD-2154
import figure4AngleBeam from '@/assets/standard-figure4-angle-beam.jpg';
import figure3CurvedBlock from '@/assets/standard-figure3-curved-block.jpg';
import figure5Cylindrical from '@/assets/standard-figure5-cylindrical.jpg';
import figure7IIWBlock from '@/assets/standard-figure7-iiw-block.jpg';
import figure6CylinderFBH from '@/assets/standard-figure6-cylinder-fbh.jpg';

interface CalibrationBlockDrawingProps {
  blockType: CalibrationBlockType;
  width?: number;
  height?: number;
}

export const CalibrationBlockDrawing = ({ 
  blockType, 
  width = 300, 
  height = 200 
}: CalibrationBlockDrawingProps) => {
  // Map block types to their corresponding original technical drawings from the standard
  const blockImages: Record<CalibrationBlockType, string> = {
    'flat_block': figure4AngleBeam, // Figure 4 includes flat block with FBH
    'curved_block': figure3CurvedBlock, // Figure 3 - Convex Surface Reference Block
    'cylinder_fbh': figure6CylinderFBH, // Figure 6 - Geometry of flat-bottom holes in hollow cylindrical
    'angle_beam': figure4AngleBeam, // Figure 4 - Standard ultrasonic test block for angle beam
    'cylinder_notched': figure5Cylindrical, // Figure 5 - Hollow cylindrical standards (notched)
    'iiv_block': figure7IIWBlock, // Figure 7 - IIW (International Institute of Welding) block
  };

  const imageSrc = blockImages[blockType];

  return (
    <div 
      className="flex items-center justify-center border rounded bg-white p-4" 
      style={{ width, height }}
    >
      <img 
        src={imageSrc} 
        alt={`${blockType} calibration block - MIL-STD-2154`}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};
