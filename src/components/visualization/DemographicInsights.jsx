import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Settings } from "lucide-react";
import PopulationChart from "./PopulationChart";
import BuyingPowerChart from "./BuyingPowerChart";
import ExportPanel from "./ExportPanel";
import KPICards from "./KPICards";

export default function DemographicInsights({ demographics, selectedDemographics }) {
  const [showExport, setShowExport] = useState(false);
  const dashboardRef = useRef(null);

  const selectedData = demographics.filter(d => selectedDemographics.has(d.id));

  if (selectedData.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-12 text-center text-slate-500">
          Select demographics to view insights and visualizations
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Demographic Insights</h2>
          <p className="text-sm text-slate-500 mt-1">
            {selectedData.length} segment{selectedData.length !== 1 ? "s" : ""} selected
          </p>
        </div>
        <Button
          onClick={() => setShowExport(!showExport)}
          className="bg-indigo-600 hover:bg-indigo-700"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Export panel */}
      {showExport && (
        <ExportPanel
          dashboardRef={dashboardRef}
          selectedData={selectedData}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* KPI Cards */}
      <KPICards selectedData={selectedData} />

      {/* Charts container */}
      <div ref={dashboardRef} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PopulationChart selectedData={selectedData} />
          <BuyingPowerChart selectedData={selectedData} />
        </div>
      </div>
    </div>
  );
}