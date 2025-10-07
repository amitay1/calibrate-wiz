import { useEffect, useRef } from 'react';
import { ScanData } from '@/types/inspectionReport';

interface AScanGeneratorProps {
  scanData: ScanData;
  onImageGenerated: (imageDataUrl: string) => void;
}

export const AScanGenerator = ({ scanData, onImageGenerated }: AScanGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateAScan();
  }, [scanData]);

  const generateAScan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = 800;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    const padding = 60;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    const graphX = padding;
    const graphY = padding;

    // Grid lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = graphX + (graphWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, graphY);
      ctx.lineTo(x, graphY + graphHeight);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 8; i++) {
      const y = graphY + (graphHeight / 8) * i;
      ctx.beginPath();
      ctx.moveTo(graphX, y);
      ctx.lineTo(graphX + graphWidth, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphHeight);
    ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(graphX, graphY);
    ctx.lineTo(graphX, graphY + graphHeight);
    ctx.stroke();

    // Parse scan parameters
    const frequency = parseFloat(scanData.frequency || '2.25');
    const gain = parseFloat(scanData.gain || '50');
    const range = parseFloat(scanData.range || '100');
    const velocity = parseFloat(scanData.velocity || '5900');

    // Generate A-Scan waveform
    const numPoints = 500;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const x = graphX + t * graphWidth;

      // Generate multiple echoes with decay
      let amplitude = 0;

      // Front wall echo (strong)
      const frontWallPos = 0.15;
      const frontWallWidth = 0.02;
      if (Math.abs(t - frontWallPos) < frontWallWidth) {
        amplitude += Math.exp(-Math.pow((t - frontWallPos) / (frontWallWidth / 3), 2)) * 0.9;
      }

      // Defect echo (medium, influenced by gain)
      const defectPos = 0.45;
      const defectWidth = 0.03;
      const defectStrength = (gain / 100) * 0.6;
      if (Math.abs(t - defectPos) < defectWidth) {
        amplitude += Math.exp(-Math.pow((t - defectPos) / (defectWidth / 3), 2)) * defectStrength;
      }

      // Back wall echo (medium-strong)
      const backWallPos = 0.75;
      const backWallWidth = 0.025;
      if (Math.abs(t - backWallPos) < backWallWidth) {
        amplitude += Math.exp(-Math.pow((t - backWallPos) / (backWallWidth / 3), 2)) * 0.7;
      }

      // Add some noise influenced by frequency
      amplitude += (Math.random() - 0.5) * 0.05 * (frequency / 5);

      // Clamp amplitude
      amplitude = Math.max(0, Math.min(1, amplitude));

      const y = graphY + graphHeight - amplitude * graphHeight;
      points.push({ x, y });
    }

    // Draw waveform
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Fill area under curve
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphHeight);
    for (const point of points) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`A-Scan Waveform: ${scanData.scanType}`, 10, 20);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Frequency: ${frequency} MHz`, 10, 40);
    ctx.fillText(`Gain: ${gain} dB`, 10, 55);
    ctx.fillText(`Range: ${range} mm`, 10, 70);
    ctx.fillText(`Velocity: ${velocity} m/s`, 10, 85);

    // Axis labels
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 14px Arial';
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitude (%)', 0, 0);
    ctx.restore();

    ctx.fillText('Time / Depth', width / 2 - 50, height - 15);

    // Time markers
    ctx.font = '10px Arial';
    for (let i = 0; i <= 10; i++) {
      const x = graphX + (graphWidth / 10) * i;
      const timeValue = ((range / 10) * i).toFixed(1);
      ctx.fillText(`${timeValue}`, x - 10, graphY + graphHeight + 15);
    }

    // Amplitude markers
    for (let i = 0; i <= 8; i++) {
      const y = graphY + (graphHeight / 8) * i;
      const ampValue = (100 - (100 / 8) * i).toFixed(0);
      ctx.fillText(`${ampValue}`, graphX - 35, y + 4);
    }

    // Convert to data URL and callback
    const imageDataUrl = canvas.toDataURL('image/png');
    onImageGenerated(imageDataUrl);
  };

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};
