import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

const ENTITY_CONFIGS = {
  Talent: { displayName: 'Talent', icon: '👤' },
  Brand: { displayName: 'Brands', icon: '🏢' },
  Partnership: { displayName: 'Partnerships', icon: '🤝' },
  MarketplaceOpportunity: { displayName: 'Opportunities', icon: '⭐' },
};

export default function ImportWizard({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1); // 1: select entity, 2: upload, 3: preview, 4: import
  const [selectedEntity, setSelectedEntity] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    // Parse CSV
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1, 6).map(line => {
      const values = line.split(',');
      return headers.reduce((acc, header, idx) => {
        acc[header] = values[idx]?.trim() || '';
        return acc;
      }, {});
    });

    setPreview({ headers, rows });
    setStep(3);
  };

  const handleImport = async () => {
    if (!selectedEntity || !file) return;

    setImporting(true);
    setError(null);

    try {
      const text = await file.text();
      const result = await base44.functions.invoke('importEntityData', {
        entityName: selectedEntity,
        csvData: text,
        fieldMapping,
      });

      setImportResult(result.data);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedEntity("");
    setFile(null);
    setPreview(null);
    setFieldMapping({});
    setError(null);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Import Data</DialogTitle></DialogHeader>

        {/* Step 1: Select Entity */}
        {step === 1 && (
          <div className="space-y-4 pt-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-2 block">Select Entity Type</span>
              <Select value={selectedEntity} onValueChange={(val) => { setSelectedEntity(val); setStep(2); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose entity..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENTITY_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
        )}

        {/* Step 2: Upload File */}
        {step === 2 && (
          <div className="space-y-4 pt-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-700 mb-1">Upload CSV file</p>
              <p className="text-xs text-slate-500 mb-4">Maximum 10,000 rows</p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button asChild variant="outline">
                  <span>Select File</span>
                </Button>
              </label>
              {file && <p className="text-sm text-emerald-600 mt-2">✓ {file.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Map */}
        {step === 3 && preview && (
          <div className="space-y-4 pt-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Preview ({preview.rows.length} rows)</h3>
              <div className="bg-slate-50 rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {preview.headers.map(h => <th key={h} className="px-3 py-2 text-left font-medium text-slate-700">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200 last:border-0">
                        {preview.headers.map(h => <td key={h} className="px-3 py-2 text-slate-600">{row[h]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleImport} disabled={importing} className="bg-indigo-600 hover:bg-indigo-700">
                {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Import {preview.rows.length} Records
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && importResult && (
          <div className="space-y-4 pt-4">
            <div className={`rounded-lg p-4 flex gap-3 ${importResult.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {importResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${importResult.success ? 'text-emerald-900' : 'text-red-900'}`}>
                  {importResult.success ? 'Import Complete' : 'Import Failed'}
                </p>
                <p className={`text-sm mt-1 ${importResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                  {importResult.message}
                </p>
              </div>
            </div>
            {importResult.errors?.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-900 mb-2">Errors:</p>
                <ul className="space-y-1">
                  {importResult.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx} className="text-xs text-amber-700">• {err}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>Import Another</Button>
              <Button onClick={() => { onOpenChange(false); onSuccess?.(); }} className="bg-indigo-600 hover:bg-indigo-700">Done</Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}