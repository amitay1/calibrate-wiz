import type { TechniqueSheetData } from '@/types/techniqueSheet';
import type { ExportOptions, ExportResult } from '@/types/exportTemplates';

export abstract class BaseExporter {
  protected data: TechniqueSheetData;
  protected options: ExportOptions;

  constructor(data: TechniqueSheetData, options: ExportOptions) {
    this.data = data;
    this.options = options;
  }

  abstract export(): Promise<ExportResult>;

  protected generateFilename(extension: string): string {
    const partNumber = this.data.inspectionSetup?.partNumber || 'Unknown';
    const date = new Date().toISOString().split('T')[0];
    const templateName = this.options.template.name;
    return `UT_${templateName}_${partNumber}_${date}.${extension}`;
  }

  protected shouldIncludeSection(sectionId: string): boolean {
    const section = this.options.template.sections.find(s => s.id === sectionId);
    return section?.enabled ?? false;
  }

  protected getSectionsInOrder() {
    return this.options.template.sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
  }
}
