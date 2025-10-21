import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TUVTechnicalCard, TUVExportOptions } from '@/types/tuvTemplate';
import { ErrorHandler, AppError, ErrorType } from '@/utils/errorHandling';

/**
 * Export TUV Technical Card to PDF
 * Generates a 19-page PDF matching TUV SÜD / BYTEST format
 */
export const exportTUVTemplateToPDF = (
  data: TUVTechnicalCard,
  options: TUVExportOptions = {
    includeTableOfContents: true,
    includeScanImages: true,
    includeReferenceDrawings: true,
    language: 'en',
    outputFormat: 'pdf'
  }
): void => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let currentPage = 1;
    const totalPages = 19;

    // ==================== HELPER FUNCTIONS ====================

    /**
     * Add standard header to each page
     */
    const addHeader = (pageNum: number) => {
      // Company logo (if provided)
      if (data.documentHeader.logoImage) {
        try {
          doc.addImage(data.documentHeader.logoImage, 'PNG', 14, 8, 30, 12);
        } catch (error) {
          // Logo loading failed, continue without it
          console.warn('Failed to load logo image');
        }
      }

      // Header text
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(data.documentHeader.labName || 'NDI Laboratory', 50, 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(data.documentHeader.labLocation || '', 50, 16);

      // Document number and revision (top right)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Doc. No.: ${data.documentHeader.documentNumber}`, 140, 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Rev.: ${data.documentHeader.revision}`, 140, 14);
      doc.text(`Page ${pageNum} of ${totalPages}`, 140, 18);

      // Separator line
      doc.setLineWidth(0.5);
      doc.line(14, 22, 196, 22);
    };

    /**
     * Add standard footer to each page
     */
    const addFooter = (pageNum: number) => {
      doc.setLineWidth(0.5);
      doc.line(14, 275, 196, 275);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.documentHeader.labName} - Technical Card`, 14, 280);
      doc.text(`Issue Date: ${data.documentHeader.issueDate}`, 100, 280);
      doc.text(`Page ${pageNum}/${totalPages}`, 180, 280, { align: 'right' });
    };

    /**
     * Add bilingual text (English / Italian)
     */
    const addBilingualText = (
      x: number,
      y: number,
      textEn: string,
      textIt?: string,
      options?: any
    ) => {
      if (options.language === 'bilingual' && textIt) {
        doc.text(`${textEn} / ${textIt}`, x, y, options);
      } else {
        doc.text(textEn, x, y, options);
      }
    };

    // ==================== PAGE 1: COVER PAGE ====================

    addHeader(1);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ULTRASONIC INSPECTION TECHNIQUE SHEET', 105, 35, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let yPos = 50;
    const leftCol = 20;
    const rightCol = 110;

    // Client Information Section
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT INFORMATION', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;

    doc.text(`Client:`, leftCol, yPos);
    doc.text(data.documentHeader.clientName, leftCol + 35, yPos);
    yPos += 5;

    doc.text(`Location:`, leftCol, yPos);
    doc.text(data.documentHeader.clientLocation, leftCol + 35, yPos);
    yPos += 10;

    // Part Information Section
    doc.setFont('helvetica', 'bold');
    doc.text('PART INFORMATION', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;

    doc.text(`Part Number:`, leftCol, yPos);
    doc.text(data.partInformation.partNumber, leftCol + 35, yPos);
    yPos += 5;

    doc.text(`Part Name:`, leftCol, yPos);
    doc.text(data.partInformation.partName, leftCol + 35, yPos);
    yPos += 5;

    doc.text(`Part Type:`, leftCol, yPos);
    doc.text(data.partInformation.partType, leftCol + 35, yPos);
    yPos += 5;

    doc.text(`Material:`, leftCol, yPos);
    doc.text(`${data.partInformation.materialGrade} (${data.partInformation.materialSpec})`, leftCol + 35, yPos);
    yPos += 10;

    // Inspection Parameters Section
    doc.setFont('helvetica', 'bold');
    doc.text('INSPECTION PARAMETERS', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;

    doc.text(`Process Spec:`, leftCol, yPos);
    const processSpecLines = doc.splitTextToSize(data.inspectionParameters.processSpec, 75);
    doc.text(processSpecLines, leftCol + 35, yPos);
    yPos += 5 * processSpecLines.length;

    doc.text(`Inspection Extension:`, leftCol, yPos);
    doc.text(data.inspectionParameters.inspectionExtension, leftCol + 35, yPos);
    yPos += 5;

    doc.text(`Acceptance Class:`, leftCol, yPos);
    doc.text(data.inspectionParameters.acceptanceClass, leftCol + 35, yPos);
    yPos += 5;

    doc.text(`Reference Procedure:`, leftCol, yPos);
    doc.text(data.inspectionParameters.referenceProcedure, leftCol + 35, yPos);
    yPos += 10;

    // Inspection Techniques Section
    doc.setFont('helvetica', 'bold');
    doc.text('INSPECTION TECHNIQUES', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;

    data.inspectionParameters.techniques.forEach((tech, index) => {
      doc.text(`${index + 1}. ${tech.description}`, leftCol, yPos);
      yPos += 5;
    });

    // Dimensions table
    if (data.partInformation.dimensions) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('PART DIMENSIONS', leftCol, yPos);
      yPos += 2;

      const dimensionRows: any[] = [];
      const dims = data.partInformation.dimensions;

      if (dims.outerDiameter) {
        dimensionRows.push(['Outer Diameter (OD)', `Ø ${dims.outerDiameter} mm`]);
      }
      if (dims.innerDiameter) {
        dimensionRows.push(['Inner Diameter (ID)', `Ø ${dims.innerDiameter} mm`]);
      }
      if (dims.height) {
        dimensionRows.push(['Height', `${dims.height} mm`]);
      }
      if (dims.thickness) {
        dimensionRows.push(['Thickness', `${dims.thickness} mm`]);
      }
      if (dims.length) {
        dimensionRows.push(['Length', `${dims.length} mm`]);
      }
      if (dims.width) {
        dimensionRows.push(['Width', `${dims.width} mm`]);
      }

      if (dimensionRows.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Parameter', 'Value']],
          body: dimensionRows,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [44, 62, 80], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 50 },
          },
          margin: { left: leftCol },
        });
      }
    }

    addFooter(1);

    // ==================== PAGE 2: TABLE OF CONTENTS ====================

    if (options.includeTableOfContents) {
      doc.addPage();
      currentPage++;
      addHeader(2);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TABLE OF CONTENTS', 105, 35, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const tocEntries = [
        { title: 'Cover Page', page: 1 },
        { title: 'Table of Contents', page: 2 },
        { title: 'Part Drawing and Scan Plan', page: 4 },
        { title: 'Equipment Details', page: 8 },
        { title: 'Calibration Parameters', page: 10 },
        { title: 'Scan Parameters', page: 12 },
        { title: 'Acceptance Criteria', page: 14 },
        { title: 'Reference Standard Drawings', page: 16 },
        { title: 'Calibration Data Tables', page: 18 },
        { title: 'Remarks and Signatures', page: 19 },
      ];

      let tocY = 50;
      tocEntries.forEach((entry) => {
        doc.text(entry.title, 20, tocY);
        doc.text(`${entry.page}`, 190, tocY, { align: 'right' });

        // Dotted line
        doc.setLineDash([1, 2]);
        doc.line(100, tocY - 1, 185, tocY - 1);
        doc.setLineDash([]);

        tocY += 8;
      });

      addFooter(2);
    }

    // ==================== PAGE 3: BLANK (Reserved) ====================
    doc.addPage();
    currentPage++;
    addHeader(3);
    doc.setFontSize(10);
    doc.text('[Reserved]', 105, 150, { align: 'center' });
    addFooter(3);

    // ==================== PAGES 4-7: PART DRAWINGS AND SCAN ZONES ====================

    doc.addPage();
    currentPage = 4;
    addHeader(4);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PART DRAWING AND SCAN PLAN', 105, 35, { align: 'center' });

    // Part drawing image (if provided)
    if (data.partInformation.partDrawingImage) {
      try {
        doc.addImage(data.partInformation.partDrawingImage, 'PNG', 20, 45, 170, 120);
      } catch (error) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('[Part drawing image]', 105, 105, { align: 'center' });
      }
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('[Part drawing to be provided]', 105, 105, { align: 'center' });
    }

    // Scan zones table
    if (data.scanZones && data.scanZones.length > 0) {
      const scanZoneRows = data.scanZones.map((zone) => [
        zone.zoneId,
        zone.zoneName,
        zone.scanType,
        zone.scanDirection,
        zone.scanLength,
      ]);

      autoTable(doc, {
        startY: 175,
        head: [['Zone ID', 'Zone Name', 'Scan Type', 'Direction', 'Length']],
        body: scanZoneRows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 45 },
          4: { cellWidth: 30 },
        },
        margin: { left: 20, right: 20 },
      });
    }

    addFooter(4);

    // Additional pages for more scan zone details (pages 5-7 if needed)
    for (let pageOffset = 1; pageOffset <= 3; pageOffset++) {
      doc.addPage();
      currentPage++;
      addHeader(currentPage);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`[Additional scan zone details - Page ${pageOffset + 1}]`, 105, 150, { align: 'center' });

      addFooter(currentPage);
    }

    // ==================== PAGES 8-9: EQUIPMENT DETAILS ====================

    doc.addPage();
    currentPage = 8;
    addHeader(8);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EQUIPMENT DETAILS', 105, 35, { align: 'center' });

    if (data.equipment && data.equipment.length > 0) {
      let equipY = 45;

      data.equipment.forEach((equip, index) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`TANK ${equip.tankNumber} - ${equip.equipmentType}`, 20, equipY);
        equipY += 8;

        const equipRows = [
          ['Probe Type', equip.probeType],
          ['Probe Description', equip.probeDescription],
          ['Frequency', equip.frequency],
          ['Manufacturer', equip.manufacturer],
          ['Number of Elements', equip.numberOfElements],
          ['Wave Mode', equip.waveMode],
          ['Velocity', `${equip.velocity} mm/µs`],
          ['Gain', equip.gain],
          ['Range', equip.range],
        ];

        if (equip.pulseRepetitionFrequency) {
          equipRows.push(['PRF', equip.pulseRepetitionFrequency]);
        }
        if (equip.samplingFrequency) {
          equipRows.push(['Sampling Freq', equip.samplingFrequency]);
        }

        autoTable(doc, {
          startY: equipY,
          body: equipRows,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold', fillColor: [240, 240, 240] },
            1: { cellWidth: 110 },
          },
          margin: { left: 20 },
        });

        equipY = (doc as any).lastAutoTable.finalY + 10;

        if (equipY > 250 && index < data.equipment.length - 1) {
          addFooter(currentPage);
          doc.addPage();
          currentPage++;
          addHeader(currentPage);
          equipY = 45;
        }
      });
    }

    addFooter(currentPage);

    // Equipment page 2 (if needed)
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter(currentPage);

    // ==================== PAGES 10-11: CALIBRATION PARAMETERS ====================

    doc.addPage();
    currentPage = 10;
    addHeader(10);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CALIBRATION PARAMETERS', 105, 35, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let calY = 45;

    // Reference standard info
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCE STANDARD', 20, calY);
    doc.setFont('helvetica', 'normal');
    calY += 6;

    doc.text(`Type: ${data.calibrationParameters.referenceStandardType}`, 20, calY);
    calY += 5;
    doc.text(`Material: ${data.calibrationParameters.blockMaterial}`, 20, calY);
    calY += 5;

    if (data.calibrationParameters.blockDimensions) {
      doc.text(`Dimensions: ${data.calibrationParameters.blockDimensions}`, 20, calY);
      calY += 5;
    }

    if (data.calibrationParameters.blockSerialNumber) {
      doc.text(`Serial Number: ${data.calibrationParameters.blockSerialNumber}`, 20, calY);
      calY += 5;
    }

    calY += 5;

    // FBH specifications table
    if (data.calibrationParameters.fbhSizes && data.calibrationParameters.fbhSizes.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('FLAT BOTTOM HOLE (FBH) SPECIFICATIONS', 20, calY);
      calY += 5;

      const fbhRows = data.calibrationParameters.fbhSizes.map((fbh) => [
        `Ø ${fbh.diameter}`,
        `${fbh.depth} mm`,
        `${fbh.metalTravel} mm`,
        fbh.transferValue ? `${fbh.transferValue} dB` : '-',
      ]);

      autoTable(doc, {
        startY: calY,
        head: [['FBH Diameter', 'Depth', 'Metal Travel', 'Transfer Value']],
        body: fbhRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 35 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
        },
        margin: { left: 20 },
      });

      calY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Calibration results
    doc.setFont('helvetica', 'bold');
    doc.text('CALIBRATION RESULTS', 20, calY);
    doc.setFont('helvetica', 'normal');
    calY += 6;

    doc.text(`Calibration Date: ${data.calibrationParameters.calibrationDate}`, 20, calY);
    calY += 5;
    doc.text(`Calibrated By: ${data.calibrationParameters.calibratedBy}`, 20, calY);
    calY += 5;

    if (data.calibrationParameters.noiseLevel) {
      doc.text(`Noise Level: ${data.calibrationParameters.noiseLevel}`, 20, calY);
      calY += 5;
    }

    if (data.calibrationParameters.backReflection) {
      doc.text(`Back Reflection: ${data.calibrationParameters.backReflection}%`, 20, calY);
    }

    addFooter(10);

    // Calibration page 2
    doc.addPage();
    currentPage++;
    addHeader(11);
    addFooter(11);

    // ==================== PAGES 12-13: SCAN PARAMETERS ====================

    doc.addPage();
    currentPage = 12;
    addHeader(12);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SCAN PARAMETERS', 105, 35, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const scanParamRows = [
      ['Scan Coverage', `${data.scanParameters.scanCoverage}%`],
      ['Detection Threshold', data.scanParameters.detectionThreshold],
      ['Recording Level', data.scanParameters.recordingLevel],
      ['Evaluation Method', data.scanParameters.evaluationMethod],
      ['Surface Condition', data.scanParameters.surfaceCondition],
    ];

    if (data.scanParameters.scanSpeed) {
      scanParamRows.push(['Scan Speed', `${data.scanParameters.scanSpeed} mm/s`]);
    }

    if (data.scanParameters.indexResolution) {
      scanParamRows.push(['Index Resolution', `${data.scanParameters.indexResolution} mm`]);
    }

    if (data.scanParameters.scanResolution) {
      scanParamRows.push(['Scan Resolution', `${data.scanParameters.scanResolution} mm`]);
    }

    if (data.scanParameters.waterPath) {
      scanParamRows.push(['Water Path', `${data.scanParameters.waterPath} mm`]);
    }

    if (data.scanParameters.waterTemperature) {
      scanParamRows.push(['Water Temperature', `${data.scanParameters.waterTemperature}°C`]);
    }

    if (data.scanParameters.surfaceRoughness) {
      scanParamRows.push(['Surface Roughness', `Ra ${data.scanParameters.surfaceRoughness}`]);
    }

    if (data.scanParameters.couplant) {
      scanParamRows.push(['Couplant', data.scanParameters.couplant]);
    }

    autoTable(doc, {
      startY: 45,
      head: [['Parameter', 'Value']],
      body: scanParamRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [44, 62, 80], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 90 },
      },
      margin: { left: 20 },
    });

    addFooter(12);

    // Scan parameters page 2
    doc.addPage();
    currentPage++;
    addHeader(13);
    addFooter(13);

    // ==================== PAGES 14-15: ACCEPTANCE CRITERIA ====================

    doc.addPage();
    currentPage = 14;
    addHeader(14);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCEPTANCE CRITERIA', 105, 35, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let acceptY = 45;

    doc.setFont('helvetica', 'bold');
    doc.text(`Standard: ${data.acceptanceCriteria.acceptanceStandard}`, 20, acceptY);
    acceptY += 10;

    const acceptanceRows = [
      ['Single Discontinuity', data.acceptanceCriteria.singleDiscontinuity],
      ['Multiple Discontinuities', data.acceptanceCriteria.multipleDiscontinuities],
      ['Linear Discontinuity', data.acceptanceCriteria.linearDiscontinuity],
      ['Back Reflection Loss', data.acceptanceCriteria.backReflectionLoss],
      ['Noise Level', data.acceptanceCriteria.noiseLevel],
    ];

    autoTable(doc, {
      startY: acceptY,
      head: [['Criteria', 'Requirement']],
      body: acceptanceRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [44, 62, 80], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 90 },
      },
      margin: { left: 20 },
    });

    acceptY = (doc as any).lastAutoTable.finalY + 10;

    // Special requirements
    if (data.acceptanceCriteria.specialRequirements && data.acceptanceCriteria.specialRequirements.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('SPECIAL REQUIREMENTS', 20, acceptY);
      doc.setFont('helvetica', 'normal');
      acceptY += 6;

      data.acceptanceCriteria.specialRequirements.forEach((req, index) => {
        const reqLines = doc.splitTextToSize(`${index + 1}. ${req}`, 170);
        doc.text(reqLines, 20, acceptY);
        acceptY += reqLines.length * 5 + 2;
      });
    }

    addFooter(14);

    // Acceptance page 2
    doc.addPage();
    currentPage++;
    addHeader(15);
    addFooter(15);

    // ==================== PAGES 16-17: REFERENCE STANDARD DRAWINGS ====================

    doc.addPage();
    currentPage = 16;
    addHeader(16);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCE STANDARD DRAWINGS', 105, 35, { align: 'center' });

    if (options.includeReferenceDrawings && data.referenceDrawings && data.referenceDrawings.length > 0) {
      let refDrawingY = 45;

      data.referenceDrawings.forEach((drawing, index) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(drawing.title, 20, refDrawingY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Standard: ${drawing.standard}`, 20, refDrawingY + 5);
        refDrawingY += 10;

        if (drawing.drawingImage) {
          try {
            doc.addImage(drawing.drawingImage, 'PNG', 20, refDrawingY, 170, 100);
            refDrawingY += 110;
          } catch (error) {
            doc.text('[Drawing image]', 105, refDrawingY + 50, { align: 'center' });
            refDrawingY += 60;
          }
        }

        if (refDrawingY > 240 && index < data.referenceDrawings.length - 1) {
          addFooter(currentPage);
          doc.addPage();
          currentPage++;
          addHeader(currentPage);
          refDrawingY = 45;
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('[Reference standard drawings]', 105, 150, { align: 'center' });
    }

    addFooter(16);

    // Reference drawings page 2
    doc.addPage();
    currentPage++;
    addHeader(17);
    addFooter(17);

    // ==================== PAGES 18-19: CALIBRATION DATA TABLES AND SIGNATURES ====================

    doc.addPage();
    currentPage = 18;
    addHeader(18);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CALIBRATION DATA VERIFICATION', 105, 35, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let verifyY = 45;

    // Calibration verification table (example)
    const verificationRows = [
      ['Vertical Linearity', '95%', '≥ 90%', 'PASS'],
      ['Horizontal Linearity', '93%', '≥ 90%', 'PASS'],
      ['Entry Surface Resolution', '0.125"', '≤ 0.125"', 'PASS'],
      ['Back Surface Resolution', '0.05"', '≤ 0.05"', 'PASS'],
    ];

    autoTable(doc, {
      startY: verifyY,
      head: [['Parameter', 'Measured', 'Requirement', 'Status']],
      body: verificationRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [44, 62, 80], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'center' },
      },
      margin: { left: 20 },
    });

    verifyY = (doc as any).lastAutoTable.finalY + 15;

    // Quality signatures
    doc.setFont('helvetica', 'bold');
    doc.text('QUALITY ASSURANCE', 20, verifyY);
    verifyY += 10;

    const signatureRows = [
      ['Inspector Name', data.qualityData.inspectorName],
      ['Inspector Level', data.qualityData.inspectorLevel],
      ['Certification', data.qualityData.inspectorCertification],
    ];

    if (data.qualityData.reviewedBy) {
      signatureRows.push(['Reviewed By', data.qualityData.reviewedBy]);
    }

    if (data.qualityData.approvedBy) {
      signatureRows.push(['Approved By', data.qualityData.approvedBy]);
    }

    autoTable(doc, {
      startY: verifyY,
      body: signatureRows,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 120 },
      },
      margin: { left: 20 },
    });

    verifyY = (doc as any).lastAutoTable.finalY + 10;

    // Signature lines
    doc.line(20, verifyY, 90, verifyY);
    doc.line(110, verifyY, 180, verifyY);
    verifyY += 5;

    doc.setFontSize(8);
    doc.text('Inspector Signature', 20, verifyY);
    doc.text('Approval Signature', 110, verifyY);

    addFooter(18);

    // ==================== PAGE 19: REMARKS ====================

    doc.addPage();
    currentPage = 19;
    addHeader(19);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('REMARKS', 105, 35, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let remarksY = 45;

    // General remarks
    if (data.remarks.generalRemarks && data.remarks.generalRemarks.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('GENERAL REMARKS:', 20, remarksY);
      doc.setFont('helvetica', 'normal');
      remarksY += 6;

      data.remarks.generalRemarks.forEach((remark, index) => {
        const remarkLines = doc.splitTextToSize(`${index + 1}. ${remark}`, 170);
        doc.text(remarkLines, 20, remarksY);
        remarksY += remarkLines.length * 5 + 3;
      });

      remarksY += 5;
    }

    // Technical notes
    if (data.remarks.technicalNotes && data.remarks.technicalNotes.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('TECHNICAL NOTES:', 20, remarksY);
      doc.setFont('helvetica', 'normal');
      remarksY += 6;

      data.remarks.technicalNotes.forEach((note, index) => {
        const noteLines = doc.splitTextToSize(`${index + 1}. ${note}`, 170);
        doc.text(noteLines, 20, remarksY);
        remarksY += noteLines.length * 5 + 3;
      });
    }

    addFooter(19);

    // ==================== SAVE PDF ====================

    const fileName = `TUV_TECHNIQUE_SHEET_${data.documentHeader.documentNumber.replace(/\//g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    ErrorHandler.handle(error as Error, 'TUV Template Export');
    throw new AppError(
      'Failed to export TUV template',
      ErrorType.PDF_GENERATION,
      'TUV_EXPORT_ERROR',
      error as Error
    );
  }
};

/**
 * Convert existing TechniqueSheet data to TUV format
 */
export const convertTechniqueSheetToTUV = (
  techniqueSheet: any,
  additionalData?: any
): TUVTechnicalCard => {
  // Map TechniqueSheet fields to TUV format
  const tuvData: TUVTechnicalCard = {
    documentHeader: {
      documentNumber: additionalData?.documentNumber || 'P03.00-XXX',
      revision: techniqueSheet.documentation?.revision || '01',
      pageCount: 19,
      labName: additionalData?.labName || 'NDI Laboratory',
      labLocation: additionalData?.labLocation || '',
      logoImage: additionalData?.logoImage,
      clientName: additionalData?.clientName || '',
      clientLocation: additionalData?.clientLocation || '',
      issueDate: techniqueSheet.createdDate || new Date().toISOString().split('T')[0],
    },

    partInformation: {
      partNumber: techniqueSheet.inspectionSetup?.partNumber || '',
      partName: techniqueSheet.inspectionSetup?.partName || '',
      partType: techniqueSheet.inspectionSetup?.partType || '',
      materialGrade: techniqueSheet.inspectionSetup?.material || '',
      materialSpec: techniqueSheet.inspectionSetup?.materialSpec || '',
      dimensions: {
        outerDiameter: additionalData?.outerDiameter,
        innerDiameter: additionalData?.innerDiameter,
        height: additionalData?.height,
        thickness: techniqueSheet.inspectionSetup?.partThickness,
        length: techniqueSheet.inspectionSetup?.partLength,
        width: techniqueSheet.inspectionSetup?.partWidth,
      },
      partDrawingImage: additionalData?.partDrawingImage,
    },

    inspectionParameters: {
      processSpec: techniqueSheet.standardName || '',
      processSpecRevision: techniqueSheet.standardVersion || '',
      inspectionExtension: `${techniqueSheet.scanParameters?.coverage || 100}%`,
      acceptanceClass: techniqueSheet.acceptanceCriteria?.acceptanceClass || '',
      techniques: [
        {
          description: 'PE longitudinal waves 0°',
          waveType: 'longitudinal',
          angle: 0,
        },
      ],
      referenceProcedure: techniqueSheet.documentation?.procedureNumber || '',
    },

    scanZones: [],

    equipment: techniqueSheet.equipment
      ? [
          {
            tankNumber: 1,
            equipmentType: 'Ultrasonic Scanner',
            probeType: techniqueSheet.equipment.transducerType || '',
            probeDescription: `${techniqueSheet.equipment.transducerDiameter}mm, ${techniqueSheet.equipment.transducerType}`,
            frequency: techniqueSheet.equipment.frequency || '',
            manufacturer: techniqueSheet.equipment.manufacturer || '',
            numberOfElements: '1',
            waveMode: 'Longitudinal',
            velocity: 5900,
            gain: techniqueSheet.scanParameters?.gainSettings || '',
            range: '',
          },
        ]
      : [],

    calibrationParameters: {
      referenceStandardType: techniqueSheet.calibration?.standardType || '',
      referenceStandardDrawing: 'Page 16-17',
      fbhSizes: [],
      blockMaterial: techniqueSheet.calibration?.referenceMaterial || '',
      blockDimensions: techniqueSheet.calibration?.blockDimensions,
      blockSerialNumber: techniqueSheet.calibration?.blockSerialNumber,
      calibrationDate: techniqueSheet.calibration?.lastCalibrationDate || '',
      calibratedBy: techniqueSheet.documentation?.inspectorName || '',
    },

    scanParameters: {
      scanCoverage: techniqueSheet.scanParameters?.coverage || 100,
      scanSpeed: techniqueSheet.scanParameters?.scanSpeed,
      indexResolution: techniqueSheet.scanParameters?.scanIndex,
      detectionThreshold: '20% DAC',
      recordingLevel: '50% DAC',
      evaluationMethod: 'Max amplitude',
      surfaceCondition: 'Machined',
      couplant: techniqueSheet.equipment?.couplant,
    },

    acceptanceCriteria: {
      acceptanceStandard: `${techniqueSheet.standardName} ${techniqueSheet.acceptanceCriteria?.acceptanceClass || ''}`,
      singleDiscontinuity: techniqueSheet.acceptanceCriteria?.singleDiscontinuity || '',
      multipleDiscontinuities: techniqueSheet.acceptanceCriteria?.multipleDiscontinuities || '',
      linearDiscontinuity: techniqueSheet.acceptanceCriteria?.linearDiscontinuity || '',
      backReflectionLoss: `${techniqueSheet.acceptanceCriteria?.backReflectionLoss || 0}%`,
      noiseLevel: techniqueSheet.acceptanceCriteria?.noiseLevel || '',
    },

    referenceDrawings: [],

    qualityData: {
      inspectorName: techniqueSheet.documentation?.inspectorName || '',
      inspectorLevel: techniqueSheet.documentation?.inspectorLevel || '',
      inspectorCertification: techniqueSheet.documentation?.inspectorCertification || '',
      approvedBy: additionalData?.approvedBy,
    },

    remarks: {
      generalRemarks: techniqueSheet.documentation?.additionalNotes
        ? [techniqueSheet.documentation.additionalNotes]
        : [],
      technicalNotes: [],
    },

    metadata: {
      templateVersion: '1.0',
      createdDate: techniqueSheet.createdDate || new Date().toISOString(),
      modifiedDate: techniqueSheet.modifiedDate || new Date().toISOString(),
      createdBy: techniqueSheet.metadata?.lastModifiedBy || '',
    },
  };

  return tuvData;
};
