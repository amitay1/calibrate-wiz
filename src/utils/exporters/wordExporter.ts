import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, BorderStyle, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import type { TechniqueSheetData } from '@/types/techniqueSheet';
import type { ExportOptions, ExportResult } from '@/types/exportTemplates';
import { BaseExporter } from './baseExporter';

export class WordExporter extends BaseExporter {
  constructor(data: TechniqueSheetData, options: ExportOptions) {
    super(data, options);
  }

  async export(): Promise<ExportResult> {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            ...this.createHeader(),
            ...this.createBody(),
            ...this.createFooter(),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const filename = this.generateFilename('docx');
      
      saveAs(blob, filename);

      return {
        success: true,
        blob,
        filename,
      };
    } catch (error) {
      console.error('Word export error:', error);
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private createHeader(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    // Title
    paragraphs.push(
      new Paragraph({
        text: 'ULTRASONIC INSPECTION TECHNIQUE SHEET',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    // Document info
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Standard: ${this.data.standardName || 'N/A'} | `,
            bold: true,
          }),
          new TextRun({
            text: `Part Number: ${this.data.inspectionSetup?.partNumber || 'N/A'} | `,
          }),
          new TextRun({
            text: `Date: ${new Date().toLocaleDateString()}`,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      })
    );

    return paragraphs;
  }

  private createBody(): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const sections = this.getSectionsInOrder();

    for (const section of sections) {
      switch (section.id) {
        case 'inspection_setup':
          elements.push(...this.createInspectionSetupSection());
          break;
        case 'equipment':
          elements.push(...this.createEquipmentSection());
          break;
        case 'calibration':
          elements.push(...this.createCalibrationSection());
          break;
        case 'scan_parameters':
          elements.push(...this.createScanParametersSection());
          break;
        case 'acceptance':
          elements.push(...this.createAcceptanceCriteriaSection());
          break;
        case 'documentation':
          elements.push(...this.createDocumentationSection());
          break;
      }
    }

    return elements;
  }

  private createInspectionSetupSection(): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    elements.push(
      new Paragraph({
        text: '1. Inspection Setup',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        this.createTableHeaderRow(['Parameter', 'Value']),
        this.createTableRow('Part Number', this.data.inspectionSetup?.partNumber || 'N/A'),
        this.createTableRow('Part Name', this.data.inspectionSetup?.partName || 'N/A'),
        this.createTableRow('Material', this.data.inspectionSetup?.material || 'N/A'),
        this.createTableRow('Material Spec', this.data.inspectionSetup?.materialSpec || 'N/A'),
        this.createTableRow('Part Type', this.data.inspectionSetup?.partType || 'N/A'),
        this.createTableRow('Thickness (mm)', this.data.inspectionSetup?.partThickness?.toString() || 'N/A'),
        this.createTableRow('Dimensions (mm)', `${this.data.inspectionSetup?.partLength || 'N/A'} × ${this.data.inspectionSetup?.partWidth || 'N/A'}`),
      ],
    });

    elements.push(table);
    return elements;
  }

  private createEquipmentSection(): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    elements.push(
      new Paragraph({
        text: '2. Equipment',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        this.createTableHeaderRow(['Parameter', 'Value']),
        this.createTableRow('Manufacturer', this.data.equipment?.manufacturer || 'N/A'),
        this.createTableRow('Model', this.data.equipment?.model || 'N/A'),
        this.createTableRow('Serial Number', this.data.equipment?.serialNumber || 'N/A'),
        this.createTableRow('Frequency', this.data.equipment?.frequency || 'N/A'),
        this.createTableRow('Transducer Type', this.data.equipment?.transducerType || 'N/A'),
        this.createTableRow('Transducer Diameter', this.data.equipment?.transducerDiameter?.toString() || 'N/A'),
        this.createTableRow('Couplant', this.data.equipment?.couplant || 'N/A'),
      ],
    });

    elements.push(table);
    return elements;
  }

  private createCalibrationSection(): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    elements.push(
      new Paragraph({
        text: '3. Calibration',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        this.createTableHeaderRow(['Parameter', 'Value']),
        this.createTableRow('Standard Type', this.data.calibration?.standardType || 'N/A'),
        this.createTableRow('Reference Material', this.data.calibration?.referenceMaterial || 'N/A'),
        this.createTableRow('FBH Sizes', this.data.calibration?.fbhSizes || 'N/A'),
        this.createTableRow('Metal Travel Distance', this.data.calibration?.metalTravelDistance?.toString() || 'N/A'),
        this.createTableRow('Block Serial Number', this.data.calibration?.blockSerialNumber || 'N/A'),
        this.createTableRow('Last Calibration Date', this.data.calibration?.lastCalibrationDate || 'N/A'),
      ],
    });

    elements.push(table);
    return elements;
  }

  private createScanParametersSection(): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    elements.push(
      new Paragraph({
        text: '4. Scan Parameters',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        this.createTableHeaderRow(['Parameter', 'Value']),
        this.createTableRow('Scan Method', this.data.scanParameters?.scanMethod || 'N/A'),
        this.createTableRow('Scan Type', this.data.scanParameters?.scanType || 'N/A'),
        this.createTableRow('Scan Speed', this.data.scanParameters?.scanSpeed?.toString() || 'N/A'),
        this.createTableRow('Scan Index', this.data.scanParameters?.scanIndex?.toString() || 'N/A'),
        this.createTableRow('Coverage', this.data.scanParameters?.coverage?.toString() || 'N/A'),
        this.createTableRow('Scan Pattern', this.data.scanParameters?.scanPattern || 'N/A'),
      ],
    });

    elements.push(table);
    return elements;
  }

  private createAcceptanceCriteriaSection(): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    elements.push(
      new Paragraph({
        text: '5. Acceptance Criteria',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        this.createTableHeaderRow(['Parameter', 'Value']),
        this.createTableRow('Acceptance Class', this.data.acceptanceCriteria?.acceptanceClass || 'N/A'),
        this.createTableRow('Single Discontinuity', this.data.acceptanceCriteria?.singleDiscontinuity || 'N/A'),
        this.createTableRow('Multiple Discontinuities', this.data.acceptanceCriteria?.multipleDiscontinuities || 'N/A'),
        this.createTableRow('Linear Discontinuity', this.data.acceptanceCriteria?.linearDiscontinuity || 'N/A'),
        this.createTableRow('Back Reflection Loss %', this.data.acceptanceCriteria?.backReflectionLoss?.toString() || 'N/A'),
      ],
    });

    elements.push(table);
    return elements;
  }

  private createDocumentationSection(): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];

    elements.push(
      new Paragraph({
        text: '6. Documentation',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        this.createTableHeaderRow(['Parameter', 'Value']),
        this.createTableRow('Inspector Name', this.data.documentation?.inspectorName || 'N/A'),
        this.createTableRow('Inspector Certification', this.data.documentation?.inspectorCertification || 'N/A'),
        this.createTableRow('Inspector Level', this.data.documentation?.inspectorLevel || 'N/A'),
        this.createTableRow('Certifying Organization', this.data.documentation?.certifyingOrganization || 'N/A'),
        this.createTableRow('Inspection Date', this.data.documentation?.inspectionDate || 'N/A'),
        this.createTableRow('Procedure Number', this.data.documentation?.procedureNumber || 'N/A'),
      ],
    });

    elements.push(table);
    return elements;
  }

  private createFooter(): Paragraph[] {
    return [
      new Paragraph({
        text: `Generated on ${new Date().toLocaleDateString()} | ${this.data.inspectionSetup?.partNumber || 'N/A'}`,
        alignment: AlignmentType.CENTER,
        spacing: { before: 800 },
      }),
    ];
  }

  private createTableHeaderRow(headers: string[]): TableRow {
    return new TableRow({
      tableHeader: true,
      children: headers.map(
        header =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: header,
                    bold: true,
                    color: 'FFFFFF',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: '2563EB',
            },
          })
      ),
    });
  }

  private createTableRow(label: string, value: string): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: value })],
          width: { size: 60, type: WidthType.PERCENTAGE },
        }),
      ],
    });
  }
}
