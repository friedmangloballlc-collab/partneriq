import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import BillingHistoryTable from "@/components/billing/BillingHistoryTable";

export default function BillingHistory() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(user => setUserEmail(user.email));
  }, []);

  const { data: talentHistory = [], isLoading: talentLoading } = useQuery({
    queryKey: ["billing-history", "talent"],
    enabled: !!userEmail,
    queryFn: async () => {
      const history = await base44.asServiceRole.entities.BillingHistory.filter({
        user_email: userEmail,
        user_type: "talent"
      }, "-created_date", 100);
      return history;
    }
  });

  const { data: brandHistory = [], isLoading: brandLoading } = useQuery({
    queryKey: ["billing-history", "brand"],
    enabled: !!userEmail,
    queryFn: async () => {
      const history = await base44.asServiceRole.entities.BillingHistory.filter({
        user_email: userEmail,
        user_type: "brand"
      }, "-created_date", 100);
      return history;
    }
  });

  const { data: agencyHistory = [], isLoading: agencyLoading } = useQuery({
    queryKey: ["billing-history", "agency"],
    enabled: !!userEmail,
    queryFn: async () => {
      const history = await base44.asServiceRole.entities.BillingHistory.filter({
        user_email: userEmail,
        user_type: "agency"
      }, "-created_date", 100);
      return history;
    }
  });

  const isLoading = talentLoading || brandLoading || agencyLoading;

  const totalPaid = [...talentHistory, ...brandHistory, ...agencyHistory]
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = [...talentHistory, ...brandHistory, ...agencyHistory]
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing History</h1>
        <p className="text-slate-600 mt-2">View and download all your invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-emerald-700">${totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        {pendingAmount > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-700">${pendingAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invoices by User Type */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="talent">Talent</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="agency">Agency</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : [...talentHistory, ...brandHistory, ...agencyHistory].length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No invoices yet</p>
              </CardContent>
            </Card>
          ) : (
            <BillingHistoryTable invoices={[...talentHistory, ...brandHistory, ...agencyHistory].sort((a, b) => 
              new Date(b.created_date) - new Date(a.created_date)
            )} />
          )}
        </TabsContent>

        <TabsContent value="talent" className="mt-6">
          {talentLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : talentHistory.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No talent invoices</p>
              </CardContent>
            </Card>
          ) : (
            <BillingHistoryTable invoices={talentHistory} />
          )}
        </TabsContent>

        <TabsContent value="brand" className="mt-6">
          {brandLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : brandHistory.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No brand invoices</p>
              </CardContent>
            </Card>
          ) : (
            <BillingHistoryTable invoices={brandHistory} />
          )}
        </TabsContent>

        <TabsContent value="agency" className="mt-6">
          {agencyLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : agencyHistory.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No agency invoices</p>
              </CardContent>
            </Card>
          ) : (
            <BillingHistoryTable invoices={agencyHistory} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}