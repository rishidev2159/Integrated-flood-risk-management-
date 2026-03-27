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
      backgroundColor: isDark ? "#111827" : "#ffffff",
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(elementId);
        if (el) {
          el.style.height = 'auto';
          el.style.overflow = 'visible';
        }
      }
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 190; // mm (A4 width - margins)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Header styling
    doc.setFillColor(isDark ? 31 : 243, isDark ? 41 : 244, isDark ? 55 : 246);
    doc.rect(0, 0, pdfWidth, 25, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isDark ? 255 : 31, isDark ? 255 : 41, isDark ? 255 : 55);
    doc.setFontSize(16);
    doc.text("Flood Risk Management Intelligence Report", 10, 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Project Area: ${projectName}`, 10, 22);

    // Main Content
    doc.addImage(imgData, "PNG", 10, 35, imgWidth, imgHeight);

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Confidential Research Data - Integrated GIS/SQL Assessment System - Generated: ${new Date().toLocaleString()}`,
      10,
      pageHeight - 10
    );
    
    doc.save(`${projectName.replace(/\s+/g, '_')}_Flood_Report.pdf`);
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  }
};
