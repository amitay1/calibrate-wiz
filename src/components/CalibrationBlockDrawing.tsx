import { CalibrationBlockType } from '@/types/techniqueSheet';

interface CalibrationBlockDrawingProps {
  blockType: CalibrationBlockType;
  width?: number;
  height?: number;
}

export const CalibrationBlockDrawing = ({ 
  blockType, 
  width = 400, 
  height = 300 
}: CalibrationBlockDrawingProps) => {
  // Technical drawing labels and metadata
  const blockInfo: Record<CalibrationBlockType, { figure: string; title: string; standard: string }> = {
    'flat_block': {
      figure: 'FIGURE 4',
      title: 'Flat Block with Flat-Bottom Holes',
      standard: 'MIL-STD-2154 Type I'
    },
    'curved_block': {
      figure: 'FIGURE 3',
      title: 'Convex Surface Reference Block',
      standard: 'MIL-STD-2154 Type I'
    },
    'cylinder_fbh': {
      figure: 'FIGURE 6',
      title: 'Hollow Cylindrical Block with FBH',
      standard: 'MIL-STD-2154 Type I'
    },
    'angle_beam': {
      figure: 'FIGURE 4A',
      title: 'Angle Beam Test Block',
      standard: 'MIL-STD-2154 Type II'
    },
    'cylinder_notched': {
      figure: 'FIGURE 5',
      title: 'Hollow Cylindrical Block (Notched)',
      standard: 'MIL-STD-2154 Type II'
    },
    'iiv_block': {
      figure: 'FIGURE 7',
      title: 'IIW Type Block',
      standard: 'ISO 2400 / AWS'
    },
  };

  const info = blockInfo[blockType];

  return (
    <div className="relative w-full bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden">
      {/* Title Bar - Classic Technical Drawing Style */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 px-6 border-b-2 border-gray-400">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs font-semibold tracking-wider opacity-90">{info.figure}</div>
            <div className="text-sm font-bold mt-0.5">{info.title}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">{info.standard}</div>
            <div className="text-xs opacity-75 mt-0.5">ULTRASONIC CALIBRATION</div>
          </div>
        </div>
      </div>

      {/* Drawing Area */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8" style={{ minHeight: `${height}px` }}>
        {/* Technical Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Technical Drawing SVG */}
        <div className="relative flex items-center justify-center" style={{ height: `${height - 100}px` }}>
          {renderTechnicalDrawing(blockType, width - 100, height - 100)}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-gray-100 border-t-2 border-gray-300 px-6 py-2 flex justify-between items-center text-xs text-gray-600">
        <div className="font-mono">REF: {blockType.toUpperCase()}</div>
        <div className="flex gap-4">
          <span>SCALE: NTS</span>
          <span className="font-semibold">UNITS: mm</span>
        </div>
      </div>
    </div>
  );
};

function renderTechnicalDrawing(blockType: CalibrationBlockType, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;

  switch (blockType) {
    case 'flat_block':
      return <FlatBlockDrawing cx={centerX} cy={centerY} scale={1} />;
    case 'curved_block':
      return <CurvedBlockDrawing cx={centerX} cy={centerY} scale={1} />;
    case 'cylinder_fbh':
      return <HollowCylinderFBHDrawing cx={centerX} cy={centerY} scale={1} />;
    case 'angle_beam':
      return <AngleBeamBlockDrawing cx={centerX} cy={centerY} scale={1} />;
    case 'cylinder_notched':
      return <HollowCylinderNotchedDrawing cx={centerX} cy={centerY} scale={1} />;
    case 'iiv_block':
      return <IIWBlockDrawing cx={centerX} cy={centerY} scale={1} />;
    default:
      return null;
  }
}

// ==================== FLAT BLOCK WITH FBH ====================
function FlatBlockDrawing({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const blockW = 140 * scale;
  const blockH = 60 * scale;
  const x = cx - blockW / 2;
  const y = cy - blockH / 2;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cx * 2} ${cy * 2}`} className="drop-shadow-md">
      {/* Main Block */}
      <rect 
        x={x} y={y} 
        width={blockW} height={blockH} 
        fill="none" 
        stroke="#1e40af" 
        strokeWidth="2.5"
        className="animate-fade-in"
      />
      
      {/* Cross-section lines */}
      <line x1={x} y1={y + 15} x2={x + blockW} y2={y + 15} stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      
      {/* Flat-Bottom Holes (FBH) - 3 holes at different depths */}
      <g className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {/* Hole 1 - 3/64" */}
        <circle cx={x + blockW * 0.25} cy={cy} r="4" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <line x1={x + blockW * 0.25} y1={cy} x2={x + blockW * 0.25} y2={y + blockH - 15} stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
        <text x={x + blockW * 0.25} y={y - 8} textAnchor="middle" fontSize="10" fill="#991b1b" fontWeight="600">Ø3/64"</text>
        
        {/* Hole 2 - 5/64" */}
        <circle cx={cx} cy={cy} r="5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <line x1={cx} y1={cy} x2={cx} y2={y + blockH - 20} stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
        <text x={cx} y={y - 8} textAnchor="middle" fontSize="10" fill="#991b1b" fontWeight="600">Ø5/64"</text>
        
        {/* Hole 3 - 8/64" */}
        <circle cx={x + blockW * 0.75} cy={cy} r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <line x1={x + blockW * 0.75} y1={cy} x2={x + blockW * 0.75} y2={y + blockH - 25} stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
        <text x={x + blockW * 0.75} y={y - 8} textAnchor="middle" fontSize="10" fill="#991b1b" fontWeight="600">Ø8/64"</text>
      </g>

      {/* Dimensions */}
      <g className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        {/* Length dimension */}
        <DimensionLine x1={x} y1={y + blockH + 20} x2={x + blockW} y2={y + blockH + 20} label="L = 100" />
        
        {/* Height dimension */}
        <DimensionLine x1={x - 20} y1={y} x2={x - 20} y2={y + blockH} label="H = 25" vertical />
        
        {/* Depth markers */}
        <text x={x + blockW * 0.25} y={y + blockH - 5} textAnchor="middle" fontSize="8" fill="#1e40af" opacity="0.7">d₁</text>
        <text x={cx} y={y + blockH - 10} textAnchor="middle" fontSize="8" fill="#1e40af" opacity="0.7">d₂</text>
        <text x={x + blockW * 0.75} y={y + blockH - 15} textAnchor="middle" fontSize="8" fill="#1e40af" opacity="0.7">d₃</text>
      </g>
    </svg>
  );
}

// ==================== CURVED BLOCK ====================
function CurvedBlockDrawing({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const blockW = 140 * scale;
  const blockH = 70 * scale;
  const radius = 80 * scale;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cx * 2} ${cy * 2}`} className="drop-shadow-md">
      {/* Curved surface using path */}
      <g className="animate-fade-in">
        <path 
          d={`M ${cx - blockW/2} ${cy + blockH/2} 
              Q ${cx} ${cy - blockH/2} ${cx + blockW/2} ${cy + blockH/2} 
              L ${cx + blockW/2} ${cy + blockH/2 + 20}
              L ${cx - blockW/2} ${cy + blockH/2 + 20} Z`}
          fill="none"
          stroke="#1e40af"
          strokeWidth="2.5"
        />
        
        {/* Center line */}
        <line 
          x1={cx} y1={cy - blockH/2 - 20} 
          x2={cx} y2={cy + blockH/2 + 30} 
          stroke="#3b82f6" 
          strokeWidth="1" 
          strokeDasharray="4,4"
          opacity="0.5"
        />
      </g>

      {/* Radius indicator */}
      <g className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <line x1={cx} y1={cy - blockH/2} x2={cx + 40} y2={cy - 10} stroke="#10b981" strokeWidth="1.5" />
        <circle cx={cx} cy={cy - blockH/2} r="3" fill="#10b981" />
        <text x={cx + 50} y={cy - 5} fontSize="11" fill="#059669" fontWeight="600">R = 50mm</text>
      </g>

      {/* Dimensions */}
      <g className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <DimensionLine x1={cx - blockW/2} y1={cy + blockH/2 + 40} x2={cx + blockW/2} y2={cy + blockH/2 + 40} label="L = 100" />
        <text x={cx} y={cy + blockH/2 + 60} textAnchor="middle" fontSize="9" fill="#6b7280">Convex Surface</text>
      </g>
    </svg>
  );
}

// ==================== HOLLOW CYLINDER WITH FBH ====================
function HollowCylinderFBHDrawing({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const outerR = 50 * scale;
  const innerR = 35 * scale;
  const wallThickness = outerR - innerR;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cx * 2} ${cy * 2}`} className="drop-shadow-md">
      {/* Outer circle */}
      <circle 
        cx={cx} cy={cy} r={outerR} 
        fill="none" 
        stroke="#1e40af" 
        strokeWidth="2.5"
        className="animate-scale-in"
      />
      
      {/* Inner circle */}
      <circle 
        cx={cx} cy={cy} r={innerR} 
        fill="none" 
        stroke="#1e40af" 
        strokeWidth="2"
        className="animate-scale-in"
        style={{ animationDelay: '0.1s' }}
      />

      {/* Cross-section hatch */}
      <defs>
        <pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>
      <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="url(#hatch)" opacity="0.3" />

      {/* FBH positions - 4 holes at 90° intervals */}
      <g className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const fbhR = (outerR + innerR) / 2;
          const fbhX = cx + fbhR * Math.cos(rad);
          const fbhY = cy + fbhR * Math.sin(rad);
          
          return (
            <g key={i}>
              <circle cx={fbhX} cy={fbhY} r="3.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx={fbhX} cy={fbhY} r="5" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
            </g>
          );
        })}
      </g>

      {/* Dimensions */}
      <g className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        {/* OD */}
        <line x1={cx} y1={cy} x2={cx + outerR} y2={cy} stroke="#10b981" strokeWidth="1.5" />
        <text x={cx + outerR/2} y={cy - 5} textAnchor="middle" fontSize="10" fill="#059669" fontWeight="600">OD</text>
        
        {/* Wall thickness */}
        <line x1={cx} y1={cy + 10} x2={cx + innerR} y2={cy + 10} stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx + innerR + 10} y={cy + 13} fontSize="10" fill="#d97706" fontWeight="600">t = {wallThickness.toFixed(0)}</text>
        
        {/* ID label */}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="9" fill="#1e40af" fontWeight="600">ID</text>
      </g>

      {/* FBH label */}
      <text x={cx} y={cy - outerR - 15} textAnchor="middle" fontSize="10" fill="#991b1b" fontWeight="600">4 × FBH Ø3/64"</text>
    </svg>
  );
}

// ==================== ANGLE BEAM TEST BLOCK ====================
function AngleBeamBlockDrawing({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const blockW = 150 * scale;
  const blockH = 50 * scale;
  const x = cx - blockW / 2;
  const y = cy - blockH / 2;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cx * 2} ${cy * 2}`} className="drop-shadow-md">
      {/* Main block */}
      <rect 
        x={x} y={y} 
        width={blockW} height={blockH} 
        fill="none" 
        stroke="#1e40af" 
        strokeWidth="2.5"
        className="animate-fade-in"
      />

      {/* Side-drilled holes (SDH) - for angle beam calibration */}
      <g className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {/* Hole 1 */}
        <circle cx={x + blockW * 0.2} cy={cy} r="4.5" fill="none" stroke="#ef4444" strokeWidth="2" />
        <circle cx={x + blockW * 0.2} cy={cy} r="2" fill="#ef4444" />
        <text x={x + blockW * 0.2} y={y - 10} textAnchor="middle" fontSize="9" fill="#991b1b" fontWeight="600">SDH-1</text>
        
        {/* Hole 2 */}
        <circle cx={cx} cy={cy} r="4.5" fill="none" stroke="#ef4444" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="2" fill="#ef4444" />
        <text x={cx} y={y - 10} textAnchor="middle" fontSize="9" fill="#991b1b" fontWeight="600">SDH-2</text>
        
        {/* Hole 3 */}
        <circle cx={x + blockW * 0.8} cy={cy} r="4.5" fill="none" stroke="#ef4444" strokeWidth="2" />
        <circle cx={x + blockW * 0.8} cy={cy} r="2" fill="#ef4444" />
        <text x={x + blockW * 0.8} y={y - 10} textAnchor="middle" fontSize="9" fill="#991b1b" fontWeight="600">SDH-3</text>
      </g>

      {/* Angle beam indicators - 45°, 60°, 70° */}
      <g className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <line x1={x - 30} y1={y + blockH} x2={x + blockW * 0.2} y2={cy - 10} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
        <line x1={x - 30} y1={y + blockH} x2={cx} y2={cy - 15} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
        <line x1={x - 30} y1={y + blockH} x2={x + blockW * 0.8} y2={cy - 5} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
        
        <text x={x - 35} y={y + blockH + 15} fontSize="10" fill="#059669" fontWeight="600">45° / 60° / 70°</text>
      </g>

      {/* Dimensions */}
      <g className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <DimensionLine x1={x} y1={y + blockH + 25} x2={x + blockW} y2={y + blockH + 25} label="L = 100" />
        <DimensionLine x1={x - 25} y1={y} x2={x - 25} y2={y + blockH} label="H = 25" vertical />
      </g>
    </svg>
  );
}

// ==================== HOLLOW CYLINDER NOTCHED ====================
function HollowCylinderNotchedDrawing({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const outerR = 50 * scale;
  const innerR = 35 * scale;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cx * 2} ${cy * 2}`} className="drop-shadow-md">
      {/* Outer circle */}
      <circle 
        cx={cx} cy={cy} r={outerR} 
        fill="none" 
        stroke="#1e40af" 
        strokeWidth="2.5"
        className="animate-scale-in"
      />
      
      {/* Inner circle */}
      <circle 
        cx={cx} cy={cy} r={innerR} 
        fill="none" 
        stroke="#1e40af" 
        strokeWidth="2"
        className="animate-scale-in"
        style={{ animationDelay: '0.1s' }}
      />

      {/* Notches - 4 positions at 90° intervals */}
      <g className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const notchX = cx + outerR * Math.cos(rad);
          const notchY = cy + outerR * Math.sin(rad);
          const notchW = 3;
          const notchL = 12;
          
          return (
            <g key={i}>
              {/* Notch representation */}
              <rect
                x={notchX - notchW / 2}
                y={notchY - notchL / 2}
                width={notchW}
                height={notchL}
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth="1"
                transform={`rotate(${angle}, ${notchX}, ${notchY})`}
              />
              {/* Notch indicator line */}
              <line
                x1={notchX}
                y1={notchY}
                x2={notchX + (outerR * 0.3) * Math.cos(rad)}
                y2={notchY + (outerR * 0.3) * Math.sin(rad)}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.6"
              />
            </g>
          );
        })}
      </g>

      {/* Labels */}
      <g className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <text x={cx} y={cy - outerR - 15} textAnchor="middle" fontSize="10" fill="#d97706" fontWeight="600">4 × Notches (20% wall)</text>
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="9" fill="#1e40af" opacity="0.7">Circumferential</text>
      </g>

      {/* Dimensions */}
      <g className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <line x1={cx} y1={cy} x2={cx + outerR} y2={cy} stroke="#10b981" strokeWidth="1.5" />
        <text x={cx + outerR/2} y={cy - 5} textAnchor="middle" fontSize="10" fill="#059669" fontWeight="600">OD</text>
      </g>
    </svg>
  );
}

// ==================== IIW BLOCK ====================
function IIWBlockDrawing({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const blockW = 160 * scale;
  const blockH = 55 * scale;
  const x = cx - blockW / 2;
  const y = cy - blockH / 2;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cx * 2} ${cy * 2}`} className="drop-shadow-md">
      {/* Main block outline */}
      <path
        d={`M ${x} ${y} 
            L ${x + blockW} ${y}
            L ${x + blockW} ${y + blockH}
            L ${x} ${y + blockH} Z`}
        fill="none"
        stroke="#1e40af"
        strokeWidth="2.5"
        className="animate-fade-in"
      />

      {/* Step section (left side) */}
      <g className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <rect x={x} y={y} width={blockW * 0.25} height={blockH * 0.5} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <line x1={x + blockW * 0.25} y1={y + blockH * 0.5} x2={x + blockW * 0.25} y2={y + blockH} stroke="#3b82f6" strokeWidth="2" />
      </g>

      {/* Radius section (right side) */}
      <g className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <ellipse 
          cx={x + blockW * 0.7} 
          cy={cy - blockH * 0.15} 
          rx={blockW * 0.2} 
          ry={blockH * 0.35} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1.5"
        />
        <text x={x + blockW * 0.7} y={y - 10} textAnchor="middle" fontSize="9" fill="#1e40af" fontWeight="600">R100</text>
      </g>

      {/* Holes for calibration */}
      <g className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <circle cx={x + blockW * 0.15} cy={cy} r="3.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <circle cx={x + blockW * 0.4} cy={cy} r="3.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <circle cx={x + blockW * 0.85} cy={cy} r="3.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
      </g>

      {/* Dimension lines */}
      <g className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <DimensionLine x1={x} y1={y + blockH + 25} x2={x + blockW} y2={y + blockH + 25} label="L = 100" />
        <text x={cx} y={y - 20} textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="700">IIW Type 1</text>
      </g>
    </svg>
  );
}

// ==================== DIMENSION LINE COMPONENT ====================
function DimensionLine({ 
  x1, y1, x2, y2, label, vertical = false 
}: { 
  x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean 
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  return (
    <g className="dimension-line">
      {/* Main line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth="1.2" />
      
      {/* End markers */}
      <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke="#6b7280" strokeWidth="1.5" />
      <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke="#6b7280" strokeWidth="1.5" />
      
      {/* Label */}
      <text 
        x={midX} 
        y={midY + (vertical ? 0 : -5)} 
        textAnchor="middle" 
        fontSize="10" 
        fill="#374151" 
        fontWeight="600"
        transform={vertical ? `rotate(-90, ${midX}, ${midY})` : ''}
      >
        {label}
      </text>
    </g>
  );
}
