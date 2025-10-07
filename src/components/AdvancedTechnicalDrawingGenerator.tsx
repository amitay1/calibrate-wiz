import { useEffect, useRef } from 'react';
import paper from 'paper';
// @ts-ignore
import makerjs from 'makerjs';
import { jsPDF } from 'jspdf';
// @ts-ignore
import DxfWriter from 'dxf-writer';
import chroma from 'chroma-js';

interface DrawingGeneratorProps {
  partType: string;
  thickness: string;
  diameter?: string;
  length?: string;
  onImageGenerated: (imageDataUrl: string) => void;
}

interface InspectionZone {
  startAngle: number;
  endAngle: number;
  color: string;
  label: string;
}

interface LineStandard {
  width: number;
  dash: number[] | null;
  color: string;
}

interface CScanData {
  values: number[][];
  min: number;
  max: number;
}

export class AerospaceTechnicalDrawingGenerator {
  public paper: any;
  public maker: any;
  private lineStandards: Record<string, LineStandard>;
  private fonts: any;

  constructor(canvas: HTMLCanvasElement) {
    // Paper.js setup
    this.paper = new paper.PaperScope();
    this.paper.setup(canvas);
    
    // MakerJS
    this.maker = makerjs;
    
    // Setup standards
    this.setupStandards();
  }

  setupStandards() {
    // Line standards per ISO 128
    this.lineStandards = {
      visible: { width: 0.7, dash: null, color: '#000000' },
      hidden: { width: 0.35, dash: [5, 3], color: '#000000' },
      center: { width: 0.35, dash: [10, 3, 3, 3], color: '#000000' },
      dimension: { width: 0.35, dash: null, color: '#000000' },
      cutting: { width: 1.0, dash: [15, 3, 3, 3], color: '#000000' },
      section: { width: 1.0, dash: null, color: '#000000' }
    };

    // Standard fonts
    this.fonts = {
      dimension: { family: 'Arial', size: 3.5 },
      annotation: { family: 'Arial', size: 3.0 },
      title: { family: 'Arial Bold', size: 5.0 }
    };
  }

  // ✅ GD&T Frame - מסגרת מלאה עם כל הסימבולים
  createGDTFrame(options: {
    x: number;
    y: number;
    characteristic: 'position' | 'perpendicular' | 'parallel' | 'circularity' | 'flatness' | 'straightness' | 'cylindricity' | 'profile' | 'angularity' | 'symmetry' | 'concentricity' | 'runout';
    tolerance: string;
    materialCondition?: 'MMC' | 'LMC' | 'RFS';
    datums?: string[];
  }) {
    const { x, y, characteristic, tolerance, materialCondition, datums } = options;
    const group = new this.paper.Group();
    
    // חישוב רוחב דינמי
    const width = 15 + (tolerance.length * 5) + 
                 (datums ? datums.length * 15 : 0) +
                 (materialCondition ? 10 : 0);
    
    // מסגרת ראשית
    const mainFrame = new this.paper.Path.Rectangle({
      point: new this.paper.Point(x, y),
      size: new this.paper.Size(width, 15),
      strokeColor: 'black',
      strokeWidth: 0.5
    });
    group.addChild(mainFrame);
    
    // סימבול מאפיין
    const symbol = this.drawCharacteristicSymbol(characteristic);
    symbol.position = new this.paper.Point(x + 7.5, y + 7.5);
    group.addChild(symbol);
    
    // ערך טולרנס
    const tolText = new this.paper.PointText({
      point: new this.paper.Point(x + 20, y + 10),
      content: tolerance,
      fontSize: 8,
      fontFamily: 'Arial',
      fillColor: 'black'
    });
    group.addChild(tolText);
    
    // תנאי חומר
    if (materialCondition) {
      const mcSymbol = this.drawMaterialCondition(materialCondition);
      mcSymbol.position = new this.paper.Point(x + 35, y + 7.5);
      group.addChild(mcSymbol);
    }
    
    // מפרידים ודאטומים
    if (datums) {
      let datumX = x + 45;
      datums.forEach((datum) => {
        // קו מפריד
        const separator = new this.paper.Path.Line({
          from: new this.paper.Point(datumX - 5, y),
          to: new this.paper.Point(datumX - 5, y + 15),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChild(separator);
        
        // דאטום
        const datumText = new this.paper.PointText({
          point: new this.paper.Point(datumX, y + 10),
          content: datum,
          fontSize: 8,
          fillColor: 'black'
        });
        group.addChild(datumText);
        
        datumX += 15;
      });
    }
    
    return group;
  }

  // ציור סימבול מאפיין GD&T
  drawCharacteristicSymbol(type: string) {
    const group = new this.paper.Group();
    
    switch(type) {
      case 'position': {
        // ⊕ - מעגל עם צלב
        const posCircle = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 5,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const posCross1 = new this.paper.Path.Line({
          from: new this.paper.Point(-5, 0),
          to: new this.paper.Point(5, 0),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const posCross2 = new this.paper.Path.Line({
          from: new this.paper.Point(0, -5),
          to: new this.paper.Point(0, 5),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChildren([posCircle, posCross1, posCross2]);
        break;
      }
      
      case 'perpendicular': {
        // ⊥ - קווים מאונכים
        const perpBase = new this.paper.Path.Line({
          from: new this.paper.Point(-5, 3),
          to: new this.paper.Point(5, 3),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const perpLine = new this.paper.Path.Line({
          from: new this.paper.Point(0, -5),
          to: new this.paper.Point(0, 3),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChildren([perpBase, perpLine]);
        break;
      }
      
      case 'parallel': {
        // ∥ - שני קווים מקבילים
        const par1 = new this.paper.Path.Line({
          from: new this.paper.Point(-5, -2),
          to: new this.paper.Point(5, -2),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const par2 = new this.paper.Path.Line({
          from: new this.paper.Point(-5, 2),
          to: new this.paper.Point(5, 2),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChildren([par1, par2]);
        break;
      }
      
      case 'circularity': {
        // ○ - מעגל פשוט
        const circCircle = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 5,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChild(circCircle);
        break;
      }
      
      case 'flatness': {
        // ⊤ - שני קווים אופקיים
        const flat1 = new this.paper.Path.Line({
          from: new this.paper.Point(-5, -2),
          to: new this.paper.Point(5, -2),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const flat2 = new this.paper.Path.Line({
          from: new this.paper.Point(-5, 2),
          to: new this.paper.Point(5, 2),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChildren([flat1, flat2]);
        break;
      }
      
      case 'straightness': {
        // — - קו ישר אחד
        const straight = new this.paper.Path.Line({
          from: new this.paper.Point(-6, 0),
          to: new this.paper.Point(6, 0),
          strokeColor: 'black',
          strokeWidth: 0.7
        });
        group.addChild(straight);
        break;
      }
      
      case 'cylindricity': {
        // ⌭ - שני מעגלים מחוברים
        const cyl1 = new this.paper.Path.Circle({
          center: new this.paper.Point(-2.5, 0),
          radius: 3,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const cyl2 = new this.paper.Path.Circle({
          center: new this.paper.Point(2.5, 0),
          radius: 3,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const cylLine = new this.paper.Path.Line({
          from: new this.paper.Point(-2.5, -3),
          to: new this.paper.Point(2.5, -3),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChildren([cyl1, cyl2, cylLine]);
        break;
      }
      
      case 'profile': {
        // ⌒ - קו מעוקל
        const profilePath = new this.paper.Path();
        profilePath.add(new this.paper.Point(-5, 3));
        profilePath.quadraticCurveTo(
          new this.paper.Point(0, -3),
          new this.paper.Point(5, 3)
        );
        profilePath.strokeColor = 'black';
        profilePath.strokeWidth = 0.5;
        group.addChild(profilePath);
        break;
      }
      
      case 'angularity': {
        // ∠ - זווית
        const ang1 = new this.paper.Path.Line({
          from: new this.paper.Point(-5, 0),
          to: new this.paper.Point(0, 0),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const ang2 = new this.paper.Path.Line({
          from: new this.paper.Point(0, 0),
          to: new this.paper.Point(3, -4),
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const angArc = new this.paper.Path.Arc({
          from: new this.paper.Point(-2, 0),
          through: new this.paper.Point(-1, -1),
          to: new this.paper.Point(1, -2),
          strokeColor: 'black',
          strokeWidth: 0.3
        });
        group.addChildren([ang1, ang2, angArc]);
        break;
      }
      
      case 'symmetry': {
        // ≈ - שני קווי גל
        const sym1 = new this.paper.Path();
        sym1.add(new this.paper.Point(-5, -1));
        sym1.quadraticCurveTo(
          new this.paper.Point(-2.5, -3),
          new this.paper.Point(0, -1)
        );
        sym1.quadraticCurveTo(
          new this.paper.Point(2.5, 1),
          new this.paper.Point(5, -1)
        );
        sym1.strokeColor = 'black';
        sym1.strokeWidth = 0.5;
        
        const sym2 = new this.paper.Path();
        sym2.add(new this.paper.Point(-5, 2));
        sym2.quadraticCurveTo(
          new this.paper.Point(-2.5, 0),
          new this.paper.Point(0, 2)
        );
        sym2.quadraticCurveTo(
          new this.paper.Point(2.5, 4),
          new this.paper.Point(5, 2)
        );
        sym2.strokeColor = 'black';
        sym2.strokeWidth = 0.5;
        
        group.addChildren([sym1, sym2]);
        break;
      }
      
      case 'concentricity': {
        // ◎ - שני מעגלים קונצנטריים
        const conc1 = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 5,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const conc2 = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 3,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChildren([conc1, conc2]);
        break;
      }
      
      case 'runout': {
        // ↻ - חץ מעגלי
        const runCircle = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 5,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const runArrow = new this.paper.Path([
          [5, 0],
          [3, -1.5],
          [3, 1.5]
        ]);
        runArrow.closePath();
        runArrow.fillColor = 'black';
        group.addChildren([runCircle, runArrow]);
        break;
      }
      
      default: {
        // ברירת מחדל - מעגל פשוט
        const defaultCircle = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 5,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        group.addChild(defaultCircle);
      }
    }
    
    return group;
  }

  // ציור סימבול תנאי חומר
  drawMaterialCondition(condition: string) {
    const group = new this.paper.Group();
    
    switch(condition) {
      case 'MMC': { // Maximum Material Condition - Ⓜ
        const mmcCircle = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 4,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const mmcText = new this.paper.PointText({
          point: new this.paper.Point(-2.5, 2.5),
          content: 'M',
          fontSize: 7,
          fontWeight: 'bold',
          fillColor: 'black'
        });
        group.addChildren([mmcCircle, mmcText]);
        break;
      }
      
      case 'LMC': { // Least Material Condition - Ⓛ
        const lmcCircle = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 4,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const lmcText = new this.paper.PointText({
          point: new this.paper.Point(-2, 2.5),
          content: 'L',
          fontSize: 7,
          fontWeight: 'bold',
          fillColor: 'black'
        });
        group.addChildren([lmcCircle, lmcText]);
        break;
      }
      
      case 'RFS': { // Regardless of Feature Size - Ⓢ
        const rfsCircle = new this.paper.Path.Circle({
          center: new this.paper.Point(0, 0),
          radius: 4,
          strokeColor: 'black',
          strokeWidth: 0.5
        });
        const rfsText = new this.paper.PointText({
          point: new this.paper.Point(-2.5, 2.5),
          content: 'S',
          fontSize: 7,
          fontWeight: 'bold',
          fillColor: 'black'
        });
        group.addChildren([rfsCircle, rfsText]);
        break;
      }
    }
    
    return group;
  }

  // Create ring with inspection zones
  createRingWithInspectionZones(
    centerX: number,
    centerY: number,
    innerDia: number,
    outerDia: number,
    zones: InspectionZone[]
  ) {
    const group = new this.paper.Group();
    
    // Outer circle
    const outerCircle = new this.paper.Path.Circle({
      center: [centerX, centerY],
      radius: outerDia / 2,
      strokeColor: 'black',
      strokeWidth: this.lineStandards.visible.width
    });
    group.addChild(outerCircle);
    
    // Inner circle
    const innerCircle = new this.paper.Path.Circle({
      center: [centerX, centerY],
      radius: innerDia / 2,
      strokeColor: 'black',
      strokeWidth: this.lineStandards.visible.width
    });
    group.addChild(innerCircle);
    
    // Add colored inspection zones
    zones.forEach(zone => {
      const startAngle = zone.startAngle;
      const endAngle = zone.endAngle;
      
      const sector = new this.paper.Path();
      const outerRadius = outerDia / 2;
      const innerRadius = innerDia / 2;
      
      // Move to start of outer arc
      const startX = centerX + Math.cos(startAngle * Math.PI / 180) * outerRadius;
      const startY = centerY + Math.sin(startAngle * Math.PI / 180) * outerRadius;
      sector.moveTo(new this.paper.Point(startX, startY));
      
      // Outer arc
      const endX = centerX + Math.cos(endAngle * Math.PI / 180) * outerRadius;
      const endY = centerY + Math.sin(endAngle * Math.PI / 180) * outerRadius;
      sector.arcTo(new this.paper.Point(endX, endY));
      
      // Line to inner circle
      const innerEndX = centerX + Math.cos(endAngle * Math.PI / 180) * innerRadius;
      const innerEndY = centerY + Math.sin(endAngle * Math.PI / 180) * innerRadius;
      sector.lineTo(new this.paper.Point(innerEndX, innerEndY));
      
      // Inner arc (reverse)
      const innerStartX = centerX + Math.cos(startAngle * Math.PI / 180) * innerRadius;
      const innerStartY = centerY + Math.sin(startAngle * Math.PI / 180) * innerRadius;
      sector.arcTo(new this.paper.Point(innerStartX, innerStartY));
      
      sector.closePath();
      sector.fillColor = new this.paper.Color(zone.color);
      sector.opacity = 0.5;
      sector.strokeColor = 'black';
      sector.strokeWidth = 0.5;
      group.addChild(sector);
      
      // Add label
      const labelAngle = (startAngle + endAngle) / 2;
      const labelRadius = (innerRadius + outerRadius) / 2;
      const label = new this.paper.PointText({
        point: [
          centerX + Math.cos(labelAngle * Math.PI / 180) * labelRadius,
          centerY + Math.sin(labelAngle * Math.PI / 180) * labelRadius + 5
        ],
        content: zone.label,
        fillColor: 'black',
        fontSize: 14,
        fontWeight: 'bold',
        justification: 'center'
      });
      group.addChild(label);
    });
    
    // Add center cross-hair
    const crossSize = 20;
    const hLine = new this.paper.Path.Line({
      from: [centerX - crossSize, centerY],
      to: [centerX + crossSize, centerY],
      strokeColor: 'black',
      strokeWidth: 0.5
    });
    hLine.dashArray = this.lineStandards.center.dash || [];
    
    const vLine = new this.paper.Path.Line({
      from: [centerX, centerY - crossSize],
      to: [centerX, centerY + crossSize],
      strokeColor: 'black',
      strokeWidth: 0.5
    });
    vLine.dashArray = this.lineStandards.center.dash || [];
    
    group.addChildren([hLine, vLine]);
    
    return group;
  }

  // Create cross-section with hatching
  createCrossSection(
    x: number,
    y: number,
    width: number,
    height: number,
    thickness: number,
    angle: number = 45,
    spacing: number = 5
  ) {
    const group = new this.paper.Group();
    
    // Outer rectangle
    const outer = new this.paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      strokeColor: 'black',
      strokeWidth: this.lineStandards.visible.width
    });
    group.addChild(outer);
    
    // Inner rectangle
    const inner = new this.paper.Path.Rectangle({
      point: [x + thickness, y + thickness],
      size: [width - 2 * thickness, height - 2 * thickness],
      strokeColor: 'black',
      strokeWidth: this.lineStandards.visible.width
    });
    group.addChild(inner);
    
    // Create hatching for walls
    const hatchingGroup = new this.paper.Group();
    
    // Left wall hatching
    for (let i = 0; i < height + width; i += spacing) {
      const line = new this.paper.Path.Line({
        from: [x - height, y + i],
        to: [x + width, y + i - width],
        strokeColor: '#666666',
        strokeWidth: 0.35
      });
      
      const clipped = line.intersect(
        new this.paper.Path.Rectangle({
          point: [x, y],
          size: [thickness, height]
        })
      );
      
      if (clipped && clipped.length > 0) {
        hatchingGroup.addChild(clipped);
      }
    }
    
    // Right wall hatching
    for (let i = 0; i < height + width; i += spacing) {
      const line = new this.paper.Path.Line({
        from: [x + width - thickness - height, y + i],
        to: [x + width + width, y + i - width],
        strokeColor: '#666666',
        strokeWidth: 0.35
      });
      
      const clipped = line.intersect(
        new this.paper.Path.Rectangle({
          point: [x + width - thickness, y],
          size: [thickness, height]
        })
      );
      
      if (clipped && clipped.length > 0) {
        hatchingGroup.addChild(clipped);
      }
    }
    
    // Top wall hatching
    for (let i = 0; i < height + width; i += spacing) {
      const line = new this.paper.Path.Line({
        from: [x + i - width, y - width],
        to: [x + i, y + height],
        strokeColor: '#666666',
        strokeWidth: 0.35
      });
      
      const clipped = line.intersect(
        new this.paper.Path.Rectangle({
          point: [x, y],
          size: [width, thickness]
        })
      );
      
      if (clipped && clipped.length > 0) {
        hatchingGroup.addChild(clipped);
      }
    }
    
    // Bottom wall hatching
    for (let i = 0; i < height + width; i += spacing) {
      const line = new this.paper.Path.Line({
        from: [x + i - width, y + height - thickness - width],
        to: [x + i, y + 2 * height],
        strokeColor: '#666666',
        strokeWidth: 0.35
      });
      
      const clipped = line.intersect(
        new this.paper.Path.Rectangle({
          point: [x, y + height - thickness],
          size: [width, thickness]
        })
      );
      
      if (clipped && clipped.length > 0) {
        hatchingGroup.addChild(clipped);
      }
    }
    
    group.addChild(hatchingGroup);
    
    return group;
  }

  // Create professional dimension with arrows
  createDimension(
    p1: [number, number],
    p2: [number, number],
    offset: number,
    text?: string
  ) {
    const group = new this.paper.Group();
    
    // Calculate perpendicular offset
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / length * offset;
    const perpY = dx / length * offset;
    
    const dimP1 = [p1[0] + perpX, p1[1] + perpY];
    const dimP2 = [p2[0] + perpX, p2[1] + perpY];
    
    // Extension lines
    const ext1 = new this.paper.Path.Line({
      from: p1,
      to: dimP1,
      strokeColor: 'black',
      strokeWidth: this.lineStandards.dimension.width
    });
    
    const ext2 = new this.paper.Path.Line({
      from: p2,
      to: dimP2,
      strokeColor: 'black',
      strokeWidth: this.lineStandards.dimension.width
    });
    
    // Dimension line
    const dimLine = new this.paper.Path.Line({
      from: dimP1,
      to: dimP2,
      strokeColor: 'black',
      strokeWidth: this.lineStandards.dimension.width
    });
    
    // Arrows
    const angle = Math.atan2(dimP2[1] - dimP1[1], dimP2[0] - dimP1[0]);
    const arrow1 = this.createArrow(dimP1[0], dimP1[1], angle + Math.PI);
    const arrow2 = this.createArrow(dimP2[0], dimP2[1], angle);
    
    // Text
    const midX = (dimP1[0] + dimP2[0]) / 2;
    const midY = (dimP1[1] + dimP2[1]) / 2;
    const dimText = new this.paper.PointText({
      point: [midX, midY - 5],
      content: text || length.toFixed(1),
      fillColor: 'black',
      fontSize: 12,
      fontFamily: 'Arial',
      justification: 'center'
    });
    
    // Background for text
    const bounds = dimText.bounds;
    const background = new this.paper.Path.Rectangle({
      rectangle: bounds.expand(3),
      fillColor: 'white'
    });
    
    group.addChildren([ext1, ext2, dimLine, arrow1, arrow2, background, dimText]);
    return group;
  }

  // Create arrow
  createArrow(x: number, y: number, angle: number) {
    const arrow = new this.paper.Path([
      [0, 0],
      [-10, -3],
      [-10, 3]
    ]);
    arrow.closed = true;
    arrow.fillColor = 'black';
    arrow.position = new this.paper.Point(x, y);
    arrow.rotate(angle * 180 / Math.PI);
    return arrow;
  }

  // Create C-Scan visualization
  createCScanVisualization(
    x: number,
    y: number,
    data: CScanData,
    width: number,
    height: number
  ) {
    const group = new this.paper.Group();
    
    // Create color scale
    const colorScale = chroma.scale(['#0000FF', '#00FF00', '#FFFF00', '#FF0000'])
      .domain([data.min, data.max]);
    
    const cellWidth = width / data.values[0].length;
    const cellHeight = height / data.values.length;
    
    // Draw heatmap
    data.values.forEach((row, rowIdx) => {
      row.forEach((value, colIdx) => {
        const color = colorScale(value).hex();
        const rect = new this.paper.Path.Rectangle({
          point: [x + colIdx * cellWidth, y + rowIdx * cellHeight],
          size: [cellWidth, cellHeight],
          fillColor: color,
          strokeWidth: 0
        });
        group.addChild(rect);
      });
    });
    
    // Border
    const border = new this.paper.Path.Rectangle({
      point: [x, y],
      size: [width, height],
      strokeColor: 'black',
      strokeWidth: 2
    });
    group.addChild(border);
    
    // Add color scale legend
    const legendX = x + width + 20;
    const legendHeight = height;
    const legendWidth = 30;
    const steps = 50;
    
    for (let i = 0; i < steps; i++) {
      const value = data.min + (data.max - data.min) * (i / steps);
      const color = colorScale(value).hex();
      const rect = new this.paper.Path.Rectangle({
        point: [legendX, y + legendHeight - (i + 1) * legendHeight / steps],
        size: [legendWidth, legendHeight / steps],
        fillColor: color,
        strokeWidth: 0
      });
      group.addChild(rect);
    }
    
    // Legend border
    const legendBorder = new this.paper.Path.Rectangle({
      point: [legendX, y],
      size: [legendWidth, legendHeight],
      strokeColor: 'black',
      strokeWidth: 1
    });
    group.addChild(legendBorder);
    
    // Legend labels
    const maxLabel = new this.paper.PointText({
      point: [legendX + legendWidth + 5, y + 5],
      content: data.max.toFixed(1),
      fillColor: 'black',
      fontSize: 10
    });
    
    const minLabel = new this.paper.PointText({
      point: [legendX + legendWidth + 5, y + legendHeight + 5],
      content: data.min.toFixed(1),
      fillColor: 'black',
      fontSize: 10
    });
    
    group.addChildren([maxLabel, minLabel]);
    
    return group;
  }

  // Export to PDF
  exportToPDF(): jsPDF {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    });
    
    // Export paper.js canvas as image
    const canvas = this.paper.view.element;
    const imgData = canvas.toDataURL('image/png');
    
    pdf.addImage(imgData, 'PNG', 10, 10, 400, 280);
    
    return pdf;
  }

  // Export to DXF
  exportToDXF(): string {
    try {
      const dxf = new DxfWriter();
      
      // Convert Paper.js items to DXF
      this.paper.project.activeLayer.children.forEach((item: any) => {
        this.itemToDXF(item, dxf);
      });
      
      return dxf.toDxfString();
    } catch (error) {
      console.error('DXF export error:', error);
      return '';
    }
  }

  private itemToDXF(item: any, dxf: any) {
    if (item.className === 'Path') {
      if (item.segments) {
        const points = item.segments.map((seg: any) => 
          [seg.point.x, seg.point.y]
        );
        
        if (item.closed) {
          dxf.drawPolyline(points, true);
        } else {
          for (let i = 0; i < points.length - 1; i++) {
            dxf.drawLine(
              points[i][0], points[i][1],
              points[i + 1][0], points[i + 1][1]
            );
          }
        }
      }
    } else if (item.className === 'Group') {
      item.children.forEach((child: any) => {
        this.itemToDXF(child, dxf);
      });
    }
  }

  // Get canvas as image
  getImage(): string {
    return this.paper.view.element.toDataURL('image/png');
  }
}

export const AdvancedTechnicalDrawingGenerator = ({ 
  partType, 
  thickness, 
  diameter, 
  length, 
  onImageGenerated 
}: DrawingGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generatorRef = useRef<AerospaceTechnicalDrawingGenerator | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = 1600;
    canvas.height = 1200;
    
    try {
      const generator = new AerospaceTechnicalDrawingGenerator(canvas);
      generatorRef.current = generator;
      
      generateDrawing(generator);
    } catch (error) {
      console.error('Error initializing generator:', error);
    }
  }, [partType, thickness, diameter, length]);

  const generateDrawing = (generator: AerospaceTechnicalDrawingGenerator) => {
    const t = parseFloat(thickness) || 50;
    const d = parseFloat(diameter || '200');
    const l = parseFloat(length || '400');
    
    // Clear previous drawing
    generator.paper.project.clear();
    
    // Title
    const title = new generator.paper.PointText({
      point: [800, 50],
      content: 'AEROSPACE TECHNICAL DRAWING',
      fillColor: 'black',
      fontSize: 24,
      fontWeight: 'bold',
      justification: 'center'
    });
    
    if (partType === 'tube' || partType === 'disk') {
      // Create ring with inspection zones
      const zones: InspectionZone[] = [
        { startAngle: 0, endAngle: 60, color: '#FFD700', label: 'ZONE A' },
        { startAngle: 60, endAngle: 120, color: '#87CEEB', label: 'ZONE B' },
        { startAngle: 120, endAngle: 180, color: '#FF6347', label: 'ZONE C' },
        { startAngle: 180, endAngle: 240, color: '#90EE90', label: 'ZONE D' },
        { startAngle: 240, endAngle: 300, color: '#DDA0DD', label: 'ZONE E' },
        { startAngle: 300, endAngle: 360, color: '#F0E68C', label: 'ZONE F' }
      ];
      
      const ring = generator.createRingWithInspectionZones(
        400, 400, d * 0.6, d, zones
      );
      
      // Add dimensions
      generator.createDimension(
        [400 - d/2, 400],
        [400 + d/2, 400],
        -60,
        `Ø${d} mm`
      );
      
      generator.createDimension(
        [400 - d*0.3, 400],
        [400 + d*0.3, 400],
        60,
        `Ø${(d * 0.6).toFixed(1)} mm`
      );
      
      // Cross-section view
      const crossSection = generator.createCrossSection(
        900, 300, 300, 300, t
      );
      
      const sectionLabel = new generator.paper.PointText({
        point: [1050, 270],
        content: 'SECTION A-A',
        fillColor: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        justification: 'center'
      });
      
      // C-Scan simulation
      const cScanData: CScanData = {
        values: Array(40).fill(0).map(() => 
          Array(40).fill(0).map(() => Math.random() * 100)
        ),
        min: 0,
        max: 100
      };
      
      generator.createCScanVisualization(950, 700, cScanData, 350, 350);
      
      const cScanLabel = new generator.paper.PointText({
        point: [1125, 670],
        content: 'C-SCAN INSPECTION DATA',
        fillColor: 'black',
        fontSize: 14,
        fontWeight: 'bold',
        justification: 'center'
      });
    }
    
    // Add specifications panel
    const specPanel = new generator.paper.Path.Rectangle({
      point: [50, 1050],
      size: [1500, 120],
      fillColor: '#f8f9fa',
      strokeColor: 'black',
      strokeWidth: 2
    });
    
    const specs = new generator.paper.PointText({
      point: [70, 1080],
      content: `SPECIFICATIONS:\nPart Type: ${partType.toUpperCase()} | Thickness: ${t}mm | Diameter: ${d}mm | Length: ${l}mm | Date: ${new Date().toLocaleDateString()}`,
      fillColor: 'black',
      fontSize: 14,
      fontFamily: 'Arial'
    });
    
    // Render and export
    generator.paper.view.draw();
    
    setTimeout(() => {
      const imageDataUrl = generator.getImage();
      onImageGenerated(imageDataUrl);
    }, 100);
  };

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};