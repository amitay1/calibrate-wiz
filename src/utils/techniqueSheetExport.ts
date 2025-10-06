import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  StandardType,
  InspectionSetupData,
  EquipmentData,
  CalibrationData,
  ScanParametersData,
  AcceptanceCriteriaData,
  DocumentationData,
} from "@/types/techniqueSheet";

interface TechniqueSheetExportData {
  standard: StandardType;
  inspectionSetup: InspectionSetupData;
  equipment: EquipmentData;
  calibration: CalibrationData;
  scanParameters: ScanParametersData;
  acceptanceCriteria: AcceptanceCriteriaData;
  documentation: DocumentationData;
}

export function exportTechniqueSheetToPDF(data: TechniqueSheetExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Ultrasonic Inspection Technique Sheet", pageWidth / 2, 15, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Standard: ${data.standard}`, pageWidth / 2, 23, { align: "center" });

  yPos = 40;
  doc.setTextColor(0, 0, 0);

  // 1. Inspection Setup
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Inspection Setup", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Parameter", "Value"]],
    body: [
      ["Part Number", data.inspectionSetup.partNumber || "N/A"],
      ["Part Name", data.inspectionSetup.partName || "N/A"],
      ["Material", data.inspectionSetup.material || "N/A"],
      ["Material Spec", data.inspectionSetup.materialSpec || "N/A"],
      ["Part Type", data.inspectionSetup.partType || "N/A"],
      ["Thickness (mm)", data.inspectionSetup.partThickness?.toString() || "N/A"],
      ["Length (mm)", data.inspectionSetup.partLength?.toString() || "N/A"],
      ["Width (mm)", data.inspectionSetup.partWidth?.toString() || "N/A"],
      ["Diameter (mm)", data.inspectionSetup.diameter?.toString() || "N/A"],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // 2. Equipment
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Equipment", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Parameter", "Value"]],
    body: [
      ["Manufacturer", data.equipment.manufacturer || "N/A"],
      ["Model", data.equipment.model || "N/A"],
      ["Serial Number", data.equipment.serialNumber || "N/A"],
      ["Frequency (MHz)", data.equipment.frequency || "N/A"],
      ["Transducer Type", data.equipment.transducerType || "N/A"],
      ["Transducer Diameter (in)", data.equipment.transducerDiameter?.toString() || "N/A"],
      ["Couplant", data.equipment.couplant || "N/A"],
      ["Vertical Linearity (%)", data.equipment.verticalLinearity?.toString() || "N/A"],
      ["Horizontal Linearity (%)", data.equipment.horizontalLinearity?.toString() || "N/A"],
      ["Entry Surface Resolution (in)", data.equipment.entrySurfaceResolution?.toString() || "N/A"],
      ["Back Surface Resolution (in)", data.equipment.backSurfaceResolution?.toString() || "N/A"],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // 3. Calibration
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. Calibration", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Parameter", "Value"]],
    body: [
      ["Standard Type", data.calibration.standardType || "N/A"],
      ["Reference Material", data.calibration.referenceMaterial || "N/A"],
      ["FBH Sizes", data.calibration.fbhSizes || "N/A"],
      ["Metal Travel Distance (mm)", data.calibration.metalTravelDistance?.toString() || "N/A"],
      ["Block Dimensions", data.calibration.blockDimensions || "N/A"],
      ["Block Serial Number", data.calibration.blockSerialNumber || "N/A"],
      ["Last Calibration Date", data.calibration.lastCalibrationDate || "N/A"],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // 4. Scan Parameters
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. Scan Parameters", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Parameter", "Value"]],
    body: [
      ["Scan Method", data.scanParameters.scanMethod || "N/A"],
      ["Scan Type", data.scanParameters.scanType || "N/A"],
      ["Scan Speed (mm/s)", data.scanParameters.scanSpeed?.toString() || "N/A"],
      ["Scan Index (%)", data.scanParameters.scanIndex?.toString() || "N/A"],
      ["Coverage (%)", data.scanParameters.coverage?.toString() || "N/A"],
      ["Scan Pattern", data.scanParameters.scanPattern || "N/A"],
      ["Water Path (mm)", data.scanParameters.waterPath?.toString() || "N/A"],
      ["Pulse Repetition Rate (Hz)", data.scanParameters.pulseRepetitionRate?.toString() || "N/A"],
      ["Gain Settings", data.scanParameters.gainSettings || "N/A"],
      ["Alarm Gate Settings", data.scanParameters.alarmGateSettings || "N/A"],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // 5. Acceptance Criteria
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("5. Acceptance Criteria", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Parameter", "Value"]],
    body: [
      ["Acceptance Class", data.acceptanceCriteria.acceptanceClass || "N/A"],
      ["Single Discontinuity", data.acceptanceCriteria.singleDiscontinuity || "N/A"],
      ["Multiple Discontinuities", data.acceptanceCriteria.multipleDiscontinuities || "N/A"],
      ["Linear Discontinuity", data.acceptanceCriteria.linearDiscontinuity || "N/A"],
      ["Back Reflection Loss (%)", data.acceptanceCriteria.backReflectionLoss?.toString() || "N/A"],
      ["Noise Level", data.acceptanceCriteria.noiseLevel || "N/A"],
      ["Special Requirements", data.acceptanceCriteria.specialRequirements || "N/A"],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // 6. Documentation
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("6. Documentation", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Parameter", "Value"]],
    body: [
      ["Inspector Name", data.documentation.inspectorName || "N/A"],
      ["Certification", data.documentation.inspectorCertification || "N/A"],
      ["Inspector Level", data.documentation.inspectorLevel || "N/A"],
      ["Certifying Organization", data.documentation.certifyingOrganization || "N/A"],
      ["Inspection Date", data.documentation.inspectionDate || "N/A"],
      ["Procedure Number", data.documentation.procedureNumber || "N/A"],
      ["Drawing Reference", data.documentation.drawingReference || "N/A"],
      ["Revision", data.documentation.revision || "N/A"],
      ["Approval Required", data.documentation.approvalRequired ? "Yes" : "No"],
      ["Additional Notes", data.documentation.additionalNotes || "N/A"],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 14 },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = `Technique_Sheet_${data.inspectionSetup.partNumber || "Unknown"}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
