import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";

const EXPORT_OPTIONS = [
  { value: 'csv', label: 'CSV (.csv)', icon: '📄' },
  { value: 'json', label: 'JSON (.json)', icon: '{ }' },
  { value: 'excel', label: 'Excel (.xlsx)', icon: '📊' },
];

const ENTITY_OPTIONS = [
  { value: 'Talent', label: '👤 Talent' },
  { value: 'Brand', label: '🏢 Brands' },
  { value: 'Partnership', label: '🤝 Partnerships' },
  { value: 'MarketplaceOpportunity', label: '⭐ Opportunities' },
  { value: 'OutreachEmail', label: '✉️ Outreach Emails' },
];

export default function ExportPanel() {
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedEntity) return;

    setExporting(true);
    try {
      const result = await base44.functions.invoke('exportEntityData', {
        entityName: selectedEntity,
        format: selectedFormat,
      });

      // Create download link
      const blob = new Blob([result.data.content], { type: result.data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Export Data</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Entity Type</label>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity..." />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.icon} {opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleExport} 
        disabled={!selectedEntity || exporting}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Export to {selectedFormat.toUpperCase()}
      </Button>
    </div>
  );
}