import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Image, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function ExportPanel({ dashboardRef, selectedData, onClose }) {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210 - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");

      let yPosition = 10;

      // Add title
      pdf.setFontSize(16);
      pdf.text("Demographic Insights Report", 10, yPosition);
      yPosition += 15;

      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, yPosition);
      pdf.text(`Segments: ${selectedData.length}`, 10, yPosition + 6);
      yPosition += 15;

      // Add chart image
      if (imgHeight > 0) {
        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
      }

      pdf.save("demographic-insights.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ["Segment Name", "Population Size", "Buying Power", "Media Preferences"];
      const rows = selectedData.map((d) => [
        d.name,
        d.population_size,
        d.buying_power,
        d.media_preferences ? d.media_preferences.substring(0, 50) : "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "demographic-data.csv");
      link.click();
    } catch (error) {
      console.error("CSV export failed:", error);
      alert("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const exportToPNG = async () => {
    setExporting(true);
    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "demographic-insights.png";
      link.click();
    } catch (error) {
      console.error("PNG export failed:", error);
      alert("Failed to export image");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="text-base">Export Visualizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={exportToPDF}
            disabled={exporting}
            className="flex items-center justify-center gap-2"
            variant="outline"
          >
            {exporting && exportFormat === "pdf" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Export as PDF
          </Button>

          <Button
            onClick={exportToCSV}
            disabled={exporting}
            className="flex items-center justify-center gap-2"
            variant="outline"
          >
            {exporting && exportFormat === "csv" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export as CSV
          </Button>

          <Button
            onClick={exportToPNG}
            disabled={exporting}
            className="flex items-center justify-center gap-2"
            variant="outline"
          >
            {exporting && exportFormat === "png" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Image className="w-4 h-4" />
            )}
            Export as PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}