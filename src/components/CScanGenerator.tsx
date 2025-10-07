import { useEffect, useRef } from 'react';
import { ScanData } from '@/types/inspectionReport';

interface CScanGeneratorProps {
  scanData: ScanData;
  onImageGenerated: (imageDataUrl: string) => void;
}

export const CScanGenerator = ({ scanData, onImageGenerated }: CScanGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateCScan();
  }, [scanData]);

  const generateCScan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Parse dimensions from scan data
    const scanLength = parseInt(scanData.scanLength) || 360;
    const indexLength = parseInt(scanData.indexLength) || 360;
    
    // Create grid for C-Scan heat map
    const gridSize = 20;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    // Generate heat map based on scan parameters
    const gain = parseFloat(scanData.gain || '50');
    const frequency = parseFloat(scanData.frequency || '2.25');
    const seed = gain * frequency; // Use parameters to influence pattern

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Generate pseudo-random amplitude based on position and scan parameters
        const x = col / cols;
        const y = row / rows;
        const noise = Math.sin(x * seed + y * seed * 1.5) * 
                     Math.cos(y * seed * 2 + x * seed * 0.7);
        const amplitude = (noise + 1) / 2; // Normalize to 0-1

        // Create color gradient: blue (low) -> green -> yellow -> red (high)
        let r, g, b;
        if (amplitude < 0.25) {
          // Blue to cyan
          r = 0;
          g = Math.floor(amplitude * 4 * 255);
          b = 255;
        } else if (amplitude < 0.5) {
          // Cyan to green
          r = 0;
          g = 255;
          b = Math.floor((1 - (amplitude - 0.25) * 4) * 255);
        } else if (amplitude < 0.75) {
          // Green to yellow
          r = Math.floor((amplitude - 0.5) * 4 * 255);
          g = 255;
          b = 0;
        } else {
          // Yellow to red
          r = 255;
          g = Math.floor((1 - (amplitude - 0.75) * 4) * 255);
          b = 0;
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
    }

    // Add grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, height);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(width, i * gridSize);
      ctx.stroke();
    }

    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`C-Scan: ${scanData.scanType}`, 10, 30);
    ctx.font = '14px Arial';
    ctx.fillText(`Direction: ${scanData.direction}`, 10, 55);
    ctx.fillText(`Probe: ${scanData.probeType}`, 10, 75);
    ctx.fillText(`Freq: ${scanData.frequency || 'N/A'} | Gain: ${scanData.gain || 'N/A'} dB`, 10, 95);

    // Add scale bar
    const scaleBarWidth = 200;
    const scaleBarHeight = 20;
    const scaleBarX = width - scaleBarWidth - 20;
    const scaleBarY = height - scaleBarHeight - 40;

    const gradient = ctx.createLinearGradient(scaleBarX, 0, scaleBarX + scaleBarWidth, 0);
    gradient.addColorStop(0, 'rgb(0, 0, 255)');
    gradient.addColorStop(0.25, 'rgb(0, 255, 255)');
    gradient.addColorStop(0.5, 'rgb(0, 255, 0)');
    gradient.addColorStop(0.75, 'rgb(255, 255, 0)');
    gradient.addColorStop(1, 'rgb(255, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(scaleBarX, scaleBarY, scaleBarWidth, scaleBarHeight);
    
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(scaleBarX, scaleBarY, scaleBarWidth, scaleBarHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('Low', scaleBarX - 30, scaleBarY + 15);
    ctx.fillText('High', scaleBarX + scaleBarWidth + 5, scaleBarY + 15);
    ctx.fillText('Amplitude', scaleBarX + scaleBarWidth / 2 - 30, scaleBarY - 5);

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
