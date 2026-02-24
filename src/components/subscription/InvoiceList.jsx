import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function InvoiceList({ invoices = [], isLoading = false, onDownload }) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-600" /></div>;
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No invoices yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">Invoice {invoice.number}</p>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] ${
                    invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    invoice.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-600'
                  }`}
                >
                  {invoice.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">{format(new Date(invoice.date), 'MMM d, yyyy')} • ${(invoice.amount / 100).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {invoice.pdf_url && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDownload?.(invoice.pdf_url)}
                className="gap-1 text-indigo-600 hover:text-indigo-700"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}