import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ScanVisualization {
  scanningDirection: string;
  waveMode: string;
  mode: 'Longitudinal0' | 'Shear45' | 'Shear60' | 'Shear70';
  path: 'Axial' | 'Circumferential' | 'Radial' | 'Helix';
  side: 'A' | 'B';
  direction?: 'CW' | 'CCW' | 'None';
}

interface ScanDirectionVisualizerProps {
  partType: string;
  dimensions: {
    outerDiameter?: number;
    innerDiameter?: number;
    length?: number;
    thickness?: number;
    width?: number;
    height?: number;
  };
  scans: ScanVisualization[];
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
];

export const ScanDirectionVisualizer: React.FC<ScanDirectionVisualizerProps> = ({
  partType,
  dimensions,
  scans
}) => {
  const isRingOrTube = partType.toLowerCase().includes('ring') || 
                       partType.toLowerCase().includes('tube');
  const isDisk = partType.toLowerCase().includes('disk');
  const isHex = partType.toLowerCase().includes('hex');
  
  const od = dimensions.outerDiameter || 100;
  const id = dimensions.innerDiameter || 60;
  const length = dimensions.length || 80;
  
  // SVG dimensions
  const svgWidth = 400;
  const svgHeight = 300;
  const centerX = 200;
  const centerY = 150;
  
  // Scale factors
  const scale = Math.min(140 / od, 140 / od);
  const rOuter = (od / 2) * scale;
  const rInner = (id / 2) * scale;
  
  const renderPlanView = () => {
    return (
      <svg width={svgWidth} height={svgHeight} className="border border-border rounded-lg bg-card">
        {/* Title */}
        <text x={centerX} y={25} textAnchor="middle" className="fill-foreground font-semibold text-sm">
          Plan View (מבט על) - SIDE A
        </text>
        
        {/* Coordinate system */}
        <g>
          {/* R axis (radial) */}
          <line x1={centerX} y1={centerY} x2={centerX + rOuter + 30} y2={centerY} 
                stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowR)" />
          <text x={centerX + rOuter + 40} y={centerY + 5} className="fill-primary font-semibold text-xs">R</text>
          
          {/* X axis (circumferential reference) */}
          <line x1={centerX} y1={centerY} x2={centerX} y2={centerY - rOuter - 30} 
                stroke="#10B981" strokeWidth="2" markerEnd="url(#arrowX)" />
          <text x={centerX + 5} y={centerY - rOuter - 35} className="fill-green-600 font-semibold text-xs">X</text>
        </g>
        
        {/* Arrow markers */}
        <defs>
          <marker id="arrowR" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3B82F6" />
          </marker>
          <marker id="arrowX" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#10B981" />
          </marker>
          <marker id="arrowCW" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L7,3 z" fill="#EF4444" />
          </marker>
        </defs>
        
        {/* Part outline */}
        {(isRingOrTube || isDisk) && (
          <>
            <circle cx={centerX} cy={centerY} r={rOuter} fill="none" stroke="currentColor" strokeWidth="2" />
            {isRingOrTube && id > 0 && (
              <circle cx={centerX} cy={centerY} r={rInner} fill="none" stroke="currentColor" strokeWidth="2" />
            )}
          </>
        )}
        
        {isHex && (
          <polygon 
            points={Array.from({length: 6}, (_, i) => {
              const angle = (i * 60 - 90) * Math.PI / 180;
              return `${centerX + rOuter * Math.cos(angle)},${centerY + rOuter * Math.sin(angle)}`;
            }).join(' ')}
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          />
        )}
        
        {/* Render scan paths */}
        {scans.map((scan, idx) => {
          const color = COLORS[idx % COLORS.length];
          
          if (scan.path === 'Circumferential') {
            // Draw arc with direction
            const startAngle = 45;
            const endAngle = 315;
            const radius = (rOuter + rInner) / 2;
            
            const arcPath = describeArc(centerX, centerY, radius, startAngle, endAngle);
            
            return (
              <g key={idx}>
                <path d={arcPath} fill="none" stroke={color} strokeWidth="3" opacity="0.7" />
                {scan.direction === 'CW' && (
                  <path d={`M ${centerX + radius} ${centerY} l 10,-5 l 0,10 z`} fill={color} />
                )}
                {scan.direction === 'CCW' && (
                  <path d={`M ${centerX + radius} ${centerY} l -10,-5 l 0,10 z`} fill={color} />
                )}
              </g>
            );
          }
          
          if (scan.path === 'Radial') {
            const angle = (idx * 60) * Math.PI / 180;
            const x1 = centerX + rInner * Math.cos(angle);
            const y1 = centerY + rInner * Math.sin(angle);
            const x2 = centerX + rOuter * Math.cos(angle);
            const y2 = centerY + rOuter * Math.sin(angle);
            
            return (
              <g key={idx}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" opacity="0.7" />
                <circle cx={x1} cy={y1} r="4" fill={color} />
              </g>
            );
          }
          
          if (scan.path === 'Axial') {
            // Show as point in plan view
            return (
              <g key={idx}>
                <circle cx={centerX} cy={centerY} r="8" fill={color} opacity="0.5" />
                <text x={centerX} y={centerY + 4} textAnchor="middle" className="fill-background text-xs font-bold">⊙</text>
              </g>
            );
          }
          
          return null;
        })}
        
        {/* Labels */}
        <text x={20} y={svgHeight - 10} className="fill-muted-foreground text-xs">
          תרשים מבט על
        </text>
      </svg>
    );
  };
  
  const renderSectionView = () => {
    const wallThickness = (od - id) / 2;
    const sectionWidth = length * scale;
    const sectionHeight = od * scale;
    
    return (
      <svg width={svgWidth} height={svgHeight} className="border border-border rounded-lg bg-card">
        {/* Title */}
        <text x={centerX} y={25} textAnchor="middle" className="fill-foreground font-semibold text-sm">
          Section View (מבט חתך) - A-A
        </text>
        
        {/* Coordinate system */}
        <g>
          {/* Z axis (axial) */}
          <line x1={centerX - sectionWidth/2 - 30} y1={centerY} x2={centerX + sectionWidth/2 + 30} y2={centerY} 
                stroke="#8B5CF6" strokeWidth="2" />
          <text x={centerX + sectionWidth/2 + 40} y={centerY + 5} className="fill-purple-600 font-semibold text-xs">Z</text>
          
          {/* R axis (radial) */}
          <line x1={centerX} y1={centerY + sectionHeight/2 + 30} x2={centerX} y2={centerY - sectionHeight/2 - 30} 
                stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowR2)" />
          <text x={centerX + 5} y={centerY - sectionHeight/2 - 35} className="fill-primary font-semibold text-xs">R</text>
        </g>
        
        <defs>
          <marker id="arrowR2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3B82F6" />
          </marker>
        </defs>
        
        {/* Part cross-section */}
        {(isRingOrTube || isDisk) && (
          <>
            {/* Outer walls */}
            <rect 
              x={centerX - sectionWidth/2} 
              y={centerY - sectionHeight/2} 
              width={sectionWidth} 
              height={wallThickness * scale}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect 
              x={centerX - sectionWidth/2} 
              y={centerY + sectionHeight/2 - wallThickness * scale} 
              width={sectionWidth} 
              height={wallThickness * scale}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            
            {/* Side walls for ring/tube */}
            {isRingOrTube && (
              <>
                <line 
                  x1={centerX - sectionWidth/2} 
                  y1={centerY - sectionHeight/2 + wallThickness * scale}
                  x2={centerX - sectionWidth/2}
                  y2={centerY + sectionHeight/2 - wallThickness * scale}
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line 
                  x1={centerX + sectionWidth/2} 
                  y1={centerY - sectionHeight/2 + wallThickness * scale}
                  x2={centerX + sectionWidth/2}
                  y2={centerY + sectionHeight/2 - wallThickness * scale}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </>
            )}
          </>
        )}
        
        {/* Render scan paths in section */}
        {scans.map((scan, idx) => {
          const color = COLORS[idx % COLORS.length];
          
          if (scan.path === 'Axial') {
            return (
              <g key={idx}>
                <line 
                  x1={centerX - sectionWidth/2 + 20} 
                  y1={centerY}
                  x2={centerX + sectionWidth/2 - 20}
                  y2={centerY}
                  stroke={color}
                  strokeWidth="3"
                  opacity="0.7"
                  strokeDasharray="5,5"
                />
                <polygon 
                  points={`${centerX + sectionWidth/2 - 25},${centerY - 5} ${centerX + sectionWidth/2 - 20},${centerY} ${centerX + sectionWidth/2 - 25},${centerY + 5}`}
                  fill={color}
                />
              </g>
            );
          }
          
          if (scan.path === 'Radial') {
            return (
              <g key={idx}>
                <line 
                  x1={centerX}
                  y1={centerY - sectionHeight/2 + 10}
                  x2={centerX}
                  y2={centerY + sectionHeight/2 - 10}
                  stroke={color}
                  strokeWidth="3"
                  opacity="0.7"
                />
                <polygon 
                  points={`${centerX - 5},${centerY - sectionHeight/2 + 15} ${centerX},${centerY - sectionHeight/2 + 10} ${centerX + 5},${centerY - sectionHeight/2 + 15}`}
                  fill={color}
                />
              </g>
            );
          }
          
          if (scan.path === 'Circumferential') {
            // Show as cross-section bands
            const y = centerY - sectionHeight/2 + wallThickness * scale / 2;
            return (
              <g key={idx}>
                <rect
                  x={centerX - sectionWidth/2 + 10}
                  y={y - 2}
                  width={sectionWidth - 20}
                  height={4}
                  fill={color}
                  opacity="0.5"
                />
              </g>
            );
          }
          
          return null;
        })}
        
        {/* Side labels */}
        <text x={centerX - sectionWidth/2 - 40} y={centerY} className="fill-foreground font-semibold text-sm">
          SIDE A
        </text>
        <text x={centerX + sectionWidth/2 + 20} y={centerY} className="fill-foreground font-semibold text-sm">
          SIDE B
        </text>
        
        <text x={20} y={svgHeight - 10} className="fill-muted-foreground text-xs">
          חתך רוחבי
        </text>
      </svg>
    );
  };
  
  // Helper function to describe arc path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  if (scans.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Scan Direction Visualization (הדמיית כיווני סריקה)</h3>
          <Badge variant="secondary">MIL-STD-2154 Compliant</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderPlanView()}
          {renderSectionView()}
        </div>
        
        {/* Legend */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Scan Legend (מקרא):</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {scans.map((scan, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="font-medium">{scan.scanningDirection}:</span>
                <span className="text-muted-foreground">
                  {scan.path} - {scan.mode}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Technical notes */}
        <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground space-y-1">
          <p>• <strong>R</strong> = Radial direction (כיוון רדיאלי)</p>
          <p>• <strong>X</strong> = Circumferential reference (ייחוס היקפי)</p>
          <p>• <strong>Z</strong> = Axial/Length direction (כיוון אורכי)</p>
          <p>• <strong>CW/CCW</strong> = Clockwise/Counter-clockwise (עם/נגד כיוון השעון)</p>
        </div>
      </div>
    </Card>
  );
};
