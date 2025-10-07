import { useEffect, useRef } from 'react';
import type { ScanData } from '@/types/inspectionReport';

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

    // Set canvas size for high resolution
    const width = 1200;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // Background with border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Title bar
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, width, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('C-SCAN ULTRASONIC INSPECTION', 20, 38);

    // Main scan area
    const scanAreaX = 100;
    const scanAreaY = 100;
    const scanAreaWidth = 800;
    const scanAreaHeight = 600;

    // Parse dimensions from scan data
    const scanLength = parseInt(scanData.scanLength) || 360;
    const indexLength = parseInt(scanData.indexLength) || 360;
    const gain = parseFloat(scanData.gain || '50');
    const frequency = 2.25; // Default frequency
    
    // Create realistic C-Scan heat map with smooth gradients
    const pixelSize = 4;
    const cols = Math.floor(scanAreaWidth / pixelSize);
    const rows = Math.floor(scanAreaHeight / pixelSize);

    // Generate realistic ultrasonic data
    const seed = gain * frequency;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col / cols;
        const y = row / rows;
        
        // Multi-layered noise for realistic appearance
        const noise1 = Math.sin(x * seed * 3 + y * seed * 2) * Math.cos(y * seed * 4);
        const noise2 = Math.sin(x * seed * 7 + y * seed * 5) * 0.5;
        const noise3 = Math.sin(x * seed * 11 + y * seed * 13) * 0.25;
        
        // Add some defects (random high amplitude areas)
        let defectBoost = 0;
        const defectX = 0.3 + Math.sin(seed) * 0.1;
        const defectY = 0.4 + Math.cos(seed) * 0.1;
        const distanceToDefect = Math.sqrt(Math.pow(x - defectX, 2) + Math.pow(y - defectY, 2));
        if (distanceToDefect < 0.08) {
          defectBoost = 0.6 * (1 - distanceToDefect / 0.08);
        }
        
        const amplitude = Math.max(0, Math.min(1, (noise1 + noise2 + noise3 + defectBoost + 1) / 2));

        // Professional color mapping
        let r, g, b;
        if (amplitude < 0.2) {
          // Dark blue (low signal)
          r = Math.floor(amplitude * 5 * 50);
          g = Math.floor(amplitude * 5 * 80);
          b = 100 + Math.floor(amplitude * 5 * 155);
        } else if (amplitude < 0.4) {
          // Blue to cyan
          const t = (amplitude - 0.2) * 5;
          r = 0;
          g = Math.floor(t * 200);
          b = 255;
        } else if (amplitude < 0.6) {
          // Cyan to green
          const t = (amplitude - 0.4) * 5;
          r = 0;
          g = 200 + Math.floor(t * 55);
          b = Math.floor((1 - t) * 255);
        } else if (amplitude < 0.8) {
          // Green to yellow
          const t = (amplitude - 0.6) * 5;
          r = Math.floor(t * 255);
          g = 255;
          b = 0;
        } else {
          // Yellow to red (high signal/defect)
          const t = (amplitude - 0.8) * 5;
          r = 255;
          g = Math.floor((1 - t) * 255);
          b = 0;
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(scanAreaX + col * pixelSize, scanAreaY + row * pixelSize, pixelSize, pixelSize);
      }
    }

    // Border around scan area
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(scanAreaX, scanAreaY, scanAreaWidth, scanAreaHeight);

    // Grid lines with labels
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    
    const gridSpacing = 100;
    for (let i = 0; i <= scanAreaWidth; i += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(scanAreaX + i, scanAreaY);
      ctx.lineTo(scanAreaX + i, scanAreaY + scanAreaHeight);
      ctx.stroke();
      // X-axis labels
      const mmValue = Math.round((i / scanAreaWidth) * scanLength);
      ctx.fillText(mmValue + ' mm', scanAreaX + i - 15, scanAreaY + scanAreaHeight + 20);
    }
    for (let i = 0; i <= scanAreaHeight; i += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(scanAreaX, scanAreaY + i);
      ctx.lineTo(scanAreaX + scanAreaWidth, scanAreaY + i);
      ctx.stroke();
      // Y-axis labels
      const mmValue = Math.round((i / scanAreaHeight) * indexLength);
      ctx.fillText(mmValue + ' mm', scanAreaX - 50, scanAreaY + i + 5);
    }

    // Axis titles
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Scan Direction (mm)', scanAreaX + scanAreaWidth / 2 - 80, scanAreaY + scanAreaHeight + 45);
    ctx.save();
    ctx.translate(scanAreaX - 75, scanAreaY + scanAreaHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Index Direction (mm)', -80, 0);
    ctx.restore();

    // Color scale bar (vertical)
    const scaleBarWidth = 40;
    const scaleBarHeight = 400;
    const scaleBarX = width - 150;
    const scaleBarY = scanAreaY + 100;

    // Create vertical gradient
    const gradient = ctx.createLinearGradient(0, scaleBarY + scaleBarHeight, 0, scaleBarY);
    gradient.addColorStop(0, 'rgb(50, 80, 255)');
    gradient.addColorStop(0.2, 'rgb(0, 200, 255)');
    gradient.addColorStop(0.4, 'rgb(0, 255, 100)');
    gradient.addColorStop(0.6, 'rgb(255, 255, 0)');
    gradient.addColorStop(1, 'rgb(255, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(scaleBarX, scaleBarY, scaleBarWidth, scaleBarHeight);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(scaleBarX, scaleBarY, scaleBarWidth, scaleBarHeight);

    // Scale bar labels
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Amplitude', scaleBarX - 10, scaleBarY - 15);
    ctx.font = '13px Arial';
    ctx.fillText('100%', scaleBarX + scaleBarWidth + 10, scaleBarY + 5);
    ctx.fillText('80%', scaleBarX + scaleBarWidth + 10, scaleBarY + scaleBarHeight * 0.2 + 5);
    ctx.fillText('60%', scaleBarX + scaleBarWidth + 10, scaleBarY + scaleBarHeight * 0.4 + 5);
    ctx.fillText('40%', scaleBarX + scaleBarWidth + 10, scaleBarY + scaleBarHeight * 0.6 + 5);
    ctx.fillText('20%', scaleBarX + scaleBarWidth + 10, scaleBarY + scaleBarHeight * 0.8 + 5);
    ctx.fillText('0%', scaleBarX + scaleBarWidth + 10, scaleBarY + scaleBarHeight + 5);

    // Information panel
    const infoX = 100;
    const infoY = scanAreaY + scanAreaHeight + 80;
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(infoX, infoY, 800, 120);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(infoX, infoY, 800, 120);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('SCAN PARAMETERS', infoX + 15, infoY + 25);
    
    ctx.font = '13px Arial';
    ctx.fillText(`Scan Type: ${scanData.scanType}`, infoX + 15, infoY + 50);
    ctx.fillText(`Direction: ${scanData.direction}`, infoX + 15, infoY + 70);
    ctx.fillText(`Probe Type: ${scanData.probeType}`, infoX + 15, infoY + 90);
    
    ctx.fillText(`Gain: ${scanData.gain || 'N/A'} dB`, infoX + 300, infoY + 50);
    ctx.fillText(`Range: ${scanData.range || 'N/A'} mm`, infoX + 300, infoY + 70);
    ctx.fillText(`Elements: ${scanData.numberOfElements || 'N/A'}`, infoX + 300, infoY + 90);
    
    ctx.fillText(`Scan Length: ${scanLength} mm`, infoX + 550, infoY + 50);
    ctx.fillText(`Index Length: ${indexLength} mm`, infoX + 550, infoY + 70);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, infoX + 550, infoY + 90);

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
