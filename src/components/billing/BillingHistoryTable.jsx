import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingHistoryTable({ invoices = [] }) {
  const statusColors = {
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const userTypeColors = {
    talent: "bg-blue-100 text-blue-700",
    brand: "bg-indigo-100 text-indigo-700",
    agency: "bg-purple-100 text-purple-700"
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <p className="text-slate-500">No invoices found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 font-semibold text-slate-700">Date</th>
                <th className="text-left p-4 font-semibold text-slate-700">Type</th>
                <th className="text-left p-4 font-semibold text-slate-700">Plan</th>
                <th className="text-left p-4 font-semibold text-slate-700">Amount</th>
                <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 font-semibold text-slate-700">Period</th>
                <th className="text-left p-4 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    {invoice.paid_at 
                      ? format(new Date(invoice.paid_at), "MMM d, yyyy")
                      : format(new Date(invoice.created_date), "MMM d, yyyy")}
                  </td>
                  <td className="p-4">
                    <Badge className={`text-[10px] ${userTypeColors[invoice.user_type]}`}>
                      {invoice.user_type.charAt(0).toUpperCase() + invoice.user_type.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium text-slate-900">{invoice.plan}</td>
                  <td className="p-4 font-semibold text-slate-900">${invoice.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <Badge 
                      className={`text-[10px] border ${statusColors[invoice.status]}`}
                      variant="outline"
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-600 text-xs">
                    {format(new Date(invoice.period_start), "MMM d")} - {format(new Date(invoice.period_end), "MMM d, yyyy")}
                  </td>
                  <td className="p-4">
                    {invoice.invoice_url ? (
                      <a 
                        href={invoice.invoice_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-xs">Download</span>
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