import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Download, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingHistory({ invoices = [] }) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">No invoices yet</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Billing History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                <th className="text-left p-3 font-semibold text-slate-700">Plan</th>
                <th className="text-left p-3 font-semibold text-slate-700">Amount</th>
                <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                <th className="text-left p-3 font-semibold text-slate-700">Period</th>
                <th className="text-left p-3 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3">
                    {invoice.paid_at 
                      ? format(new Date(invoice.paid_at), "MMM d, yyyy")
                      : format(new Date(invoice.created_date), "MMM d, yyyy")}
                  </td>
                  <td className="p-3 font-medium text-slate-900">{invoice.plan}</td>
                  <td className="p-3 font-semibold text-slate-900">${invoice.amount.toFixed(2)}</td>
                  <td className="p-3">
                    <Badge 
                      className={`text-[10px] border ${statusColors[invoice.status] || statusColors.pending}`}
                      variant="outline"
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-3 text-slate-600">
                    {format(new Date(invoice.period_start), "MMM d")} - {format(new Date(invoice.period_end), "MMM d")}
                  </td>
                  <td className="p-3">
                    {invoice.invoice_url ? (
                      <a 
                        href={invoice.invoice_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}