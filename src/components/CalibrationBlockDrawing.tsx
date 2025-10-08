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

// Flat Block with FBH (Figure 4)
function drawFlatBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const blockWidth = 180;
  const blockHeight = 80;

  // Main block rectangle
  ctx.strokeRect(centerX - blockWidth/2, centerY - blockHeight/2, blockWidth, blockHeight);

  // Draw FBH holes (flat bottom holes)
  const holes = [
    { x: centerX - 60, depth: 20, dia: 3.2 },
    { x: centerX, depth: 30, dia: 4.8 },
    { x: centerX + 60, depth: 40, dia: 6.4 }
  ];

  holes.forEach(hole => {
    const holeY = centerY - blockHeight/2;
    
    // Hole representation
    ctx.beginPath();
    ctx.arc(hole.x, holeY + hole.depth, hole.dia, 0, Math.PI * 2);
    ctx.fill();
    
    // Dashed line to show hole
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(hole.x, holeY);
    ctx.lineTo(hole.x, holeY + hole.depth);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension text
    ctx.fillText(`Ø${hole.dia}`, hole.x - 12, holeY + hole.depth + 25);
    ctx.fillText(`${hole.depth}mm`, hole.x - 18, holeY + hole.depth + 15);
  });

  // Title
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Flat Block - FBH', 10, 15);
  ctx.font = '9px Arial';
  ctx.fillText('Figure 4 - ASTM E127', 10, 28);
}

// Curved Block (Figure 3)
function drawCurvedBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 60;

  // Draw curved surface
  ctx.beginPath();
  ctx.arc(centerX, centerY + 80, radius + 40, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Draw bottom line
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY + 40);
  ctx.lineTo(centerX + 80, centerY + 40);
  ctx.stroke();

  // Side lines
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY - 20);
  ctx.lineTo(centerX - 80, centerY + 40);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX + 80, centerY - 20);
  ctx.lineTo(centerX + 80, centerY + 40);
  ctx.stroke();

  // FBH holes on curved surface
  const holes = [
    { angle: -0.3, depth: 15, dia: 3.2 },
    { angle: 0, depth: 20, dia: 4.8 },
    { angle: 0.3, depth: 25, dia: 6.4 }
  ];

  holes.forEach(hole => {
    const holeX = centerX + Math.sin(hole.angle) * (radius + 30);
    const holeY = centerY + 80 - Math.cos(hole.angle) * (radius + 30);
    
    ctx.beginPath();
    ctx.arc(holeX, holeY, hole.dia/2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Radius dimension
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 80);
  ctx.lineTo(centerX, centerY - 20);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillText(`R=${radius}mm`, centerX + 5, centerY + 20);

  // Title
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Curved Block - FBH', 10, 15);
  ctx.font = '9px Arial';
  ctx.fillText('Figure 3 - ASTM E127', 10, 28);
}

// Hollow Cylindrical FBH (Figure 6)
function drawHollowCylindricalFBH(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 50;
  const innerRadius = 35;
  const length = 120;

  // Draw isometric cylinder
  // Front ellipse (outer)
  ctx.beginPath();
  ctx.ellipse(centerX - 40, centerY, outerRadius, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Front ellipse (inner)
  ctx.beginPath();
  ctx.ellipse(centerX - 40, centerY, innerRadius, 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Back ellipse (outer)
  ctx.beginPath();
  ctx.ellipse(centerX + 40, centerY, outerRadius, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Back ellipse (inner)
  ctx.beginPath();
  ctx.ellipse(centerX + 40, centerY, innerRadius, 10, 0, 0, Math.PI);
  ctx.stroke();

  // Outer connecting lines
  ctx.beginPath();
  ctx.moveTo(centerX - 40, centerY - outerRadius * 0.3);
  ctx.lineTo(centerX + 40, centerY - outerRadius * 0.3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - 40, centerY + outerRadius * 0.3);
  ctx.lineTo(centerX + 40, centerY + outerRadius * 0.3);
  ctx.stroke();

  // FBH markers
  const fbhPositions = [
    { x: centerX - 20, y: centerY },
    { x: centerX, y: centerY },
    { x: centerX + 20, y: centerY }
  ];

  fbhPositions.forEach(pos => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Cross mark
    ctx.beginPath();
    ctx.moveTo(pos.x - 5, pos.y);
    ctx.lineTo(pos.x + 5, pos.y);
    ctx.moveTo(pos.x, pos.y - 5);
    ctx.lineTo(pos.x, pos.y + 5);
    ctx.stroke();
  });

  // Dimensions
  ctx.fillText(`OD=${outerRadius * 2}mm`, centerX - 40, centerY + 70);
  ctx.fillText(`ID=${innerRadius * 2}mm`, centerX - 40, centerY + 82);
  ctx.fillText(`L=${length}mm`, centerX + 50, centerY);

  // Title
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Hollow Cylinder - FBH', 10, 15);
  ctx.font = '9px Arial';
  ctx.fillText('Figure 6 - ASTM E127', 10, 28);
}

// Angle Beam Block (Figure 7 - Type IIv)
function drawAngleBeamBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Main block
  const blockPoints = [
    { x: centerX - 80, y: centerY + 40 },
    { x: centerX + 80, y: centerY + 40 },
    { x: centerX + 80, y: centerY - 20 },
    { x: centerX - 20, y: centerY - 20 },
    { x: centerX - 20, y: centerY - 40 },
    { x: centerX - 80, y: centerY - 40 }
  ];

  ctx.beginPath();
  ctx.moveTo(blockPoints[0].x, blockPoints[0].y);
  blockPoints.forEach(point => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.stroke();

  // Side drilled holes (SDH)
  const holes = [
    { x: centerX - 50, y: centerY, dia: 1.5 },
    { x: centerX - 20, y: centerY, dia: 2.0 },
    { x: centerX + 20, y: centerY, dia: 3.0 },
    { x: centerX + 50, y: centerY, dia: 4.0 }
  ];

  holes.forEach(hole => {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.dia * 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center mark
    ctx.beginPath();
    ctx.moveTo(hole.x - 3, hole.y);
    ctx.lineTo(hole.x + 3, hole.y);
    ctx.moveTo(hole.x, hole.y - 3);
    ctx.lineTo(hole.x, hole.y + 3);
    ctx.stroke();
    
    ctx.fillText(`Ø${hole.dia}`, hole.x - 8, hole.y + 20);
  });

  // Angle indication
  ctx.beginPath();
  ctx.setLineDash([2, 2]);
  ctx.moveTo(centerX - 80, centerY - 40);
  ctx.lineTo(centerX + 20, centerY + 60);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillText('45°', centerX - 30, centerY + 30);
  ctx.fillText('60°', centerX + 10, centerY + 30);

  // Title
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Type IIv - Angle Beam', 10, 15);
  ctx.font = '9px Arial';
  ctx.fillText('Figure 7 - ASTM E164', 10, 28);
}

// Hollow Cylindrical Notched (Figure 5)
function drawHollowCylindricalNotched(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 50;
  const innerRadius = 38;

  // Draw cylinder similar to FBH version
  ctx.beginPath();
  ctx.ellipse(centerX - 40, centerY, outerRadius, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(centerX - 40, centerY, innerRadius, 11, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(centerX + 40, centerY, outerRadius, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(centerX + 40, centerY, innerRadius, 11, 0, 0, Math.PI);
  ctx.stroke();

  // Connecting lines
  ctx.beginPath();
  ctx.moveTo(centerX - 40, centerY - outerRadius * 0.3);
  ctx.lineTo(centerX + 40, centerY - outerRadius * 0.3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - 40, centerY + outerRadius * 0.3);
  ctx.lineTo(centerX + 40, centerY + outerRadius * 0.3);
  ctx.stroke();

  // Notches on surface
  const notches = [
    { x: centerX - 30, angle: 0 },
    { x: centerX - 10, angle: 45 },
    { x: centerX + 10, angle: 90 },
    { x: centerX + 30, angle: 135 }
  ];

  notches.forEach(notch => {
    // Draw notch as small rectangle
    ctx.save();
    ctx.translate(notch.x, centerY - outerRadius * 0.3 - 3);
    ctx.fillRect(-1, 0, 2, 6);
    ctx.restore();
    
    ctx.fillText(`${notch.angle}°`, notch.x - 8, centerY + 70);
  });

  // Dimensions
  ctx.fillText(`Notch: 0.5mm x 5mm`, centerX - 45, centerY + 85);

  // Title
  ctx.font = 'bold 11px Arial';
  ctx.fillText('Hollow Cylinder - Notched', 10, 15);
  ctx.font = '9px Arial';
  ctx.fillText('Figure 5 - ASTM E127', 10, 28);
}

// IIW (V1/V2) Block
function drawIIVBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Main block outline (V1 block shape)
  const mainBlock = [
    { x: centerX - 90, y: centerY + 50 },
    { x: centerX + 90, y: centerY + 50 },
    { x: centerX + 90, y: centerY - 30 },
    { x: centerX + 40, y: centerY - 30 },
    { x: centerX + 40, y: centerY - 50 },
    { x: centerX - 40, y: centerY - 50 },
    { x: centerX - 40, y: centerY - 30 },
    { x: centerX - 90, y: centerY - 30 }
  ];

  ctx.beginPath();
  ctx.moveTo(mainBlock[0].x, mainBlock[0].y);
  mainBlock.forEach(point => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.stroke();

  // Radius at corners
  ctx.beginPath();
  ctx.arc(centerX + 40, centerY - 30, 15, 0, Math.PI / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX - 40, centerY - 30, 15, Math.PI / 2, Math.PI);
  ctx.stroke();

  // Side drilled holes
  const sdHoles = [
    { x: centerX - 60, depth: 25, dia: 2 },
    { x: centerX - 30, depth: 50, dia: 2 },
    { x: centerX, depth: 75, dia: 4 },
    { x: centerX + 30, depth: 50, dia: 2 },
    { x: centerX + 60, depth: 25, dia: 2 }
  ];

  sdHoles.forEach(hole => {
    ctx.beginPath();
    ctx.arc(hole.x, centerY + 10, hole.dia * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Depth line
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(hole.x, centerY + 50);
    ctx.lineTo(hole.x, centerY + 10);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Dimensions
  ctx.fillText('100mm beam path', centerX - 85, centerY - 55);
  ctx.fillText('R25', centerX - 25, centerY - 35);
  
  // Reference points
  ctx.fillText('Probe Index Point', centerX - 40, centerY + 65);

  // Title
  ctx.font = 'bold 11px Arial';
  ctx.fillText('IIW (V1/V2) Block', 10, 15);
  ctx.font = '9px Arial';
  ctx.fillText('IIW Type 1 Standard', 10, 28);
}
