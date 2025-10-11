import { CalibrationBlockType } from '@/types/techniqueSheet';

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
  // Technical drawing labels for each block type
  const blockLabels: Record<CalibrationBlockType, string> = {
    'flat_block': 'Figure 4 - Flat Block with FBH',
    'curved_block': 'Figure 3 - Convex Surface Reference Block',
    'cylinder_fbh': 'Figure 6 - Cylindrical Block with FBH',
    'angle_beam': 'Figure 4 - Angle Beam Test Block',
    'cylinder_notched': 'Figure 5 - Hollow Cylindrical (Notched)',
    'iiv_block': 'Figure 7 - IIW Block',
  };

  return (
    <div 
      className="flex items-center justify-center border-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 shadow-inner w-full min-h-[250px] md:min-h-[300px] lg:min-h-[400px]" 
    >
      <div className="text-center space-y-4">
        <div className="text-lg font-semibold text-gray-700">
          {blockLabels[blockType]}
        </div>
        <div className="text-sm text-gray-500">
          MIL-STD-2154 / AMS-STD-2154
        </div>
        <div className="text-xs text-gray-400 mt-4">
          Technical drawing placeholder
        </div>
      </div>
    </div>
  );
};
