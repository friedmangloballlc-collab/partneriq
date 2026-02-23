import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, Briefcase, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import OpportunityCard from "@/components/marketplace/OpportunityCard";

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

  const { data: myApplications } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => user?.email ? base44.entities.OpportunityApplication.filter({ talent_email: user.email }) : Promise.resolve([]),
    enabled: !!user && user.role !== "admin" && user.role !== "brand",
  });

  if (!user) return <div className="flex items-center justify-center h-screen">Loading...</div>;

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
        <TabsList className="grid w-full grid-cols-2">
          {!isBrand && <TabsTrigger value="browse">Browse Opportunities</TabsTrigger>}
          {!isBrand && <TabsTrigger value="applications">My Applications</TabsTrigger>}
          {isBrand && <TabsTrigger value="browse">All Opportunities</TabsTrigger>}
          {isBrand && <TabsTrigger value="posted">My Posted Opportunities</TabsTrigger>}
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-4">
          {/* Search & Filters */}
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

          {/* Opportunities Grid */}
          {isLoading ? (
            <div className="text-center py-8">Loading opportunities...</div>
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

        {/* My Applications Tab */}
        {!isBrand && (
          <TabsContent value="applications" className="space-y-4">
            {myApplications?.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600">You haven't applied to any opportunities yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myApplications?.map((app) => (
                  <Card key={app.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{app.opportunity_id}</CardTitle>
                      <Badge variant="outline" className="w-fit">{app.status}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-3">{app.cover_letter}</p>
                      <Button variant="outline" size="sm">View Application</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* My Posted Opportunities Tab */}
        {isBrand && (
          <TabsContent value="posted">
            <div className="text-center py-8">
              <p className="text-slate-600">Manage your posted opportunities here</p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}