import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreHorizontal, Eye, Edit, X, DollarSign, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const statusColors = {
  draft: "bg-slate-100 text-slate-800",
  published: "bg-emerald-100 text-emerald-800",
  closed: "bg-amber-100 text-amber-800",
  archived: "bg-slate-100 text-slate-600",
};

export default function BrandDashboard() {
  const [user, setUser] = useState(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["brand-opportunities", user?.email],
    queryFn: () => {
      if (!user?.email) return [];
      return base44.entities.MarketplaceOpportunity.filter({
        created_by: user.email,
      });
    },
    enabled: !!user?.email,
  });

  const closeOpportunityMutation = useMutation({
    mutationFn: (id) =>
      base44.entities.MarketplaceOpportunity.update(id, { status: "closed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-opportunities"] });
      setCloseDialogOpen(false);
      setSelectedOpportunity(null);
    },
  });

  const handleCloseClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setCloseDialogOpen(true);
  };

  const handleConfirmClose = () => {
    if (selectedOpportunity) {
      closeOpportunityMutation.mutate(selectedOpportunity.id);
    }
  };

  const stats = {
    total: opportunities.length,
    published: opportunities.filter((o) => o.status === "published").length,
    draft: opportunities.filter((o) => o.status === "draft").length,
    closed: opportunities.filter((o) => o.status === "closed").length,
    totalApplications: opportunities.reduce(
      (sum, o) => sum + (o.applications_count || 0),
      0
    ),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.published}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              {stats.draft}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.closed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.totalApplications}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Opportunities</CardTitle>
          <Link to={createPageUrl("CreateOpportunity")}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Opportunity
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">
                No opportunities posted yet
              </p>
              <Link to={createPageUrl("CreateOpportunity")}>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Create Your First Opportunity
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-4 h-4" />
                        Applications
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="w-4 h-4" />
                        Budget
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Timeline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell className="font-medium max-w-sm truncate">
                        {opp.title}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {opp.contract_type}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {opp.applications_count || 0}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {opp.budget_min && opp.budget_max ? (
                          <span className="text-slate-700">
                            ${opp.budget_min.toLocaleString()} -{" "}
                            ${opp.budget_max.toLocaleString()}
                          </span>
                        ) : opp.budget_min ? (
                          <span className="text-slate-700">
                            ${opp.budget_min.toLocaleString()}+
                          </span>
                        ) : (
                          <span className="text-slate-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[opp.status]}>
                          {opp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-slate-600">
                        {opp.timeline_start ? (
                          <div className="flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(opp.timeline_start), "MMM d")}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                window.location.href = createPageUrl(
                                  `Marketplace?opportunity=${opp.id}`
                                )
                              }
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                window.location.href = createPageUrl(
                                  `CreateOpportunity?edit=${opp.id}`
                                )
                              }
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            {opp.status !== "closed" && (
                              <DropdownMenuItem
                                onClick={() => handleCloseClick(opp)}
                                className="gap-2 text-red-600"
                              >
                                <X className="w-4 h-4" /> Close Opportunity
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the opportunity and stop accepting applications.
              You can always reopen it later by editing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleConfirmClose}>
            Close Opportunity
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}