import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Briefcase, TrendingUp, Clock, Users, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters.jsx";
import OpportunityCard from "@/components/marketplace/OpportunityCard.jsx";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  withdrawn: "bg-slate-50 text-slate-600 border-slate-200",
};

const OPP_STATUS_COLORS = {
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-red-50 text-red-600 border-red-200",
  expired: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    budget_min: null,
    budget_max: null,
    contract_type: null,
    niches: [],
    platforms: [],
    minFollowers: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["opportunities", filters, searchTerm],
    queryFn: async () => {
      let query = { status: "published" };
      if (searchTerm) query.title = { $regex: searchTerm };
      if (filters.budget_min) query.budget_min = { $gte: filters.budget_min };
      if (filters.budget_max) query.budget_max = { $lte: filters.budget_max };
      if (filters.contract_type) query.contract_type = filters.contract_type;
      return base44.entities.MarketplaceOpportunity.filter(query, "-created_date", 50);
    },
  });

  // Brand: posted opportunities (all statuses)
  const { data: postedOpportunities, isLoading: loadingPosted } = useQuery({
    queryKey: ["postedOpportunities"],
    queryFn: () => base44.entities.MarketplaceOpportunity.list("-created_date", 100),
    enabled: !!user && (user.role === "brand" || user.role === "admin"),
  });

  // Applications for posted opps (to get applicant counts)
  const { data: allApplications = [] } = useQuery({
    queryKey: ["allApplications"],
    queryFn: () => base44.entities.OpportunityApplication.list("-created_date", 500),
    enabled: !!user && (user.role === "brand" || user.role === "admin"),
  });

  // Talent: my applications enriched with opportunity titles
  const { data: rawApplications } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => user?.email
      ? base44.entities.OpportunityApplication.filter({ talent_email: user.email })
      : Promise.resolve([]),
    enabled: !!user && user.role !== "admin" && user.role !== "brand",
  });

  // All published opps for lookup (to enrich applications with titles)
  const { data: allOpportunities = [] } = useQuery({
    queryKey: ["allOpportunitiesLookup"],
    queryFn: () => base44.entities.MarketplaceOpportunity.list("-created_date", 500),
    enabled: !!user && user.role !== "admin" && user.role !== "brand",
  });

  // Build a lookup map: opportunity_id → title
  const opportunityTitleMap = Object.fromEntries(
    (allOpportunities || []).map(o => [o.id, o])
  );

  // Enrich applications with opportunity details
  const myApplications = (rawApplications || []).map(app => ({
    ...app,
    opportunity: opportunityTitleMap[app.opportunity_id] || null,
    opportunity_title: opportunityTitleMap[app.opportunity_id]?.title || `Opportunity #${app.opportunity_id?.slice(0, 8) ?? '—'}`,
    opportunity_brand: opportunityTitleMap[app.opportunity_id]?.brand_name || '',
  }));

  // For each posted opportunity, count applications
  const applicationsByOpp = (allApplications || []).reduce((acc, app) => {
    acc[app.opportunity_id] = (acc[app.opportunity_id] || 0) + 1;
    return acc;
  }, {});

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isBrand = user.role === "brand" || user.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partnership Marketplace</h1>
          <p className="text-slate-600 mt-1">Find the perfect collaboration opportunities</p>
        </div>
        {isBrand && (
          <Link to={createPageUrl("CreateOpportunity")}>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Post Opportunity
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isBrand ? "grid-cols-2" : "grid-cols-2"}`}>
          <TabsTrigger value="browse">{isBrand ? "All Opportunities" : "Browse Opportunities"}</TabsTrigger>
          {isBrand
            ? <TabsTrigger value="posted">My Posted Opportunities</TabsTrigger>
            : <TabsTrigger value="applications">My Applications</TabsTrigger>
          }
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>

          {showFilters && <MarketplaceFilters onFiltersChange={setFilters} />}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                  <div className="h-5 bg-slate-100 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="h-16 bg-slate-100 rounded mb-4" />
                  <div className="h-8 bg-slate-100 rounded w-24" />
                </div>
              ))}
            </div>
          ) : opportunities?.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600">No opportunities found. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  userRole={user.role}
                  onApply={() => navigate(createPageUrl(`OpportunityDetail?id=${opp.id}`))}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Applications Tab (talent) */}
        {!isBrand && (
          <TabsContent value="applications" className="space-y-4">
            {myApplications?.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600">You haven't applied to any opportunities yet.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("browse")}
                  >
                    Browse Opportunities
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myApplications?.map((app) => (
                  <Card key={app.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{app.opportunity_title}</CardTitle>
                          {app.opportunity_brand && (
                            <p className="text-sm text-slate-500 mt-0.5">{app.opportunity_brand}</p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 capitalize ${STATUS_COLORS[app.status] || "bg-slate-50 text-slate-600"}`}
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {app.message && (
                        <p className="text-sm text-slate-600 line-clamp-2">{app.message}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {app.opportunity && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(createPageUrl(`OpportunityDetail?id=${app.opportunity_id}`))}
                        >
                          View Opportunity
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* My Posted Opportunities Tab (brand) */}
        {isBrand && (
          <TabsContent value="posted" className="space-y-4">
            {loadingPosted ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                    <div className="h-5 bg-slate-100 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : !postedOpportunities?.length ? (
              <Card className="text-center py-10">
                <CardContent>
                  <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <h3 className="font-semibold text-slate-700 mb-1">No opportunities posted yet</h3>
                  <p className="text-sm text-slate-500 mb-4">Post your first opportunity to start finding talent.</p>
                  <Link to={createPageUrl("CreateOpportunity")}>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" /> Post Opportunity
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {postedOpportunities.map((opp) => {
                  const appCount = applicationsByOpp[opp.id] || 0;
                  return (
                    <Card key={opp.id} className="border-slate-200/60">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-sm font-semibold text-slate-800 truncate">{opp.title}</h3>
                              <Badge
                                variant="outline"
                                className={`shrink-0 text-[11px] capitalize ${OPP_STATUS_COLORS[opp.status] || ""}`}
                              >
                                {opp.status}
                              </Badge>
                            </div>
                            {opp.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{opp.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {appCount} application{appCount !== 1 ? "s" : ""}
                              </span>
                              {(opp.budget_min || opp.budget_max) && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {opp.budget_min ? `$${opp.budget_min.toLocaleString()}` : ""}
                                  {opp.budget_min && opp.budget_max ? " – " : ""}
                                  {opp.budget_max ? `$${opp.budget_max.toLocaleString()}` : ""}
                                </span>
                              )}
                              {opp.timeline_end && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Deadline: {new Date(opp.timeline_end).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => navigate(createPageUrl(`OpportunityDetail?id=${opp.id}`))}
                          >
                            Manage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
