import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import ImportWizard from "@/components/datatools/ImportWizard";
import ExportPanel from "@/components/datatools/ExportPanel";

export default function DataImportExport() {
  const [importOpen, setImportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Data Import & Export</h1>
        <p className="text-slate-600 mt-2">Bulk import data from CSV or export your records in various formats</p>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="w-4 h-4" /> Import Data
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="w-4 h-4" /> Export Data
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Bulk Import</h2>
            <p className="text-sm text-slate-700 mb-4">Upload CSV files to quickly add talent, brands, partnerships, and more to your platform.</p>
            <Button onClick={() => setImportOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Upload className="w-4 h-4" /> Start Import
            </Button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Import Guide</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900 mb-1">📋 CSV Format</p>
                <p>First row must contain column headers. Subsequent rows are data records.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">📊 Supported Entities</p>
                <p>Talent, Brands, Partnerships, Marketplace Opportunities, and more.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">✓ Validation</p>
                <p>Each row is validated before import. Failed rows are reported with error details.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">🔄 Max Size</p>
                <p>Up to 10,000 rows per import. For larger datasets, split into multiple files.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <ExportPanel key={refreshKey} />

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Export Guide</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900 mb-1">📄 CSV Format</p>
                <p>Standard comma-separated values. Compatible with Excel, Google Sheets, and other spreadsheet tools.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">{ '}' } JSON Format</p>
                <p>Structured JSON format suitable for APIs and programmatic processing.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">📊 Excel Format</p>
                <p>Excel workbook with formatted headers and proper data types.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">📊 Full Records</p>
                <p>Exports include all fields and the complete dataset for selected entity.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ImportWizard 
        open={importOpen} 
        onOpenChange={setImportOpen}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}