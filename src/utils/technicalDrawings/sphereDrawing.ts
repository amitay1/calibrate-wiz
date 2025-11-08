/**
 * Sphere Technical Drawing Module
 * Generates multi-view technical drawings for spherical parts
 */

import { TechnicalDrawingGenerator, Dimensions, LayoutConfig } from './TechnicalDrawingGenerator';

export function drawSphereTechnicalDrawing(
  generator: TechnicalDrawingGenerator,
  dimensions: Dimensions,
  layout: LayoutConfig,
  scans: Array<{ id: string; waveType: string; beamAngle: number; side: 'A' | 'B' }> = []
): void {
  const diameter = dimensions.diameter || dimensions.length || 100;
  
  // For sphere: front view, side view, and top view are all circles
  drawSphereFrontView(generator, diameter, layout.frontView);
  drawSphereTopView(generator, diameter, layout.topView);
  drawSphereSectionView(generator, diameter, layout.sideView);
  drawSphereIsometric(generator, diameter, layout.isometric);
}

function drawSphereFrontView(
  generator: TechnicalDrawingGenerator,
  diameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'FRONT VIEW');
  
  // Scale to fit
  const scale = Math.min(width, height) / diameter * 0.5;
  const scaledRadius = (diameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Main circle
  generator.drawCircle(centerX, centerY, scaledRadius, 'visible');
  
  // Centerlines
  generator.drawLine(
    centerX - scaledRadius - 20,
    centerY,
    centerX + scaledRadius + 20,
    centerY,
    'center'
  );
  
  generator.drawLine(
    centerX,
    centerY - scaledRadius - 20,
    centerX,
    centerY + scaledRadius + 20,
    'center'
  );
  
  // Dimension
  generator.drawDimension(
    centerX - scaledRadius,
    centerY - scaledRadius - 30,
    centerX + scaledRadius,
    centerY - scaledRadius - 30,
    `Ø=${diameter}mm`,
    5
  );
  
  // Add equator line (dashed)
  const scope = generator.getScope();
  const equator = new scope.Path.Ellipse({
    center: [centerX, centerY],
    radius: [scaledRadius, scaledRadius * 0.3]
  });
  equator.strokeColor = new scope.Color('#666666');
  equator.strokeWidth = 1;
  equator.dashArray = [4, 4];
}

function drawSphereTopView(
  generator: TechnicalDrawingGenerator,
  diameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'TOP VIEW');
  
  // Scale to fit
  const scale = Math.min(width, height) / diameter * 0.5;
  const scaledRadius = (diameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Main circle
  generator.drawCircle(centerX, centerY, scaledRadius, 'visible');
  
  // Centerlines
  generator.drawLine(
    centerX - scaledRadius - 20,
    centerY,
    centerX + scaledRadius + 20,
    centerY,
    'center'
  );
  
  generator.drawLine(
    centerX,
    centerY - scaledRadius - 20,
    centerX,
    centerY + scaledRadius + 20,
    'center'
  );
  
  // Dimension
  generator.drawDimension(
    centerX - scaledRadius,
    centerY + scaledRadius + 25,
    centerX + scaledRadius,
    centerY + scaledRadius + 25,
    `Ø=${diameter}mm`,
    5
  );
}

function drawSphereSectionView(
  generator: TechnicalDrawingGenerator,
  diameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'SECTION A-A');
  
  // Scale to fit
  const scale = Math.min(width, height) / diameter * 0.5;
  const scaledRadius = (diameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Main circle
  generator.drawCircle(centerX, centerY, scaledRadius, 'visible');
  
  // Centerlines
  generator.drawLine(
    centerX - scaledRadius - 20,
    centerY,
    centerX + scaledRadius + 20,
    centerY,
    'center'
  );
  
  generator.drawLine(
    centerX,
    centerY - scaledRadius - 20,
    centerX,
    centerY + scaledRadius + 20,
    'center'
  );
  
  // Cross-hatching in semicircle pattern
  const scope = generator.getScope();
  
  // Left half hatching
  for (let i = -scaledRadius; i <= scaledRadius; i += 6) {
    const y1 = centerY + i;
    const xOffset = Math.sqrt(Math.max(0, scaledRadius * scaledRadius - i * i));
    generator.drawLine(
      centerX - xOffset,
      y1,
      centerX,
      y1,
      'visible'
    );
  }
  
  // Right half hatching
  for (let i = -scaledRadius; i <= scaledRadius; i += 6) {
    const y1 = centerY + i;
    const xOffset = Math.sqrt(Math.max(0, scaledRadius * scaledRadius - i * i));
    generator.drawLine(
      centerX,
      y1,
      centerX + xOffset,
      y1,
      'visible'
    );
  }
  
  // Dimension
  generator.drawDimension(
    centerX + scaledRadius + 30,
    centerY - scaledRadius,
    centerX + scaledRadius + 30,
    centerY + scaledRadius,
    `Ø=${diameter}mm`,
    5
  );
  
  // Label
  generator.drawText(
    centerX,
    centerY,
    'SOLID',
    10,
    '#666666'
  );
}

function drawSphereIsometric(
  generator: TechnicalDrawingGenerator,
  diameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'ISOMETRIC VIEW');
  
  // Scale to fit
  const scale = Math.min(width, height) / diameter * 0.5;
  const scaledRadius = (diameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  const scope = generator.getScope();
  
  // Main sphere circle
  const sphere = new scope.Path.Circle(new scope.Point(centerX, centerY), scaledRadius);
  sphere.strokeColor = new scope.Color('#000000');
  sphere.strokeWidth = 2;
  sphere.fillColor = new scope.Color('#E8E8E8');
  
  // Add equator ellipse
  const equator = new scope.Path.Ellipse({
    center: [centerX, centerY],
    radius: [scaledRadius * 0.95, scaledRadius * 0.3]
  });
  equator.strokeColor = new scope.Color('#666666');
  equator.strokeWidth = 1;
  equator.dashArray = [3, 3];
  
  // Add meridian ellipse
  const meridian = new scope.Path.Ellipse({
    center: [centerX, centerY],
    radius: [scaledRadius * 0.3, scaledRadius * 0.95]
  });
  meridian.strokeColor = new scope.Color('#666666');
  meridian.strokeWidth = 1;
  meridian.dashArray = [3, 3];
  
  // Highlight to show 3D effect
  const highlight = new scope.Path.Circle(
    new scope.Point(centerX - scaledRadius * 0.3, centerY - scaledRadius * 0.3),
    scaledRadius * 0.25
  );
  highlight.fillColor = new scope.Color('#FFFFFF');
  highlight.opacity = 0.6;
}
