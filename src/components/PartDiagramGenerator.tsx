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

    // Set canvas size
    const width = 1000;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('PART DIAGRAM - SCAN LOCATIONS', 50, 50);

    // Parse dimensions
    const thickVal = parseFloat(thickness) || 50;
    const diamVal = parseFloat(diameter || '200') || 200;
    const lengthVal = parseFloat(length || '400') || 400;

    // Draw based on part type
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    const centerX = width / 2;
    const centerY = height / 2 + 50;

    if (partType.toLowerCase().includes('tube') || partType.toLowerCase().includes('cylinder')) {
      // Draw cylinder/tube with cross-section
      drawCylinderDiagram(ctx, centerX, centerY, diamVal, lengthVal, thickVal);
    } else if (partType.toLowerCase().includes('disk') || partType.toLowerCase().includes('circle')) {
      // Draw disk
      drawDiskDiagram(ctx, centerX, centerY, diamVal, thickVal);
    } else {
      // Default: rectangular part
      drawRectangularDiagram(ctx, centerX, centerY, lengthVal, diamVal, thickVal);
    }

    // Add scan direction arrows
    drawScanDirections(ctx, centerX, centerY);

    // Add dimension labels
    ctx.fillStyle = '#0066cc';
    ctx.font = '14px Arial';
    ctx.fillText(`Thickness: ${thickness} mm`, 50, height - 80);
    if (diameter) ctx.fillText(`Diameter: ${diameter} mm`, 50, height - 60);
    if (length) ctx.fillText(`Length: ${length} mm`, 50, height - 40);

    // Add notes
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.fillText('Note: Arrows indicate scan directions', 50, height - 15);

    // Convert to data URL and callback
    const imageDataUrl = canvas.toDataURL('image/png');
    onImageGenerated(imageDataUrl);
  };

  const drawCylinderDiagram = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    diameter: number, 
    length: number, 
    thickness: number
  ) => {
    const scale = 1.5;
    const radius = (diameter / 2) * scale;
    const len = length * scale;

    // Front ellipse
    ctx.beginPath();
    ctx.ellipse(x - len / 2, y, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Back ellipse (dashed)
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(x + len / 2, y, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Connecting lines
    ctx.beginPath();
    ctx.moveTo(x - len / 2, y - radius * 0.3);
    ctx.lineTo(x + len / 2, y - radius * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - len / 2, y + radius * 0.3);
    ctx.lineTo(x + len / 2, y + radius * 0.3);
    ctx.stroke();

    // Cross-section view (side)
    const sectionX = x + len / 2 + 150;
    const sectionY = y;
    const sectionWidth = thickness * 3;
    const sectionHeight = diameter * scale;

    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(sectionX - sectionWidth / 2, sectionY - sectionHeight / 2, sectionWidth, sectionHeight);
    ctx.strokeRect(sectionX - sectionWidth / 2, sectionY - sectionHeight / 2, sectionWidth, sectionHeight);

    // Dimension lines
    drawDimensionLine(ctx, x - len / 2, y + radius * 0.3 + 40, x + len / 2, y + radius * 0.3 + 40, `${length} mm`);
    drawDimensionLine(ctx, x - len / 2 - 60, y - radius * 0.3, x - len / 2 - 60, y + radius * 0.3, `Ø${diameter} mm`);
  };

  const drawDiskDiagram = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    diameter: number, 
    thickness: number
  ) => {
    const scale = 2;
    const radius = (diameter / 2) * scale;

    // Top view - circle
    ctx.beginPath();
    ctx.arc(x - 200, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Center mark
    ctx.beginPath();
    ctx.moveTo(x - 200 - 10, y);
    ctx.lineTo(x - 200 + 10, y);
    ctx.moveTo(x - 200, y - 10);
    ctx.lineTo(x - 200, y + 10);
    ctx.stroke();

    // Side view - rectangle
    const sideX = x + 150;
    const sideWidth = thickness * 3;
    const sideHeight = diameter * scale;

    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(sideX - sideWidth / 2, y - sideHeight / 2, sideWidth, sideHeight);
    ctx.strokeRect(sideX - sideWidth / 2, y - sideHeight / 2, sideWidth, sideHeight);

    // Labels
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('TOP VIEW', x - 240, y - radius - 20);
    ctx.fillText('SIDE VIEW', sideX - 40, y - sideHeight / 2 - 20);

    // Dimension lines
    drawDimensionLine(ctx, x - 200 - radius, y + radius + 40, x - 200 + radius, y + radius + 40, `Ø${diameter} mm`);
    drawDimensionLine(ctx, sideX + sideWidth / 2 + 30, y - sideHeight / 2, sideX + sideWidth / 2 + 30, y + sideHeight / 2, `${diameter} mm`);
  };

  const drawRectangularDiagram = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    length: number, 
    width: number, 
    thickness: number
  ) => {
    const scale = 1.5;
    const len = length * scale;
    const wid = width * scale;

    // Top view
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x - len / 2, y - wid / 2, len, wid);
    ctx.strokeRect(x - len / 2, y - wid / 2, len, wid);

    // Center lines
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#0066cc';
    ctx.beginPath();
    ctx.moveTo(x, y - wid / 2 - 20);
    ctx.lineTo(x, y + wid / 2 + 20);
    ctx.moveTo(x - len / 2 - 20, y);
    ctx.lineTo(x + len / 2 + 20, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#000000';

    // Label
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('TOP VIEW', x - 40, y - wid / 2 - 30);

    // Dimension lines
    drawDimensionLine(ctx, x - len / 2, y + wid / 2 + 40, x + len / 2, y + wid / 2 + 40, `${length} mm`);
    drawDimensionLine(ctx, x - len / 2 - 60, y - wid / 2, x - len / 2 - 60, y + wid / 2, `${width} mm`);
  };

  const drawDimensionLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string
  ) => {
    ctx.strokeStyle = '#0066cc';
    ctx.fillStyle = '#0066cc';
    ctx.lineWidth = 1;

    // Main line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrows
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 10;

    // Start arrow
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowLength * Math.cos(angle + Math.PI / 6), y1 + arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowLength * Math.cos(angle - Math.PI / 6), y1 + arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.stroke();

    // End arrow
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI / 6), y2 - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLength * Math.cos(angle - Math.PI / 6), y2 - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.stroke();

    // Label
    ctx.font = 'bold 12px Arial';
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(midX - textWidth / 2 - 5, midY - 10, textWidth + 10, 20);
    ctx.fillStyle = '#0066cc';
    ctx.fillText(label, midX - textWidth / 2, midY + 5);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
  };

  const drawScanDirections = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#ff0000';
    ctx.fillStyle = '#ff0000';
    ctx.lineWidth = 3;

    // Axial direction (horizontal)
    drawArrow(ctx, x - 300, y - 250, x - 200, y - 250, 'AXIAL SCAN');

    // Circumferential direction (curved)
    drawArrow(ctx, x + 200, y - 250, x + 300, y - 250, 'CIRCUMFERENTIAL SCAN');

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string
  ) => {
    // Line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 15;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowLength * Math.cos(angle - Math.PI / 6), y2 - arrowLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI / 6), y2 - arrowLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = 'bold 11px Arial';
    ctx.fillText(label, x1, y1 - 10);
  };

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};
