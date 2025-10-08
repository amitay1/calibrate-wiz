import React from 'react';
import { CalibrationBlockType } from '@/types/techniqueSheet';

// Import professional drawings from MIL-STD-2154
import flatBlockImg from '@/assets/calibration-flat-block.png';
import curvedBlockImg from '@/assets/calibration-curved-block.png';
import cylinderFbhImg from '@/assets/calibration-cylinder-fbh.png';
import angleBeamImg from '@/assets/calibration-angle-beam.png';
import cylinderNotchedImg from '@/assets/calibration-cylinder-notched.png';
import iivBlockImg from '@/assets/calibration-iiv-block.png';

interface CalibrationBlockDrawingProps {
  blockType: CalibrationBlockType;
  width?: number;
  height?: number;
}

export const CalibrationBlockDrawing: React.FC<CalibrationBlockDrawingProps> = ({ 
  blockType, 
  width = 300, 
  height = 200 
}) => {
  // Map block types to their corresponding professional technical drawings from MIL-STD-2154
  const blockImages: Record<CalibrationBlockType, string> = {
    'flat_block': flatBlockImg,
    'curved_block': curvedBlockImg,
    'cylinder_fbh': cylinderFbhImg,
    'angle_beam': angleBeamImg,
    'cylinder_notched': cylinderNotchedImg,
    'iiv_block': iivBlockImg,
  };

  const imageSrc = blockImages[blockType];

  return (
    <div 
      className="flex items-center justify-center border rounded bg-background p-4" 
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
