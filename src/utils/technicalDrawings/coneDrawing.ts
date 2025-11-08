/**
 * Cone Technical Drawing Module
 * Generates multi-view technical drawings for conical parts
 */

import { TechnicalDrawingGenerator, Dimensions, LayoutConfig } from './TechnicalDrawingGenerator';

export function drawConeTechnicalDrawing(
  generator: TechnicalDrawingGenerator,
  dimensions: Dimensions,
  layout: LayoutConfig,
  scans: Array<{ id: string; waveType: string; beamAngle: number; side: 'A' | 'B' }> = []
): void {
  const baseDiameter = dimensions.diameter || dimensions.width || 100;
  const height = dimensions.length || dimensions.thickness || 100;
  const topDiameter = dimensions.innerDiameter || baseDiameter * 0.5; // Default to 50% taper
  
  drawConeFrontView(generator, baseDiameter, topDiameter, height, layout.frontView);
  drawConeTopView(generator, baseDiameter, layout.topView);
  drawConeBottomView(generator, topDiameter, layout.sideView);
  drawConeIsometric(generator, baseDiameter, topDiameter, height, layout.isometric);
}

function drawConeFrontView(
  generator: TechnicalDrawingGenerator,
  baseDiameter: number,
  topDiameter: number,
  height: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height: viewHeight } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'FRONT VIEW');
  
  // Scale to fit
  const scale = Math.min(width / baseDiameter, viewHeight / height) * 0.6;
  const scaledBaseDiameter = baseDiameter * scale;
  const scaledTopDiameter = topDiameter * scale;
  const scaledHeight = height * scale;
  
  const centerX = x + width / 2;
  const centerY = y + viewHeight / 2;
  
  // Calculate cone points
  const baseY = centerY + scaledHeight / 2;
  const topY = centerY - scaledHeight / 2;
  
  const baseLeft = centerX - scaledBaseDiameter / 2;
  const baseRight = centerX + scaledBaseDiameter / 2;
  const topLeft = centerX - scaledTopDiameter / 2;
  const topRight = centerX + scaledTopDiameter / 2;
  
  // Draw cone outline
  generator.drawLine(baseLeft, baseY, topLeft, topY, 'visible');
  generator.drawLine(baseRight, baseY, topRight, topY, 'visible');
  generator.drawLine(baseLeft, baseY, baseRight, baseY, 'visible');
  generator.drawLine(topLeft, topY, topRight, topY, 'visible');
  
  // Centerline
  generator.drawLine(centerX, topY - 20, centerX, baseY + 20, 'center');
  
  // Base diameter dimension
  generator.drawDimension(
    baseLeft,
    baseY + 30,
    baseRight,
    baseY + 30,
    `Base Ø=${baseDiameter}mm`,
    5
  );
  
  // Top diameter dimension
  generator.drawDimension(
    topLeft,
    topY - 30,
    topRight,
    topY - 30,
    `Top Ø=${topDiameter}mm`,
    5
  );
  
  // Height dimension
  generator.drawDimension(
    baseRight + 40,
    baseY,
    baseRight + 40,
    topY,
    `H=${height}mm`,
    5
  );
}

function drawConeTopView(
  generator: TechnicalDrawingGenerator,
  baseDiameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'TOP VIEW (Base)');
  
  // Scale to fit
  const scale = Math.min(width, height) / baseDiameter * 0.5;
  const scaledRadius = (baseDiameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Base circle
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
    `Base Ø=${baseDiameter}mm`,
    5
  );
}

function drawConeBottomView(
  generator: TechnicalDrawingGenerator,
  topDiameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'BOTTOM VIEW (Top)');
  
  // Scale to fit
  const scale = Math.min(width, height) / topDiameter * 0.5;
  const scaledRadius = (topDiameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Top circle
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
    `Top Ø=${topDiameter}mm`,
    5
  );
}

function drawConeIsometric(
  generator: TechnicalDrawingGenerator,
  baseDiameter: number,
  topDiameter: number,
  height: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height: viewHeight } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'ISOMETRIC VIEW');
  
  // Scale to fit
  const maxDim = Math.max(baseDiameter, height);
  const scale = Math.min(width, viewHeight) / maxDim * 0.5;
  
  const scaledBaseRadius = (baseDiameter / 2) * scale;
  const scaledTopRadius = (topDiameter / 2) * scale;
  const scaledHeight = height * scale;
  
  const centerX = x + width / 2;
  const centerY = y + viewHeight / 2;
  
  const scope = generator.getScope();
  
  // Base ellipse (bottom)
  const baseEllipse = new scope.Path.Ellipse({
    center: [centerX, centerY + scaledHeight / 3],
    radius: [scaledBaseRadius, scaledBaseRadius / 2]
  });
  baseEllipse.strokeColor = new scope.Color('#000000');
  baseEllipse.strokeWidth = 2;
  baseEllipse.fillColor = new scope.Color('#C8C8C8');
  
  // Top ellipse
  const topEllipse = new scope.Path.Ellipse({
    center: [centerX, centerY - scaledHeight / 3],
    radius: [scaledTopRadius, scaledTopRadius / 2]
  });
  topEllipse.strokeColor = new scope.Color('#000000');
  topEllipse.strokeWidth = 2;
  topEllipse.fillColor = new scope.Color('#E8E8E8');
  
  // Side lines connecting base to top
  generator.drawLine(
    centerX - scaledBaseRadius,
    centerY + scaledHeight / 3,
    centerX - scaledTopRadius,
    centerY - scaledHeight / 3,
    'visible'
  );
  
  generator.drawLine(
    centerX + scaledBaseRadius,
    centerY + scaledHeight / 3,
    centerX + scaledTopRadius,
    centerY - scaledHeight / 3,
    'visible'
  );
  
  // Add shading
  const shadePath = new scope.Path();
  shadePath.add(new scope.Point(centerX - scaledBaseRadius, centerY + scaledHeight / 3));
  shadePath.add(new scope.Point(centerX - scaledTopRadius, centerY - scaledHeight / 3));
  
  // Create arc for top
  const topArc = new scope.Path.Arc({
    from: [centerX - scaledTopRadius, centerY - scaledHeight / 3],
    through: [centerX, centerY - scaledHeight / 3 - scaledTopRadius / 2],
    to: [centerX + scaledTopRadius, centerY - scaledHeight / 3]
  });
  
  shadePath.join(topArc);
  shadePath.add(new scope.Point(centerX + scaledBaseRadius, centerY + scaledHeight / 3));
  
  // Create arc for base
  const baseArc = new scope.Path.Arc({
    from: [centerX + scaledBaseRadius, centerY + scaledHeight / 3],
    through: [centerX, centerY + scaledHeight / 3 + scaledBaseRadius / 2],
    to: [centerX - scaledBaseRadius, centerY + scaledHeight / 3]
  });
  
  shadePath.join(baseArc);
  shadePath.closed = true;
  shadePath.fillColor = new scope.Color('#D0D0D0');
  shadePath.opacity = 0.6;
}
