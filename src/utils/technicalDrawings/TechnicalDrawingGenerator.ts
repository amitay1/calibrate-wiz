/**
 * Technical Drawing Generator
 * Generates professional technical drawings compliant with ISO 128 standards
 */

import paper from 'paper';

export interface LineStyle {
  width: number;
  dash?: number[];
  color: string;
  description: string;
}

export interface Dimensions {
  length: number;
  width: number;
  thickness: number;
  diameter?: number;
  outerDiameter?: number;
  innerDiameter?: number;
  wallThickness?: number;
}

export interface LayoutConfig {
  frontView: { x: number; y: number; width: number; height: number };
  topView: { x: number; y: number; width: number; height: number };
  sideView: { x: number; y: number; width: number; height: number };
  isometric: { x: number; y: number; width: number; height: number };
}

// ISO 128 Line Standards
export const LINE_STANDARDS: Record<string, LineStyle> = {
  visible: {
    width: 2.0,
    color: '#000000',
    description: 'Visible outlines'
  },
  hidden: {
    width: 1.0,
    dash: [5, 3],
    color: '#666666',
    description: 'Hidden edges'
  },
  center: {
    width: 0.8,
    dash: [15, 3, 3, 3],
    color: '#0066CC',
    description: 'Center lines'
  },
  dimension: {
    width: 0.6,
    color: '#CC0000',
    description: 'Dimension lines'
  },
  cutting: {
    width: 2.5,
    dash: [20, 3, 3, 3],
    color: '#CC0000',
    description: 'Section cutting plane'
  }
};

export class TechnicalDrawingGenerator {
  private scope: paper.PaperScope;
  private canvas: HTMLCanvasElement;
  private scale: number = 1;
  private _foregroundColor: string | null = null;
  private _dimensionColor: string | null = null;
  private _centerlineColor: string | null = null;
  
  constructor(canvas: HTMLCanvasElement, scale: number = 1) {
    this.canvas = canvas;
    this.scale = scale;
    this.scope = new paper.PaperScope();
    this.scope.setup(canvas);
  }

  private get foregroundColor(): string {
    if (!this._foregroundColor) {
      this._foregroundColor = this.getThemeColor('--foreground') || '#e5e7eb';
    }
    return this._foregroundColor;
  }

  private get dimensionColor(): string {
    if (!this._dimensionColor) {
      this._dimensionColor = this.getThemeColor('--primary') || '#3b82f6';
    }
    return this._dimensionColor;
  }

  private get centerlineColor(): string {
    if (!this._centerlineColor) {
      this._centerlineColor = this.getThemeColor('--muted-foreground') || '#9ca3af';
    }
    return this._centerlineColor;
  }

  private getThemeColor(varName: string): string | null {
    try {
      const computedStyle = getComputedStyle(this.canvas);
      const hslValue = computedStyle.getPropertyValue(varName).trim();
      if (!hslValue) return null;
      
      // Convert HSL values to hex for Paper.js
      const [h, s, l] = hslValue.split(' ').map(v => parseFloat(v));
      return this.hslToHex(h, s, l);
    } catch (error) {
      console.warn(`Failed to get theme color for ${varName}`, error);
      return null;
    }
  }

  private hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  clear() {
    this.scope.project.clear();
  }

  // Draw a line with specific style
  drawLine(x1: number, y1: number, x2: number, y2: number, style: string = 'visible') {
    const lineStyle = LINE_STANDARDS[style] || LINE_STANDARDS.visible;
    const path = new this.scope.Path.Line(
      new this.scope.Point(x1, y1),
      new this.scope.Point(x2, y2)
    );
    
    // Use theme colors
    const color = style === 'dimension' ? this.dimensionColor :
                  style === 'center' ? this.centerlineColor :
                  this.foregroundColor;
    
    path.strokeColor = new this.scope.Color(color);
    path.strokeWidth = lineStyle.width;
    
    if (lineStyle.dash) {
      path.dashArray = lineStyle.dash;
    }
    
    return path;
  }

  // Draw a rectangle with specific style
  drawRectangle(x: number, y: number, width: number, height: number, style: string = 'visible') {
    const lineStyle = LINE_STANDARDS[style] || LINE_STANDARDS.visible;
    const rect = new this.scope.Path.Rectangle(
      new this.scope.Point(x, y),
      new this.scope.Size(width, height)
    );
    
    // Use theme colors
    const color = style === 'dimension' ? this.dimensionColor :
                  style === 'center' ? this.centerlineColor :
                  this.foregroundColor;
    
    rect.strokeColor = new this.scope.Color(color);
    rect.strokeWidth = lineStyle.width;
    rect.fillColor = null;
    
    if (lineStyle.dash) {
      rect.dashArray = lineStyle.dash;
    }
    
    return rect;
  }

  // Draw a circle with specific style
  drawCircle(x: number, y: number, radius: number, style: string = 'visible') {
    const lineStyle = LINE_STANDARDS[style] || LINE_STANDARDS.visible;
    const circle = new this.scope.Path.Circle(
      new this.scope.Point(x, y),
      radius
    );
    
    // Use theme colors
    const color = style === 'dimension' ? this.dimensionColor :
                  style === 'center' ? this.centerlineColor :
                  this.foregroundColor;
    
    circle.strokeColor = new this.scope.Color(color);
    circle.strokeWidth = lineStyle.width;
    circle.fillColor = null;
    
    if (lineStyle.dash) {
      circle.dashArray = lineStyle.dash;
    }
    
    return circle;
  }

  // Draw centerlines (cross)
  drawCenterlines(x: number, y: number, width: number, height: number) {
    // Horizontal centerline
    this.drawLine(x - width * 0.6, y, x + width * 0.6, y, 'center');
    
    // Vertical centerline
    this.drawLine(x, y - height * 0.6, x, y + height * 0.6, 'center');
  }

  // Draw dimension line with arrows and text
  drawDimension(x1: number, y1: number, x2: number, y2: number, label: string, offset: number = 20) {
    const lineStyle = LINE_STANDARDS.dimension;
    
    // Calculate angle
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Offset perpendicular to dimension line
    const offsetX = -Math.sin(angle) * offset;
    const offsetY = Math.cos(angle) * offset;
    
    const startX = x1 + offsetX;
    const startY = y1 + offsetY;
    const endX = x2 + offsetX;
    const endY = y2 + offsetY;
    
    // Extension lines
    this.drawLine(x1, y1, startX, startY, 'dimension');
    this.drawLine(x2, y2, endX, endY, 'dimension');
    
    // Dimension line
    this.drawLine(startX, startY, endX, endY, 'dimension');
    
    // Arrows
    const arrowSize = 8;
    this.drawArrow(startX, startY, angle, arrowSize);
    this.drawArrow(endX, endY, angle + Math.PI, arrowSize);
    
    // Text
    const textX = (startX + endX) / 2;
    const textY = (startY + endY) / 2 - 10;
    this.drawText(textX, textY, label, 12);
  }

  // Draw arrow
  drawArrow(x: number, y: number, angle: number, size: number) {
    const path = new this.scope.Path();
    path.add(new this.scope.Point(x, y));
    path.add(new this.scope.Point(
      x - size * Math.cos(angle - Math.PI / 6),
      y - size * Math.sin(angle - Math.PI / 6)
    ));
    path.add(new this.scope.Point(
      x - size * Math.cos(angle + Math.PI / 6),
      y - size * Math.sin(angle + Math.PI / 6)
    ));
    path.closed = true;
    path.fillColor = new this.scope.Color(this.dimensionColor);
  }

  // Draw text
  drawText(x: number, y: number, text: string, fontSize: number = 12, color?: string) {
    const textItem = new this.scope.PointText(new this.scope.Point(x, y));
    textItem.content = text;
    textItem.fontSize = fontSize;
    textItem.fillColor = new this.scope.Color(color || this.foregroundColor);
    textItem.fontFamily = 'Arial, sans-serif';
    textItem.justification = 'center';
    return textItem;
  }

  // Draw hatching (for sections)
  drawHatching(x: number, y: number, width: number, height: number, angle: number = 45, spacing: number = 5) {
    const group = new this.scope.Group();
    const rect = new this.scope.Path.Rectangle(
      new this.scope.Point(x, y),
      new this.scope.Size(width, height)
    );
    
    const angleRad = (angle * Math.PI) / 180;
    const maxDim = Math.max(width, height) * 2;
    const numLines = Math.ceil(maxDim / spacing);
    
    for (let i = -numLines; i < numLines; i++) {
      const offset = i * spacing;
      const x1 = x + width / 2 + offset * Math.cos(angleRad) - maxDim * Math.sin(angleRad);
      const y1 = y + height / 2 + offset * Math.sin(angleRad) + maxDim * Math.cos(angleRad);
      const x2 = x + width / 2 + offset * Math.cos(angleRad) + maxDim * Math.sin(angleRad);
      const y2 = y + height / 2 + offset * Math.sin(angleRad) - maxDim * Math.cos(angleRad);
      
      const line = new this.scope.Path.Line(
        new this.scope.Point(x1, y1),
        new this.scope.Point(x2, y2)
      );
      line.strokeColor = new this.scope.Color(this.centerlineColor);
      line.strokeWidth = 0.5;
      line.opacity = 0.5;
      
      const clipped = line.intersect(rect);
      group.addChild(clipped);
      line.remove();
    }
    
    rect.remove();
    return group;
  }

  // Draw view label
  drawViewLabel(x: number, y: number, label: string) {
    this.drawText(x, y - 15, label, 14, this.dimensionColor);
  }

  // Export to SVG
  exportToSVG(): string {
    return this.scope.project.exportSVG({ asString: true }) as string;
  }

  // Get Paper.js scope (for advanced usage)
  getScope() {
    return this.scope;
  }

  // Render the view
  render() {
    this.scope.view.update();
  }
}
