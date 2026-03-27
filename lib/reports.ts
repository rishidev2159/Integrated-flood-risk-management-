import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Captures the dashboard view and generates a PDF intelligence report.
 */
export const generateFloodReport = async (elementId: string, projectName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const isDark = document.documentElement.classList.contains("dark");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      logging: false,
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Header
    doc.setFillColor(isDark ? 15 : 248, isDark ? 23 : 250, isDark ? 42 : 252);
    doc.rect(0, 0, pdfWidth, 20, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isDark ? 248 : 15, isDark ? 250 : 23, isDark ? 252 : 42);
    doc.setFontSize(14);
    doc.text(projectName, 10, 13);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth - 60, 13);
    
    // Main Image (Dashboard State)
    doc.addImage(imgData, "PNG", 0, 25, pdfWidth, pdfHeight);
    
    // Analytics Section
    doc.setFontSize(14);
    doc.setTextColor(56, 189, 248);
    doc.text("Project Dashboard Snapshot", 14, 110);
    doc.addImage(imgData, 'PNG', 14, 115, 180, 100);

    // Final metadata
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 280);
    
    doc.save(`${projectName.replace(/\s+/g, '_')}_Flood_Report.pdf`);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  }
};
