import { useEffect, useRef } from 'react';

interface PartDiagramGeneratorProps {
  partType: string;
  thickness: string;
  diameter?: string;
  length?: string;
  onImageGenerated: (imageDataUrl: string) => void;
}

export const PartDiagramGenerator = ({ 
  partType, 
  thickness, 
  diameter, 
  length, 
  onImageGenerated 
}: PartDiagramGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generatePartDiagram();
  }, [partType, thickness, diameter, length]);

  const generatePartDiagram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high resolution
    const canvasWidth = 1400;
    const canvasHeight = 1000;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Title bar
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvasWidth, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('PART TECHNICAL DRAWING - INSPECTION DIAGRAM', 30, 45);

    // Parse dimensions
    const t = parseFloat(thickness) || 50;
    const d = parseFloat(diameter || '200');
    const l = parseFloat(length || '400');

    if (partType === 'tube' || partType === 'cylinder') {
      drawCylinderDiagram(ctx, t, d, l, partType === 'tube');
    } else if (partType === 'disk') {
      drawDiskDiagram(ctx, t, d);
    } else {
      drawRectangularDiagram(ctx, t, l);
    }

    // Information panel at bottom
    const infoY = canvasHeight - 120;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(30, infoY, canvasWidth - 60, 90);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, infoY, canvasWidth - 60, 90);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('PART SPECIFICATIONS', 50, infoY + 30);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Part Type: ${partType.toUpperCase()}`, 50, infoY + 55);
    ctx.fillText(`Thickness: ${t} mm`, 300, infoY + 55);
    
    if (partType === 'tube' || partType === 'cylinder' || partType === 'disk') {
      ctx.fillText(`Diameter: ${d} mm`, 500, infoY + 55);
    }
    if (partType === 'tube' || partType === 'cylinder' || partType === 'rectangular') {
      ctx.fillText(`Length: ${l} mm`, 700, infoY + 55);
    }
    
    ctx.fillText(`Drawing Date: ${new Date().toLocaleDateString()}`, 950, infoY + 55);
    ctx.fillText('All dimensions in millimeters', 50, infoY + 75);

    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    onImageGenerated(imageDataUrl);
  };

  const drawCylinderDiagram = (
    ctx: CanvasRenderingContext2D,
    thickness: number,
    diameter: number,
    length: number,
    isTube: boolean
  ) => {
    // Isometric view of cylinder/tube
    const centerX = 400;
    const centerY = 400;
    const scale = 1.5;
    
    // Front face (circular)
    const radius = (diameter / 2) * scale;
    const innerRadius = isTube ? ((diameter - thickness * 2) / 2) * scale : 0;
    
    // Draw 3D cylinder with depth
    const depth = Math.min(length * scale * 0.6, 350);
    
    // Back ellipse (for 3D effect)
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.ellipse(centerX + depth * 0.4, centerY - depth * 0.25, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isTube) {
      // Inner back ellipse
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(centerX + depth * 0.4, centerY - depth * 0.25, innerRadius, innerRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Side surface
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI, false);
    ctx.lineTo(centerX + depth * 0.4, centerY - depth * 0.25 - radius * 0.3);
    ctx.ellipse(centerX + depth * 0.4, centerY - depth * 0.25, radius, radius * 0.3, 0, Math.PI, 0, true);
    ctx.lineTo(centerX - radius, centerY);
    ctx.fill();
    ctx.stroke();

    if (isTube) {
      // Inner surface
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, innerRadius, innerRadius * 0.3, 0, 0, Math.PI, false);
      ctx.lineTo(centerX + depth * 0.4, centerY - depth * 0.25 - innerRadius * 0.3);
      ctx.ellipse(centerX + depth * 0.4, centerY - depth * 0.25, innerRadius, innerRadius * 0.3, 0, Math.PI, 0, true);
      ctx.lineTo(centerX - innerRadius, centerY);
      ctx.fill();
      ctx.stroke();
    }

    // Front face
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isTube) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, innerRadius, innerRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Dimension lines - Diameter
    drawDimensionLine(ctx, centerX - radius, centerY + radius * 0.3 + 50, 
                      centerX + radius, centerY + radius * 0.3 + 50, `Ø${diameter} mm`);
    
    if (isTube) {
      // Wall thickness dimension
      drawDimensionLine(ctx, centerX - radius, centerY + 20, 
                       centerX - innerRadius, centerY + 20, `t=${thickness} mm`);
    }
    
    // Length dimension (isometric)
    const lengthStartX = centerX + radius + 30;
    const lengthStartY = centerY - radius * 0.3;
    const lengthEndX = lengthStartX + depth * 0.4;
    const lengthEndY = lengthStartY - depth * 0.25;
    drawDimensionLine(ctx, lengthStartX, lengthStartY, lengthEndX, lengthEndY, `L=${length} mm`);

    // Cross-section view
    const crossSectionX = 900;
    const crossSectionY = 300;
    const crossSectionScale = 1.2;
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('SECTION A-A', crossSectionX - 60, crossSectionY - 40);
    
    // Outer circle
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(crossSectionX, crossSectionY, radius * crossSectionScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isTube) {
      // Inner circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(crossSectionX, crossSectionY, innerRadius * crossSectionScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hatch pattern for wall
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
        for (let r = innerRadius * crossSectionScale; r < radius * crossSectionScale; r += 8) {
          const x1 = crossSectionX + r * Math.cos(angle);
          const y1 = crossSectionY + r * Math.sin(angle);
          const x2 = crossSectionX + (r + 4) * Math.cos(angle);
          const y2 = crossSectionY + (r + 4) * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Scan coverage indicators
    drawScanCoverage(ctx, crossSectionX, crossSectionY, radius * crossSectionScale);
  };

  const drawDiskDiagram = (
    ctx: CanvasRenderingContext2D,
    thickness: number,
    diameter: number
  ) => {
    const centerX = 500;
    const centerY = 400;
    const scale = 2;
    const radius = (diameter / 2) * scale;
    const diskThickness = thickness * scale;

    // Top view - main circle
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center mark
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();

    // Side view
    const sideViewX = 1000;
    const sideViewY = 400;
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('SIDE VIEW', sideViewX - 50, sideViewY - diskThickness - 30);

    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(sideViewX - radius, sideViewY - diskThickness / 2, radius * 2, diskThickness);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(sideViewX - radius, sideViewY - diskThickness / 2, radius * 2, diskThickness);

    // Dimension lines
    drawDimensionLine(ctx, centerX - radius, centerY + radius + 40, 
                      centerX + radius, centerY + radius + 40, `Ø${diameter} mm`);
    drawDimensionLine(ctx, sideViewX + radius + 30, sideViewY - diskThickness / 2,
                      sideViewX + radius + 30, sideViewY + diskThickness / 2, `t=${thickness} mm`);

    // Scan coverage
    drawScanCoverage(ctx, centerX, centerY, radius);
  };

  const drawRectangularDiagram = (
    ctx: CanvasRenderingContext2D,
    thickness: number,
    length: number
  ) => {
    const scale = 2;
    const w = length * scale;
    const h = 200;
    const centerX = 400;
    const centerY = 400;

    // Isometric view
    const depth = thickness * scale * 2;
    
    // Back face
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.moveTo(centerX + depth * 0.5, centerY - depth * 0.3);
    ctx.lineTo(centerX + w + depth * 0.5, centerY - depth * 0.3);
    ctx.lineTo(centerX + w + depth * 0.5, centerY + h - depth * 0.3);
    ctx.lineTo(centerX + depth * 0.5, centerY + h - depth * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top face
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + w, centerY);
    ctx.lineTo(centerX + w + depth * 0.5, centerY - depth * 0.3);
    ctx.lineTo(centerX + depth * 0.5, centerY - depth * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front face
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(centerX, centerY, w, h);
    ctx.strokeRect(centerX, centerY, w, h);

    // Dimension lines
    drawDimensionLine(ctx, centerX, centerY + h + 40, centerX + w, centerY + h + 40, `${length} mm`);
    drawDimensionLine(ctx, centerX - 40, centerY, centerX - 40, centerY + h, `${h / scale} mm`);
    drawDimensionLine(ctx, centerX + w + 30, centerY, 
                      centerX + w + depth * 0.5 + 30, centerY - depth * 0.3, `t=${thickness} mm`);

    // Top view
    const topViewX = 950;
    const topViewY = 300;
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('TOP VIEW', topViewX - 50, topViewY - 30);

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(topViewX, topViewY, w * 0.8, depth);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(topViewX, topViewY, w * 0.8, depth);

    // Scan pattern grid
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i <= 4; i++) {
      const x = centerX + (i * w / 4);
      ctx.beginPath();
      ctx.moveTo(x, centerY);
      ctx.lineTo(x, centerY + h);
      ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const y = centerY + (i * h / 4);
      ctx.beginPath();
      ctx.moveTo(centerX, y);
      ctx.lineTo(centerX + w, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  };

  const drawDimensionLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string
  ) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    
    // Main dimension line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrow heads
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 12;
    const arrowAngle = Math.PI / 6;

    // Start arrow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowLength * Math.cos(angle + Math.PI - arrowAngle),
               y1 + arrowLength * Math.sin(angle + Math.PI - arrowAngle));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowLength * Math.cos(angle + Math.PI + arrowAngle),
               y1 + arrowLength * Math.sin(angle + Math.PI + arrowAngle));
    ctx.stroke();

    // End arrow
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + arrowLength * Math.cos(angle - arrowAngle),
               y2 + arrowLength * Math.sin(angle - arrowAngle));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + arrowLength * Math.cos(angle + arrowAngle),
               y2 + arrowLength * Math.sin(angle + arrowAngle));
    ctx.stroke();

    // Label
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#000000';
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Background for label
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(midX - textWidth / 2 - 5, midY - 12, textWidth + 10, 20);
    
    ctx.fillStyle = '#000000';
    ctx.fillText(label, midX - textWidth / 2, midY + 5);
  };

  const drawScanCoverage = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    // Draw scan direction arrows
    ctx.strokeStyle = '#4a90e2';
    ctx.fillStyle = '#4a90e2';
    ctx.lineWidth = 2;
    
    const arrowCount = 8;
    for (let i = 0; i < arrowCount; i++) {
      const angle = (i * Math.PI * 2) / arrowCount;
      const startR = radius * 0.3;
      const endR = radius * 0.7;
      
      const x1 = centerX + startR * Math.cos(angle);
      const y1 = centerY + startR * Math.sin(angle);
      const x2 = centerX + endR * Math.cos(angle);
      const y2 = centerY + endR * Math.sin(angle);
      
      // Arrow line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Arrow head
      const headLength = 10;
      const headAngle = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLength * Math.cos(angle - headAngle),
                 y2 - headLength * Math.sin(angle - headAngle));
      ctx.lineTo(x2 - headLength * Math.cos(angle + headAngle),
                 y2 - headLength * Math.sin(angle + headAngle));
      ctx.closePath();
      ctx.fill();
    }
    
    // Label
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#4a90e2';
    ctx.fillText('SCAN', centerX - 20, centerY - 5);
    ctx.fillText('COVERAGE', centerX - 35, centerY + 10);
  };

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};