import { useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.font = '10px Arial';
    ctx.fillStyle = '#000000';

    // Draw based on block type
    switch (blockType) {
      case 'flat_block':
        drawFlatBlock(ctx, width, height);
        break;
      case 'curved_block':
        drawCurvedBlock(ctx, width, height);
        break;
      case 'cylinder_fbh':
        drawHollowCylindricalFBH(ctx, width, height);
        break;
      case 'angle_beam':
        drawAngleBeamBlock(ctx, width, height);
        break;
      case 'cylinder_notched':
        drawHollowCylindricalNotched(ctx, width, height);
        break;
      case 'iiv_block':
        drawIIVBlock(ctx, width, height);
        break;
    }
  }, [blockType, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />;
};

// Flat Block with FBH - Based on MIL-STD-2154 Figure 4
function drawFlatBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = 2.5;
  const centerX = width / 2;
  const baseY = height - 40;
  
  // Main block dimensions (scaled)
  const blockLength = 80 * scale;
  const blockHeight = 30 * scale;
  const blockX = centerX - blockLength / 2;
  
  // Draw main block
  ctx.lineWidth = 2;
  ctx.strokeRect(blockX, baseY - blockHeight, blockLength, blockHeight);
  
  // FBH holes: 3/64", 5/64", 8/64" diameter (0.047", 0.078", 0.125")
  const holes = [
    { dia: 3/64, depth: 0.375, label: '3/64"', pos: 0.25 },
    { dia: 5/64, depth: 0.5, label: '5/64"', pos: 0.5 },
    { dia: 8/64, depth: 0.625, label: '8/64"', pos: 0.75 }
  ];
  
  holes.forEach(hole => {
    const holeX = blockX + blockLength * hole.pos;
    const holeDepth = hole.depth * 25.4 * scale; // inch to mm
    const holeDia = hole.dia * 25.4 * scale;
    const holeY = baseY - holeDepth;
    
    // Draw FBH (flat bottom)
    ctx.fillStyle = '#666';
    ctx.fillRect(holeX - holeDia/2, holeY, holeDia, 2);
    
    // Dashed centerline
    ctx.setLineDash([3, 2]);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(holeX, baseY - blockHeight);
    ctx.lineTo(holeX, holeY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Hole indicator circle
    ctx.beginPath();
    ctx.arc(holeX, holeY - 3, holeDia/2 + 1, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#000';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(hole.label, holeX, baseY + 15);
    ctx.fillText(`d=${(hole.depth).toFixed(3)}"`, holeX, holeY - 15);
  });
  
  // Dimensions
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  
  // Title
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Flat Block with FBH', 10, 20);
  ctx.font = '10px Arial';
  ctx.fillText('MIL-STD-2154 - Figure 4', 10, 35);
}

// Convex Surface Reference Block - MIL-STD-2154 Figure 3
function drawCurvedBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = 25;
  const centerX = width / 2;
  const baseY = height - 50;
  
  // Using R=2.0 configuration from table (common size)
  const R = 2.0; // radius in inches
  const A = 0.425, B = 1.5, C = 1.5, D = 1.5;
  
  const radius = R * scale;
  const heightA = A * scale;
  const widthB = B * scale;
  const lengthC = C * scale;
  
  ctx.lineWidth = 2;
  
  // Draw curved surface (convex)
  const curveStartX = centerX - widthB;
  const curveEndX = centerX + widthB;
  const curveY = baseY - heightA;
  
  ctx.beginPath();
  ctx.arc(centerX, curveY + radius, radius, Math.PI * 0.7, Math.PI * 0.3, true);
  ctx.stroke();
  
  // Draw side walls
  ctx.beginPath();
  ctx.moveTo(curveStartX, curveY);
  ctx.lineTo(curveStartX, baseY);
  ctx.lineTo(curveEndX, baseY);
  ctx.lineTo(curveEndX, curveY);
  ctx.stroke();
  
  // FBH holes positions
  const holes = [
    { offset: -0.5, depth: 0.375, dia: '3/64"' },
    { offset: 0, depth: 0.5, dia: '5/64"' },
    { offset: 0.5, depth: 0.625, dia: '8/64"' }
  ];
  
  holes.forEach(hole => {
    const holeAngle = hole.offset * 0.4;
    const surfaceX = centerX + Math.sin(holeAngle) * radius;
    const surfaceY = curveY + radius - Math.cos(holeAngle) * radius;
    
    // Hole marker
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(surfaceX, surfaceY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Dashed line to hole
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = '#666';
    const depthPx = hole.depth * scale;
    const normalX = Math.sin(holeAngle);
    const normalY = -Math.cos(holeAngle);
    ctx.beginPath();
    ctx.moveTo(surfaceX, surfaceY);
    ctx.lineTo(surfaceX - normalX * depthPx, surfaceY - normalY * depthPx);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#000';
  });
  
  // Radius dimension
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(centerX, curveY + radius);
  ctx.lineTo(centerX, curveY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = '#000';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`R = ${R}"`, centerX + 15, curveY + radius / 2);
  
  // Grain flow indicator
  ctx.font = '8px Arial';
  ctx.fillText('← Grain Flow', centerX, baseY + 20);
  
  // Title
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Convex Surface Reference Block', 10, 20);
  ctx.font = '10px Arial';
  ctx.fillText('MIL-STD-2154 - Figure 3', 10, 35);
}

// Hollow Cylindrical FBH - MIL-STD-2154 Figures 5 & 6
function drawHollowCylindricalFBH(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = 20;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Cylinder dimensions
  const Ro = 2.0; // outer radius (inches)
  const Ri = 1.5; // inner radius
  const length = 6.0;
  
  const outerRad = Ro * scale;
  const innerRad = Ri * scale;
  const cylinderLength = length * scale;
  
  ctx.lineWidth = 2;
  
  // Front face (left)
  const leftX = centerX - cylinderLength / 2;
  
  // Outer circle
  ctx.beginPath();
  ctx.arc(leftX, centerY, outerRad, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner circle
  ctx.beginPath();
  ctx.arc(leftX, centerY, innerRad, 0, Math.PI * 2);
  ctx.stroke();
  
  // Back face (right) - only visible parts
  const rightX = centerX + cylinderLength / 2;
  
  ctx.beginPath();
  ctx.arc(rightX, centerY, outerRad, -Math.PI/2, Math.PI/2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(rightX, centerY, innerRad, -Math.PI/2, Math.PI/2);
  ctx.stroke();
  
  // Connecting lines (top and bottom)
  ctx.beginPath();
  ctx.moveTo(leftX, centerY - outerRad);
  ctx.lineTo(rightX, centerY - outerRad);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(leftX, centerY + outerRad);
  ctx.lineTo(rightX, centerY + outerRad);
  ctx.stroke();
  
  // FBH holes: 3/64", 5/64", 8/64" at depth d=0.375±0.125"
  const fbhDepth = 0.375;
  const holes = [
    { dia: 3/64, pos: 0.3, label: '3/64"' },
    { dia: 5/64, pos: 0.5, label: '5/64"' },
    { dia: 8/64, pos: 0.7, label: '8/64"' }
  ];
  
  ctx.fillStyle = '#555';
  holes.forEach(hole => {
    const holeX = leftX + cylinderLength * hole.pos;
    const holeDia = hole.dia * 25.4 * scale / 8;
    
    // FBH circle on outer surface
    ctx.beginPath();
    ctx.arc(holeX, centerY - outerRad + 2, holeDia/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    // Dashed centerline
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(holeX, centerY - outerRad);
    ctx.lineTo(holeX, centerY - outerRad + fbhDepth * scale);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // Label
    ctx.fillStyle = '#000';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(hole.label, holeX, centerY + outerRad + 15);
  });
  
  // Dimensions
  ctx.font = '9px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'left';
  ctx.fillText(`OD = ${(Ro * 2).toFixed(1)}"`, leftX - outerRad - 35, centerY - outerRad - 10);
  ctx.fillText(`ID = ${(Ri * 2).toFixed(1)}"`, leftX - innerRad - 35, centerY + innerRad + 10);
  ctx.fillText(`L = ${length}"`, rightX + 10, centerY);
  ctx.fillText(`FBH depth = ${fbhDepth}±0.125"`, leftX, centerY - outerRad - 20);
  
  // Title
  ctx.font = 'bold 12px Arial';
  ctx.fillText('Hollow Cylindrical - FBH', 10, 20);
  ctx.font = '10px Arial';
  ctx.fillText('MIL-STD-2154 - Figures 5 & 6', 10, 35);
}

// Angle Beam Block - MIL-STD-2154 Figure 4
function drawAngleBeamBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = 15;
  const centerX = width / 2;
  const baseY = height - 40;
  
  // Block dimensions for T=1" thickness, Φ=60°
  const thickness = 1.0;
  const angle = 60;
  const blockHeight = thickness * scale;
  const blockLength = 120;
  
  ctx.lineWidth = 2;
  
  // Main rectangular block
  const blockX = centerX - blockLength / 2;
  ctx.strokeRect(blockX, baseY - blockHeight, blockLength, blockHeight);
  
  // Surface labels
  ctx.font = '10px Arial';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'center';
  ctx.fillText('Surface C', centerX, baseY - blockHeight - 5);
  ctx.save();
  ctx.translate(blockX - 15, baseY - blockHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Surface A', 0, 0);
  ctx.restore();
  ctx.fillText('Surface B', centerX, baseY + 15);
  
  // Side drilled holes: 3/64", 5/64", 8/64" diameter
  const holes = [
    { dia: 3/64, pos: 0.25, depth: 0.75 },
    { dia: 5/64, pos: 0.5, depth: 0.5 },
    { dia: 8/64, pos: 0.75, depth: 0.25 }
  ];
  
  ctx.fillStyle = '#000';
  holes.forEach(hole => {
    const holeX = blockX + blockLength * hole.pos;
    const holeDepth = hole.depth * blockHeight;
    const holeY = baseY - holeDepth;
    const holeDia = hole.dia * 25.4 * scale / 10;
    
    // Draw SDH (Side Drilled Hole)
    ctx.beginPath();
    ctx.ellipse(holeX, holeY, holeDia * 0.4, holeDia, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#555';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    // Center line
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(holeX, baseY - blockHeight);
    ctx.lineTo(holeX, holeY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Label
    ctx.fillStyle = '#000';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    const diaFraction = hole.dia === 3/64 ? '3/64"' : hole.dia === 5/64 ? '5/64"' : '8/64"';
    ctx.fillText(diaFraction, holeX, baseY + 28);
  });
  
  // Angle beam paths
  ctx.strokeStyle = '#0066cc';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 2]);
  
  // 60° beam path
  const probeX = blockX + 30;
  const beamAngle = (90 - angle) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(probeX, baseY - blockHeight);
  ctx.lineTo(probeX + Math.tan(beamAngle) * blockHeight, baseY);
  ctx.stroke();
  
  ctx.setLineDash([]);
  ctx.strokeStyle = '#000';
  
  // Angle label
  ctx.fillStyle = '#0066cc';
  ctx.font = '10px Arial';
  ctx.fillText(`Φ = ${angle}°`, probeX + 20, baseY - blockHeight / 2);
  
  // Title
  ctx.fillStyle = '#000';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Angle Beam Test Block', 10, 20);
  ctx.font = '10px Arial';
  ctx.fillText('MIL-STD-2154 - Figure 4', 10, 35);
  ctx.font = '8px Arial';
  ctx.fillText(`T = ${thickness}", Φ = ${angle}°`, 10, 48);
}

// Hollow Cylindrical Notched - MIL-STD-2154 Figure 5
function drawHollowCylindricalNotched(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = 18;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Cylinder dimensions
  const Ro = 2.0;
  const Ri = 1.6;
  const length = 6.0;
  
  const outerRad = Ro * scale;
  const innerRad = Ri * scale;
  const cylinderLength = length * scale;
  
  ctx.lineWidth = 2;
  
  // Front face
  const leftX = centerX - cylinderLength / 2;
  
  ctx.beginPath();
  ctx.arc(leftX, centerY, outerRad, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(leftX, centerY, innerRad, 0, Math.PI * 2);
  ctx.stroke();
  
  // Back face
  const rightX = centerX + cylinderLength / 2;
  
  ctx.beginPath();
  ctx.arc(rightX, centerY, outerRad, -Math.PI/2, Math.PI/2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(rightX, centerY, innerRad, -Math.PI/2, Math.PI/2);
  ctx.stroke();
  
  // Connecting lines
  ctx.beginPath();
  ctx.moveTo(leftX, centerY - outerRad);
  ctx.lineTo(rightX, centerY - outerRad);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(leftX, centerY + outerRad);
  ctx.lineTo(rightX, centerY + outerRad);
  ctx.stroke();
  
  // Notches cut with end mill - Figure 5 specification
  // Notches at 0°, 90°, 180°, 270° positions
  const notches = [
    { angle: 0, label: '0°' },
    { angle: 90, label: '90°' },
    { angle: 180, label: '180°' },
    { angle: 270, label: '270°' }
  ];
  
  ctx.fillStyle = '#222';
  notches.forEach(notch => {
    const angleRad = notch.angle * Math.PI / 180;
    const notchX = leftX + cylinderLength * 0.3 + (notches.indexOf(notch) * cylinderLength * 0.15);
    const notchY = centerY - Math.cos(angleRad) * outerRad;
    const notchWidth = 3;
    const notchDepth = 8;
    
    // Draw notch as rectangle
    ctx.save();
    ctx.translate(notchX, notchY);
    ctx.rotate(angleRad);
    ctx.fillRect(-notchWidth/2, 0, notchWidth, notchDepth);
    ctx.strokeRect(-notchWidth/2, 0, notchWidth, notchDepth);
    ctx.restore();
    
    // Angle label
    ctx.fillStyle = '#0066cc';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(notch.label, notchX, centerY + outerRad + 20);
    ctx.fillStyle = '#000';
  });
  
  // View indicator
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('View C →', leftX - 45, centerY);
  
  // Notch dimensions
  ctx.font = '8px Arial';
  ctx.fillText('Notches: End mill cut', centerX, centerY - outerRad - 15);
  ctx.fillText('Per Figure 5 - MIL-STD-2154', centerX, centerY - outerRad - 5);
  
  // Dimensions
  ctx.font = '9px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`OD = ${(Ro * 2).toFixed(1)}"`, leftX - outerRad - 35, centerY - 20);
  ctx.fillText(`ID = ${(Ri * 2).toFixed(1)}"`, leftX - innerRad - 35, centerY + 20);
  
  // Title
  ctx.font = 'bold 12px Arial';
  ctx.fillText('Hollow Cylindrical - Notched', 10, 20);
  ctx.font = '10px Arial';
  ctx.fillText('MIL-STD-2154 - Figure 5', 10, 35);
}

// IIW Reference Block - MIL-STD-2154 Figure 7
function drawIIVBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = 18;
  const centerX = width / 2;
  const baseY = height - 30;
  
  // IIW Block dimensions (in inches)
  const totalLength = 8.0;
  const totalHeight = 4.0;
  const stepHeight = 0.6;
  const stepWidth = 1.4;
  const radius = 1.0;
  
  ctx.lineWidth = 2;
  const blockX = centerX - (totalLength * scale) / 2;
  const topY = baseY - totalHeight * scale;
  
  // Main block outline
  ctx.beginPath();
  ctx.moveTo(blockX, baseY);
  ctx.lineTo(blockX, topY + stepHeight * scale);
  ctx.lineTo(blockX + (totalLength/2 - stepWidth/2) * scale, topY + stepHeight * scale);
  ctx.lineTo(blockX + (totalLength/2 - stepWidth/2) * scale, topY);
  ctx.lineTo(blockX + (totalLength/2 + stepWidth/2) * scale, topY);
  ctx.lineTo(blockX + (totalLength/2 + stepWidth/2) * scale, topY + stepHeight * scale);
  ctx.lineTo(blockX + totalLength * scale, topY + stepHeight * scale);
  ctx.lineTo(blockX + totalLength * scale, baseY);
  ctx.closePath();
  ctx.stroke();
  
  // Radius curves at step corners
  const radiusPx = radius * scale / 8;
  ctx.beginPath();
  ctx.arc(blockX + (totalLength/2 - stepWidth/2) * scale, 
          topY + stepHeight * scale, radiusPx, -Math.PI/2, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(blockX + (totalLength/2 + stepWidth/2) * scale, 
          topY + stepHeight * scale, radiusPx, Math.PI, Math.PI/2, true);
  ctx.stroke();
  
  // SDH holes at different angles: 0.060" diameter
  const holes = [
    { angle: 45, x: 0.2, depth: 1.5 },
    { angle: 50, x: 0.3, depth: 1.8 },
    { angle: 60, x: 0.5, depth: 2.0 },
    { angle: 70, x: 0.7, depth: 1.8 },
    { angle: 80, x: 0.8, depth: 1.5 }
  ];
  
  ctx.fillStyle = '#444';
  holes.forEach(hole => {
    const holeX = blockX + hole.x * totalLength * scale;
    const holeY = baseY - hole.depth * scale;
    
    // Draw hole
    ctx.beginPath();
    ctx.arc(holeX, holeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Angle label
    ctx.fillStyle = '#0066cc';
    ctx.font = '7px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${hole.angle}°`, holeX, holeY - 8);
    ctx.fillStyle = '#000';
  });
  
  // Radius label
  ctx.font = '9px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText(`R = ${radius}"`, centerX, topY + stepHeight * scale + 15);
  
  // 100mm beam path indicator
  ctx.strokeStyle = '#0066cc';
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  const beamPathY = baseY - 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(blockX + scale, beamPathY);
  ctx.lineTo(blockX + totalLength * scale - scale, beamPathY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = '#000';
  
  ctx.fillStyle = '#0066cc';
  ctx.font = '8px Arial';
  ctx.fillText('100mm beam path', centerX, beamPathY - 5);
  
  // Probe index point marker
  ctx.fillStyle = '#000';
  ctx.font = '7px Arial';
  ctx.fillText('← Probe Index Point', centerX - 20, baseY + 20);
  
  // Title
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('IIW (V1/V2) Reference Block', 10, 20);
  ctx.font = '10px Arial';
  ctx.fillText('MIL-STD-2154 - Figure 7', 10, 35);
}
